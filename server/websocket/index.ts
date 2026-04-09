import { WebSocketServer, WebSocket } from 'ws';
import { spawnGemini, abortGeminiSession } from '../gemini-cli.js';
import { execSync } from 'child_process';
import pty from 'node-pty';

const connectedClients = new Set<WebSocket>();

export function setupWebSockets(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket, request: any) => {
    const url = request.url;
    const urlObj = new URL(url, 'http://localhost');
    const pathname = urlObj.pathname;
    
    if (pathname === '/shell') {
      handleShellConnection(ws);
    } else if (pathname === '/ws') {
      handleChatConnection(ws);
    } else {
      ws.close();
    }
  });
}

export function getConnectedClients() {
  return connectedClients;
}

function handleChatConnection(ws: WebSocket) {
  connectedClients.add(ws);
  
  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'gemini-command') {
        await spawnGemini(data.command, data.options, ws);
      } else if (data.type === 'abort-session') {
        const success = abortGeminiSession(data.sessionId);
        ws.send(JSON.stringify({
          type: 'session-aborted',
          sessionId: data.sessionId,
          success
        }));
      }
    } catch (error: any) {
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });
  
  ws.on('close', () => {
    connectedClients.delete(ws);
  });
}

function handleShellConnection(ws: WebSocket) {
  let shellProcess: any = null;
  
  ws.on('message', async (message: string) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'init') {
        const projectPath = data.projectPath || process.cwd();
        const sessionId = data.sessionId;
        const hasSession = data.hasSession;
        
        const welcomeMsg = hasSession ? 
          `\x1b[36mResuming Gemini session ${sessionId} in: ${projectPath}\x1b[0m\r\n` :
          `\x1b[36mStarting new Gemini session in: ${projectPath}\x1b[0m\r\n`;
        
        ws.send(JSON.stringify({
          type: 'output',
          data: welcomeMsg
        }));
        
        try {
          const geminiPath = process.env.GEMINI_PATH || 'gemini';
          
          try {
            execSync(`which ${geminiPath}`, { stdio: 'ignore' });
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'output',
              data: `\r\n\x1b[31mError: Gemini CLI not found. Please check:\x1b[0m\r\n\x1b[33m1. Install gemini globally: npm install -g @google/generative-ai-cli\x1b[0m\r\n\x1b[33m2. Or set GEMINI_PATH in .env file\x1b[0m\r\n`
            }));
            return;
          }
          
          let geminiCommand = geminiPath;
          
          if (hasSession && sessionId) {
            geminiCommand = `${geminiPath} --resume ${sessionId} || ${geminiPath}`;
          }
          
          const shellCommand = `cd "${projectPath}" && ${geminiCommand}`;
          
          shellProcess = pty.spawn('bash', ['-c', shellCommand], {
            name: 'xterm-256color',
            cols: 80,
            rows: 24,
            cwd: process.env.HOME || '/',
            env: { 
              ...process.env,
              TERM: 'xterm-256color',
              COLORTERM: 'truecolor',
              FORCE_COLOR: '3',
              BROWSER: 'echo "OPEN_URL:"'
            } as any
          });
          
          shellProcess.onData((data: string) => {
            if (ws.readyState === ws.OPEN) {
              let outputData = data;
              
              const patterns = [
                /(?:xdg-open|open|start)\s+(https?:\/\/[^\s\x1b\x07]+)/g,
                /OPEN_URL:\s*(https?:\/\/[^\s\x1b\x07]+)/g,
                /Opening\s+(https?:\/\/[^\s\x1b\x07]+)/gi,
                /Visit:\s*(https?:\/\/[^\s\x1b\x07]+)/gi,
                /View at:\s*(https?:\/\/[^\s\x1b\x07]+)/gi,
                /Browse to:\s*(https?:\/\/[^\s\x1b\x07]+)/gi
              ];
              
              patterns.forEach(pattern => {
                let match;
                while ((match = pattern.exec(data)) !== null) {
                  const url = match[1];
                  
                  ws.send(JSON.stringify({
                    type: 'url_open',
                    url: url
                  }));
                  
                  if (pattern.source.includes('OPEN_URL')) {
                    outputData = outputData.replace(match[0], `🌐 Opening in browser: ${url}`);
                  }
                }
              });
              
              ws.send(JSON.stringify({
                type: 'output',
                data: outputData
              }));
            }
          });
          
          shellProcess.onExit((exitCode: any) => {
            if (ws.readyState === ws.OPEN) {
              ws.send(JSON.stringify({
                type: 'output',
                data: `\r\n\x1b[33mProcess exited with code ${exitCode.exitCode}${exitCode.signal ? ` (${exitCode.signal})` : ''}\x1b[0m\r\n`
              }));
            }
            shellProcess = null;
          });
          
        } catch (spawnError: any) {
          ws.send(JSON.stringify({
            type: 'output',
            data: `\r\n\x1b[31mError: ${spawnError.message}\x1b[0m\r\n`
          }));
        }
        
      } else if (data.type === 'input') {
        if (shellProcess && shellProcess.write) {
          try {
            shellProcess.write(data.data);
          } catch (error) {
            // ignore
          }
        }
      } else if (data.type === 'resize') {
        if (shellProcess && shellProcess.resize) {
          shellProcess.resize(data.cols, data.rows);
        }
      }
    } catch (error: any) {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'output',
          data: `\r\n\x1b[31mError: ${error.message}\x1b[0m\r\n`
        }));
      }
    }
  });
  
  ws.on('close', () => {
    if (shellProcess && shellProcess.kill) {
      shellProcess.kill();
    }
  });
  
  ws.on('error', (error) => {
    // console.error('❌ Shell WebSocket error:', error);
  });
}

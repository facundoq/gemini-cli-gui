import { useRef, useState, useCallback } from 'react';

export const useShellWebSocket = (selectedProject, selectedSession, terminal) => {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWebSocket = useCallback(async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('No authentication token');
      
      let wsBaseUrl;
      try {
        const configResponse = await fetch('/api/config', { headers: { 'Authorization': `Bearer ${token}` } });
        const config = await configResponse.json();
        wsBaseUrl = config.wsUrl;
        
        if (wsBaseUrl.includes('localhost') && !window.location.hostname.includes('localhost')) {
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const apiPort = window.location.port === '4009' ? '4008' : window.location.port;
          wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
        }
      } catch (error) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const apiPort = window.location.port === '4009' ? '4008' : window.location.port;
        wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
      }
      
      const wsUrl = `${wsBaseUrl}/shell?token=${encodeURIComponent(token)}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        
        setTimeout(() => {
          if (terminal.current && ws.current?.readyState === WebSocket.OPEN) {
            const currentSessionId = selectedSession?.id || selectedSession?.sessionId;
            ws.current.send(JSON.stringify({
              type: 'init',
              projectPath: selectedProject.fullPath || selectedProject.path,
              sessionId: currentSessionId,
              hasSession: !!currentSessionId,
              cols: terminal.current.cols,
              rows: terminal.current.rows
            }));
          }
        }, 200);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'output') {
            terminal.current?.write(data.data);
          } else if (data.type === 'url_open') {
            window.open(data.url, '_blank');
          }
        } catch (error) {}
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        if (terminal.current) {
          terminal.current.write('\r\n\x1b[1;31mConnection closed.\x1b[0m\r\n');
        }
      };

      ws.current.onerror = () => {
        setIsConnected(false);
        setIsConnecting(false);
        terminal.current?.write('\r\n\x1b[1;31mConnection error.\x1b[0m\r\n');
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
      setIsConnecting(false);
      terminal.current?.write(`\x1b[1;31mFailed to connect: ${error.message}\x1b[0m\r\n`);
    }
  }, [selectedProject, selectedSession, terminal, isConnecting, isConnected]);

  const disconnectWebSocket = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    if (terminal.current) {
      terminal.current.clear();
      terminal.current.write('\x1b[2J\x1b[H');
    }
  }, [terminal]);

  const sendInput = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'input', data }));
    }
  }, []);

  const sendResize = useCallback((cols, rows) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'resize', cols, rows }));
    }
  }, []);

  return { ws, isConnected, isConnecting, connectWebSocket, disconnectWebSocket, sendInput, sendResize };
};

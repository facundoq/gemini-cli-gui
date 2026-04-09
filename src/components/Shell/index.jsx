import React, { useEffect, useRef, useState, useCallback } from 'react';
import ShellHeader from './ShellHeader';
import ShellOverlay from './ShellOverlay';
import { useTerminal } from './hooks/useTerminal';
import { useShellWebSocket } from './hooks/useShellWebSocket';

function Shell({ selectedProject, selectedSession, isActive }) {
  const terminalRef = useRef(null);
  const [isRestarting, setIsRestarting] = useState(false);
  const [lastSessionId, setLastSessionId] = useState(null);

  const { 
    terminal, 
    fitAddon, 
    isInitialized, 
    initTerminal, 
    cleanupTerminal, 
    disposeTerminal, 
    setIsInitialized 
  } = useTerminal(selectedProject, selectedSession, isRestarting, terminalRef);

  const { 
    ws, 
    isConnected, 
    isConnecting, 
    connectWebSocket, 
    disconnectWebSocket, 
    sendInput, 
    sendResize 
  } = useShellWebSocket(selectedProject, selectedSession, terminal);

  // Restart shell function
  const restartShell = useCallback(() => {
    setIsRestarting(true);
    disconnectWebSocket();
    disposeTerminal();
    
    setTimeout(() => {
      setIsRestarting(false);
    }, 200);
  }, [disconnectWebSocket, disposeTerminal]);

  // Watch for session changes and disconnect
  useEffect(() => {
    const currentSessionId = selectedSession?.id || null;
    if (lastSessionId !== null && lastSessionId !== currentSessionId && isInitialized) {
      disconnectWebSocket();
    }
    setLastSessionId(currentSessionId);
  }, [selectedSession?.id, isInitialized, lastSessionId, disconnectWebSocket]);

  // Initialize terminal
  useEffect(() => {
    const result = initTerminal();
    if (result && result.terminal) {
      // Re-attached to existing session
      // console.log('Re-attached to shell session');
    }

    return () => {
      cleanupTerminal(ws.current, isConnected);
    };
  }, [initTerminal, cleanupTerminal, ws, isConnected]);

  // Handle terminal input & resize
  useEffect(() => {
    if (!terminal.current || !isInitialized) return;

    const dataDisposable = terminal.current.onData((data) => {
      sendInput(data);
    });

    const resizeObserver = new ResizeObserver(() => {
      if (fitAddon.current && terminal.current) {
        setTimeout(() => {
          fitAddon.current.fit();
          sendResize(terminal.current.cols, terminal.current.rows);
        }, 50);
      }
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      dataDisposable.dispose();
      resizeObserver.disconnect();
    };
  }, [isInitialized, terminal, fitAddon, sendInput, sendResize]);

  // Fit terminal when tab becomes active
  useEffect(() => {
    if (isActive && isInitialized && fitAddon.current && terminal.current) {
      setTimeout(() => {
        fitAddon.current.fit();
        sendResize(terminal.current.cols, terminal.current.rows);
      }, 100);
    }
  }, [isActive, isInitialized, sendResize, terminal, fitAddon]);

  if (!selectedProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Select a Project</h3>
          <p className="text-sm">Choose a project to open an interactive shell in that directory</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 w-full overflow-hidden">
      <ShellHeader 
        isConnected={isConnected}
        selectedSession={selectedSession}
        isInitialized={isInitialized}
        isRestarting={isRestarting}
        onDisconnect={disconnectWebSocket}
        onRestart={restartShell}
      />

      <div className="flex-1 p-2 overflow-hidden relative">
        <div ref={terminalRef} className="h-full w-full focus:outline-none" style={{ outline: 'none' }} />
        
        <ShellOverlay 
          isInitialized={isInitialized}
          isConnected={isConnected}
          isConnecting={isConnecting}
          selectedSession={selectedSession}
          selectedProject={selectedProject}
          onConnect={connectWebSocket}
        />
      </div>
    </div>
  );
}

export default Shell;

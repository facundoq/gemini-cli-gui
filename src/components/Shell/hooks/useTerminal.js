import { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { ClipboardAddon } from '@xterm/addon-clipboard';
import { WebglAddon } from '@xterm/addon-webgl';
import 'xterm/css/xterm.css';

// Global store for shell sessions to persist across tab switches
const shellSessions = new Map();

export const useTerminal = (selectedProject, selectedSession, isRestarting, terminalRef) => {
  const terminal = useRef(null);
  const fitAddon = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initTerminal = useCallback(() => {
    if (!terminalRef.current || !selectedProject || isRestarting) return;

    const sessionKey = selectedSession?.id || `project-${selectedProject.name}`;
    const existingSession = shellSessions.get(sessionKey);

    if (existingSession && !terminal.current) {
      try {
        terminal.current = existingSession.terminal;
        fitAddon.current = existingSession.fitAddon;
        
        if (terminal.current.element && terminal.current.element.parentNode) {
          terminal.current.element.parentNode.removeChild(terminal.current.element);
        }
        
        terminal.current.open(terminalRef.current);
        setTimeout(() => fitAddon.current?.fit(), 100);
        setIsInitialized(true);
        return { terminal: terminal.current, fitAddon: fitAddon.current, ws: existingSession.ws, isConnected: existingSession.isConnected };
      } catch (error) {
        shellSessions.delete(sessionKey);
      }
    }

    if (terminal.current) return null;

    terminal.current = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      allowProposedApi: true,
      scrollback: 10000,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#ffffff',
      }
    });

    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);
    terminal.current.loadAddon(new ClipboardAddon());
    
    try {
      terminal.current.loadAddon(new WebglAddon());
    } catch (e) {}
    
    terminal.current.open(terminalRef.current);
    setTimeout(() => fitAddon.current?.fit(), 50);

    // Keyboard shortcuts
    terminal.current.attachCustomKeyEventHandler((event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'c' && terminal.current.hasSelection()) {
        document.execCommand('copy');
        return false;
      }
      return true;
    });

    setIsInitialized(true);
    return { terminal: terminal.current, fitAddon: fitAddon.current };
  }, [selectedProject, selectedSession, isRestarting, terminalRef]);

  const cleanupTerminal = useCallback((ws, isConnected) => {
    if (terminal.current && selectedProject) {
      const sessionKey = selectedSession?.id || `project-${selectedProject.name}`;
      shellSessions.set(sessionKey, {
        terminal: terminal.current,
        fitAddon: fitAddon.current,
        ws: ws,
        isConnected: isConnected
      });
    }
  }, [selectedProject, selectedSession]);

  const disposeTerminal = useCallback(() => {
    const sessionKey = selectedSession?.id || (selectedProject ? `project-${selectedProject.name}` : null);
    if (sessionKey) shellSessions.delete(sessionKey);
    
    if (terminal.current) {
      terminal.current.dispose();
      terminal.current = null;
      fitAddon.current = null;
    }
    setIsInitialized(false);
  }, [selectedSession, selectedProject]);

  return { terminal, fitAddon, isInitialized, initTerminal, cleanupTerminal, disposeTerminal, setIsInitialized };
};

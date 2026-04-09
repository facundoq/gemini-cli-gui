import { useEffect, useRef } from 'react';
import { playNotificationSound } from '../../../utils/notificationSound';

export const useChatWebSocket = ({
  messages,
  currentSessionId,
  selectedProject,
  onReplaceTemporarySession,
  onNavigateToSession,
  onSessionInactive,
  setChatMessages,
  setIsLoading,
  setCanAbortSession,
  setGeminiStatus,
  setIsSystemSessionChange,
  setCurrentSessionId
}) => {
  useEffect(() => {
    // Handle WebSocket messages
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      // console.log('Received WebSocket message:', latestMessage.type, latestMessage);

      switch (latestMessage.type) {
        case 'session-created':
          // New session created by Gemini CLI - we receive the real session ID here
          if (latestMessage.sessionId && !currentSessionId) {
            sessionStorage.setItem('pendingSessionId', latestMessage.sessionId);

            // Session Protection: Replace temporary "new-session-*" identifier with real session ID
            if (onReplaceTemporarySession) {
              onReplaceTemporarySession(latestMessage.sessionId);
            }
          }
          break;

        case 'gemini-response':
          const messageData = latestMessage.data.message || latestMessage.data;

          // Handle Gemini CLI session duplication bug workaround
          if (latestMessage.data.type === 'system' &&
            latestMessage.data.subtype === 'init' &&
            latestMessage.data.session_id &&
            currentSessionId &&
            latestMessage.data.session_id !== currentSessionId) {

            setIsSystemSessionChange(true);
            if (onNavigateToSession) {
              onNavigateToSession(latestMessage.data.session_id);
            }
            return;
          }

          // Handle system/init for new sessions
          if (latestMessage.data.type === 'system' &&
            latestMessage.data.subtype === 'init' &&
            latestMessage.data.session_id &&
            !currentSessionId) {

            setIsSystemSessionChange(true);
            if (onNavigateToSession) {
              onNavigateToSession(latestMessage.data.session_id);
            }
            return;
          }

          // For system/init messages that match current session, just ignore them
          if (latestMessage.data.type === 'system' &&
            latestMessage.data.subtype === 'init' &&
            latestMessage.data.session_id &&
            currentSessionId &&
            latestMessage.data.session_id === currentSessionId) {
            return;
          }

          // Handle different types of content in the response
          if (Array.isArray(messageData.content)) {
            for (const part of messageData.content) {
              if (part.type === 'tool_use') {
                const toolInput = part.input ? JSON.stringify(part.input, null, 2) : '';
                setChatMessages(prev => [...prev, {
                  type: 'assistant',
                  content: '',
                  timestamp: new Date(),
                  isToolUse: true,
                  toolName: part.name,
                  toolInput: toolInput,
                  toolId: part.id,
                  toolResult: null
                }]);

                if (['Write', 'write_file', 'Edit', 'MultiEdit', 'Create', 'Delete'].includes(part.name)) {
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('file-operation', {
                      detail: {
                        toolName: part.name,
                        projectName: selectedProject?.name
                      }
                    }));
                  }, 500);
                }
              } else if (part.type === 'text' && part.text?.trim()) {
                setChatMessages(prev => [...prev, {
                  type: 'assistant',
                  content: part.text,
                  timestamp: new Date()
                }]);
              }
            }
          } else if (typeof messageData.content === 'string' && messageData.content.trim()) {
            setChatMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (
                lastMessage && 
                lastMessage.type === 'assistant' && 
                !lastMessage.isToolUse && 
                !lastMessage.isInteractivePrompt && 
                typeof lastMessage.content === 'string' &&
                !lastMessage.content.startsWith('<command-name>')
              ) {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    content: lastMessage.content + messageData.content,
                    timestamp: new Date()
                  }
                ];
              }
              return [...prev, {
                type: 'assistant',
                content: messageData.content,
                timestamp: new Date()
              }];
            });
          }

          if (messageData.role === 'user' && Array.isArray(messageData.content)) {
            for (const part of messageData.content) {
              if (part.type === 'tool_result') {
                setChatMessages(prev => prev.map(msg => {
                  if (msg.isToolUse && msg.toolId === part.tool_use_id) {
                    return {
                      ...msg,
                      toolResult: {
                        content: part.content,
                        isError: part.is_error,
                        timestamp: new Date()
                      }
                    };
                  }
                  return msg;
                }));
              }
            }
          }
          break;

        case 'gemini-output':
          setChatMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (
              lastMessage && 
              lastMessage.type === 'assistant' && 
              !lastMessage.isToolUse && 
              !lastMessage.isInteractivePrompt && 
              typeof lastMessage.content === 'string' &&
              !lastMessage.content.startsWith('<command-name>')
            ) {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  content: lastMessage.content + latestMessage.data,
                  timestamp: new Date()
                }
              ];
            }
            return [...prev, {
              type: 'assistant',
              content: latestMessage.data,
              timestamp: new Date()
            }];
          });
          break;
        case 'gemini-interactive-prompt':
          setChatMessages(prev => [...prev, {
            type: 'assistant',
            content: latestMessage.data,
            timestamp: new Date(),
            isInteractivePrompt: true
          }]);
          break;

        case 'gemini-error':
          setChatMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.type === 'error') {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  content: lastMessage.content + '\n' + latestMessage.error,
                  timestamp: new Date()
                }
              ];
            }
            return [...prev, {
              type: 'error',
              content: `Error: ${latestMessage.error}`,
              timestamp: new Date()
            }];
          });
          setIsLoading(false);
          setCanAbortSession(false);
          setGeminiStatus(null);
          break;

        case 'gemini-complete':
          setIsLoading(false);
          setCanAbortSession(false);
          setGeminiStatus(null);
          playNotificationSound();

          const activeSessionId = currentSessionId || sessionStorage.getItem('pendingSessionId');
          if (activeSessionId && onSessionInactive) {
            onSessionInactive(activeSessionId);
          }

          const pendingSessionId = sessionStorage.getItem('pendingSessionId');
          if (pendingSessionId && !currentSessionId && latestMessage.exitCode === 0) {
            setCurrentSessionId(pendingSessionId);
            sessionStorage.removeItem('pendingSessionId');
          }

          if (selectedProject && latestMessage.exitCode === 0) {
            localStorage.removeItem(`chat_messages_${selectedProject.name}`);
          }
          break;

        case 'session-aborted':
          setIsLoading(false);
          setCanAbortSession(false);
          setGeminiStatus(null);

          if (currentSessionId && onSessionInactive) {
            onSessionInactive(currentSessionId);
          }

          setChatMessages(prev => [...prev, {
            type: 'assistant',
            content: 'Session interrupted by user.',
            timestamp: new Date()
          }]);
          break;

        case 'gemini-status':
          const statusData = latestMessage.data;
          if (statusData) {
            let statusInfo = {
              text: 'Working...',
              tokens: 0,
              can_interrupt: true
            };

            if (statusData.message) {
              statusInfo.text = statusData.message;
            } else if (statusData.status) {
              statusInfo.text = statusData.status;
            } else if (typeof statusData === 'string') {
              statusInfo.text = statusData;
            }

            if (statusData.tokens) {
              statusInfo.tokens = statusData.tokens;
            } else if (statusData.token_count) {
              statusInfo.tokens = statusData.token_count;
            }

            if (statusData.can_interrupt !== undefined) {
              statusInfo.can_interrupt = statusData.can_interrupt;
            }

            setGeminiStatus(statusInfo);
            setIsLoading(true);
            setCanAbortSession(statusInfo.can_interrupt);
          }
          break;
      }
    }
  }, [messages]);
};

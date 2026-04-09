import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../../utils/api';
import { useChatWebSocket } from './hooks/useChatWebSocket';
import { useFileMentions } from './hooks/useFileMentions';
import { calculateDiff } from './utils/diffUtils';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

function ChatInterface({ 
  selectedProject, 
  selectedSession, 
  ws, 
  sendMessage, 
  messages, 
  onFileOpen, 
  onInputFocusChange, 
  onSessionActive, 
  onSessionInactive, 
  onReplaceTemporarySession, 
  onNavigateToSession, 
  onShowSettings, 
  autoExpandTools, 
  showRawParameters, 
  autoScrollToBottom,
  // New props for session-specific settings
  selectedModel,
  setSelectedModel,
  approvalMode,
  setApprovalMode
}) {
  const [input, setInput] = useState(() => {
    if (typeof window !== 'undefined' && selectedProject) {
      return localStorage.getItem(`draft_input_${selectedProject.name}`) || '';
    }
    return '';
  });

  const [chatMessages, setChatMessages] = useState(() => {
    if (typeof window !== 'undefined' && selectedProject) {
      const saved = localStorage.getItem(`chat_messages_${selectedProject.name}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [sessionMessages, setSessionMessages] = useState([]);
  
  const isYoloMode = approvalMode === 'yolo';

  const [isLoadingSessionMessages, setIsLoadingSessionMessages] = useState(false);
  const [isSystemSessionChange, setIsSystemSessionChange] = useState(false);
  const [permissionMode, setPermissionMode] = useState('default');
  const [attachedImages, setAttachedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(new Map());
  const [imageErrors, setImageErrors] = useState(new Map());
  const [fileList, setFileList] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [isTextareaExpanded, setIsTextareaExpanded] = useState(false);
  const [visibleMessageCount, setVisibleMessageCount] = useState(100);
  const [geminiStatus, setGeminiStatus] = useState(null);
  const [canAbortSession, setCanAbortSession] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const scrollPositionRef = useRef({ height: 0, top: 0 });
  const previousSessionIdRef = useRef(null);

  // Memoized diff calculation
  const createDiff = useMemo(() => {
    const cache = new Map();
    return (oldStr, newStr) => {
      const key = `${oldStr.length}-${newStr.length}-${oldStr.slice(0, 50)}`;
      if (cache.has(key)) return cache.get(key);
      const result = calculateDiff(oldStr, newStr);
      cache.set(key, result);
      if (cache.size > 100) cache.delete(cache.keys().next().value);
      return result;
    };
  }, []);

  // API loading logic
  const loadSessionMessages = useCallback(async (projectName, sessionId) => {
    if (!projectName || !sessionId) return [];
    setIsLoadingSessionMessages(true);
    try {
      const response = await api.sessionMessages(projectName, sessionId);
      if (!response.ok) throw new Error('Failed to load session messages');
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      return [];
    } finally {
      setIsLoadingSessionMessages(false);
    }
  }, []);

  const convertSessionMessages = useCallback((rawMessages) => {
    const converted = [];
    const toolResults = new Map();

    for (const msg of rawMessages) {
      if (msg.message?.role === 'user' && Array.isArray(msg.message?.content)) {
        for (const part of msg.message.content) {
          if (part.type === 'tool_result') {
            toolResults.set(part.tool_use_id, {
              content: part.content,
              isError: part.is_error,
              timestamp: new Date(msg.timestamp || Date.now())
            });
          }
        }
      }
    }

    for (const msg of rawMessages) {
      if (msg.message?.role === 'user' && msg.message?.content) {
        let content = '';
        if (Array.isArray(msg.message.content)) {
          const textParts = msg.message.content
            .filter(part => part.type === 'text')
            .map(part => part.text);
          content = textParts.join('\n');
        } else {
          content = String(msg.message.content);
        }

        if (content && !content.startsWith('<command-name>') && !content.startsWith('[Request interrupted')) {
          converted.push({
            type: 'user',
            content,
            timestamp: msg.timestamp || new Date().toISOString()
          });
        }
      } else if (msg.message?.role === 'assistant' && msg.message?.content) {
        if (Array.isArray(msg.message.content)) {
          for (const part of msg.message.content) {
            if (part.type === 'text') {
              converted.push({
                type: 'assistant',
                content: part.text,
                timestamp: msg.timestamp || new Date().toISOString()
              });
            } else if (part.type === 'tool_use') {
              const toolResult = toolResults.get(part.id);
              converted.push({
                type: 'assistant',
                content: '',
                timestamp: msg.timestamp || new Date().toISOString(),
                isToolUse: true,
                toolName: part.name,
                toolInput: JSON.stringify(part.input),
                toolResult: toolResult ? (typeof toolResult.content === 'string' ? toolResult.content : JSON.stringify(toolResult.content)) : null,
                toolError: toolResult?.isError || false,
                toolResultTimestamp: toolResult?.timestamp || new Date()
              });
            }
          }
        } else {
          converted.push({
            type: 'assistant',
            content: msg.message.content,
            timestamp: msg.timestamp || new Date().toISOString()
          });
        }
      }
    }
    return converted;
  }, []);

  // WebSocket Integration Hook
  useChatWebSocket({
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
  });

  // Scrolling logic
  const scrollToBottom = useCallback((instant = false) => {
    if (scrollContainerRef.current) {
      if (instant) {
        scrollContainerRef.current.classList.add('scroll-instant');
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        requestAnimationFrame(() => {
          scrollContainerRef.current?.classList.remove('scroll-instant');
        });
      } else {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
      setIsUserScrolledUp(false);
    }
  }, []);

  const isNearBottom = useCallback(() => {
    if (!scrollContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 50;
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      setIsUserScrolledUp(!isNearBottom());
    }
  }, [isNearBottom]);

  // Effects for session loading and persistence
  useEffect(() => {
    const loadMessages = async () => {
      if (selectedSession && selectedProject) {
        const isNewSession = previousSessionIdRef.current !== selectedSession.id;
        if (isNewSession) {
          previousSessionIdRef.current = selectedSession.id;
          setCurrentSessionId(selectedSession.id);

          if (!isSystemSessionChange) {
            setChatMessages([]);
            setSessionMessages([]);
            setIsLoadingSessionMessages(true);
            try {
              const messages = await loadSessionMessages(selectedProject.name, selectedSession.id);
              setSessionMessages(messages);
              setChatMessages(convertSessionMessages(messages));
              if (autoScrollToBottom) {
                setTimeout(() => scrollToBottom(), 200);
              }
            } catch (error) {} finally {
              setIsLoadingSessionMessages(false);
            }
          } else {
            setIsSystemSessionChange(false);
          }
        }
      } else {
        setChatMessages([]);
        setSessionMessages([]);
        setCurrentSessionId(null);
        previousSessionIdRef.current = null;
      }
    };
    loadMessages();
  }, [selectedSession, selectedProject, loadSessionMessages, convertSessionMessages, scrollToBottom, isSystemSessionChange, autoScrollToBottom]);

  useEffect(() => {
    if (onInputFocusChange) onInputFocusChange(isInputFocused);
  }, [isInputFocused, onInputFocusChange]);

  useEffect(() => {
    if (selectedProject) {
      if (input !== '') localStorage.setItem(`draft_input_${selectedProject.name}`, input);
      else localStorage.removeItem(`draft_input_${selectedProject.name}`);
    }
  }, [input, selectedProject]);

  useEffect(() => {
    if (selectedProject && chatMessages.length > 0) {
      localStorage.setItem(`chat_messages_${selectedProject.name}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, selectedProject]);

  // File list processing
  const fetchProjectFiles = useCallback(async () => {
    try {
      const response = await api.getFiles(selectedProject.name);
      if (response.ok) {
        const files = await response.json();
        const flattenFileTree = (files, basePath = '') => {
          let result = [];
          for (const file of files) {
            const fullPath = basePath ? `${basePath}/${file.name}` : file.name;
            if (file.type === 'directory' && file.children) {
              result = result.concat(flattenFileTree(file.children, fullPath));
            } else if (file.type === 'file') {
              result.push({ name: file.name, path: fullPath, relativePath: file.path });
            }
          }
          return result;
        };
        setFileList(flattenFileTree(files));
      }
    } catch (error) {}
  }, [selectedProject?.name]);

  useEffect(() => {
    if (selectedProject) fetchProjectFiles();
  }, [selectedProject, fetchProjectFiles]);

  // File Mentions Hook
  const {
    showFileDropdown,
    setShowFileDropdown,
    filteredFiles,
    selectedFileIndex,
    setSelectedFileIndex,
    selectFile
  } = useFileMentions(input, cursorPosition, fileList, setInput, setCursorPosition, textareaRef);

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || !selectedProject) return;

    let uploadedImages = [];
    if (attachedImages.length > 0) {
      const formData = new FormData();
      attachedImages.forEach(file => formData.append('images', file));
      try {
        const token = localStorage.getItem('auth-token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`/api/projects/${selectedProject.name}/upload-images`, {
          method: 'POST',
          headers,
          body: formData
        });
        if (!response.ok) throw new Error('Failed to upload images');
        const result = await response.json();
        uploadedImages = result.images;
      } catch (error) {
        setChatMessages(prev => [...prev, {
          type: 'error',
          content: `Failed to upload images: ${error.message}`,
          timestamp: new Date()
        }]);
        return;
      }
    }

    const userMessage = { type: 'user', content: input, images: uploadedImages, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCanAbortSession(true);
    setGeminiStatus({ text: 'Processing', tokens: 0, can_interrupt: true });
    setIsUserScrolledUp(false);
    setTimeout(() => scrollToBottom(), 100);

    const sessionToActivate = currentSessionId || `new-session-${Date.now()}`;
    if (onSessionActive) onSessionActive(sessionToActivate);

    const settings = JSON.parse(localStorage.getItem('gemini-tools-settings') || '{}');
    const toolsSettings = {
      allowedTools: settings.allowedTools || [],
      disallowedTools: settings.disallowedTools || [],
      skipPermissions: approvalMode === 'yolo',
      approvalMode: approvalMode,
      useSandbox: settings.useSandbox || false,
      selectedModel: selectedModel
    };

    sendMessage({
      type: 'gemini-command',
      command: input,
      options: {
        projectPath: selectedProject.path,
        cwd: selectedProject.path,
        sessionId: currentSessionId,
        resume: !!currentSessionId,
        toolsSettings,
        permissionMode,
        model: selectedModel,
        images: uploadedImages
      }
    });

    setInput('');
    setAttachedImages([]);
    setUploadingImages(new Map());
    setImageErrors(new Map());
    setIsTextareaExpanded(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    if (selectedProject) localStorage.removeItem(`draft_input_${selectedProject.name}`);
  };

  const handleKeyDown = (e) => {
    if (showFileDropdown && filteredFiles.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedFileIndex(prev => prev < filteredFiles.length - 1 ? prev + 1 : 0); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedFileIndex(prev => prev > 0 ? prev - 1 : filteredFiles.length - 1); return; }
      if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); selectFile(filteredFiles[selectedFileIndex >= 0 ? selectedFileIndex : 0]); return; }
      if (e.key === 'Escape') { e.preventDefault(); setShowFileDropdown(false); return; }
    }
    if (e.key === 'Enter') {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
      else if (!e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); handleSubmit(e); }
    }
  };

  const handleImageFiles = useCallback((files) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 5 * 1024 * 1024) {
        setImageErrors(prev => new Map(prev).set(file.name, 'File too large (max 5MB)'));
        return false;
      }
      return true;
    });
    if (validFiles.length > 0) setAttachedImages(prev => [...prev, ...validFiles].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 5,
    onDrop: handleImageFiles,
    noClick: true,
    noKeyboard: true
  });

  const visibleMessages = useMemo(() => chatMessages.slice(-visibleMessageCount), [chatMessages, visibleMessageCount]);

  useEffect(() => {
    if (scrollContainerRef.current) scrollContainerRef.current.addEventListener('scroll', handleScroll);
    return () => scrollContainerRef.current?.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="h-full flex flex-col">
      <MessageList
        scrollContainerRef={scrollContainerRef}
        visibleMessages={visibleMessages}
        chatMessages={chatMessages}
        visibleMessageCount={visibleMessageCount}
        loadEarlierMessages={() => setVisibleMessageCount(prev => prev + 100)}
        isLoadingSessionMessages={isLoadingSessionMessages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
        createDiff={createDiff}
        onFileOpen={onFileOpen}
        onShowSettings={onShowSettings}
        autoExpandTools={autoExpandTools}
        showRawParameters={showRawParameters}
      />

      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        textareaRef={textareaRef}
        handleSubmit={handleSubmit}
        handleKeyDown={handleKeyDown}
        handlePaste={async (e) => {
          const items = Array.from(e.clipboardData.items);
          items.forEach(item => { if (item.type.startsWith('image/')) { const file = item.getAsFile(); if (file) handleImageFiles([file]); } });
        }}
        handleInputChange={(e) => setInput(e.target.value)}
        handleTextareaClick={(e) => setCursorPosition(e.target.selectionStart)}
        setIsInputFocused={setIsInputFocused}
        isInputFocused={isInputFocused}
        isTextareaExpanded={isTextareaExpanded}
        setIsTextareaExpanded={setIsTextareaExpanded}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        attachedImages={attachedImages}
        setAttachedImages={setAttachedImages}
        uploadingImages={uploadingImages}
        imageErrors={imageErrors}
        open={open}
        showFileDropdown={showFileDropdown}
        filteredFiles={filteredFiles}
        selectedFileIndex={selectedFileIndex}
        selectFile={selectFile}
        geminiStatus={geminiStatus}
        handleAbortSession={() => currentSessionId && canAbortSession && sendMessage({ type: 'abort-session', sessionId: currentSessionId })}
        isUserScrolledUp={isUserScrolledUp}
        chatMessages={chatMessages}
        scrollToBottom={scrollToBottom}
        setCursorPosition={setCursorPosition}
      />
    </div>
  );
}

export default React.memo(ChatInterface);

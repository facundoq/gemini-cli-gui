import React, { memo, useRef, useEffect, useState } from 'react';
import SystemMessage from './MessageComponents/SystemMessage';
import UserMessage from './MessageComponents/UserMessage';
import GeminiMessageHeader from './MessageComponents/GeminiMessageHeader';
import ToolUsageSection from './MessageComponents/ToolUsage/ToolUsageSection';
import InteractivePrompt from './MessageComponents/ToolUsage/InteractivePrompt';
import { EnhancedMessageRenderer } from '../EnhancedMessageRenderer';

const MessageItem = memo(({ 
  message, 
  index, 
  prevMessage, 
  createDiff, 
  onFileOpen, 
  onShowSettings, 
  autoExpandTools, 
  showRawParameters 
}) => {
  const isGrouped = prevMessage && prevMessage.type === message.type &&
    prevMessage.type === 'assistant' &&
    !prevMessage.isToolUse && !message.isToolUse;
  
  const messageRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Auto-expand tool details when they come into view
  useEffect(() => {
    if (!autoExpandTools || !messageRef.current || !message.isToolUse) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isExpanded) {
            setIsExpanded(true);
            const details = messageRef.current.querySelectorAll('details');
            details.forEach(detail => {
              detail.open = true;
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(messageRef.current);

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
    };
  }, [autoExpandTools, isExpanded, message.isToolUse]);

  // 1. System Messages
  if (message.type === 'system') {
    return <SystemMessage content={message.content} />;
  }

  // 2. User Messages
  if (message.type === 'user') {
    return (
      <div ref={messageRef} className={`chat-message user flex justify-end px-3 sm:px-0 mb-4`}>
        <UserMessage 
          content={message.content} 
          images={message.images} 
          timestamp={message.timestamp} 
          isGrouped={isGrouped} 
        />
      </div>
    );
  }

  // 3. Assistant / Error Messages
  return (
    <div 
      ref={messageRef} 
      className={`chat-message ${message.type} ${isGrouped ? 'grouped' : ''} px-3 sm:px-0 mb-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-500`}
    >
      <GeminiMessageHeader type={message.type} isGrouped={isGrouped} />

      <div className="w-full">
        {/* Tool Interaction */}
        {message.isToolUse && !['Read', 'TodoWrite', 'TodoRead'].includes(message.toolName) ? (
          <ToolUsageSection 
            message={message}
            onFileOpen={onFileOpen}
            onShowSettings={onShowSettings}
            createDiff={createDiff}
            autoExpandTools={autoExpandTools}
            showRawParameters={showRawParameters}
          />
        ) : message.isInteractivePrompt ? (
          <InteractivePrompt content={message.content} />
        ) : (
          /* Normal Message Content or Special Tools (Read/Todo) handled by EnhancedMessageRenderer */
          <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
            <EnhancedMessageRenderer 
              message={message} 
              onFileOpen={onFileOpen}
              onShowSettings={onShowSettings}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default MessageItem;

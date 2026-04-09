import React from 'react';
import MessageItem from './MessageItem';

const MessageList = ({
  scrollContainerRef,
  visibleMessages,
  chatMessages,
  visibleMessageCount,
  loadEarlierMessages,
  isLoadingSessionMessages,
  isLoading,
  messagesEndRef,
  createDiff,
  onFileOpen,
  onShowSettings,
  autoExpandTools,
  showRawParameters
}) => {
  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden px-0 py-3 sm:p-4 space-y-3 sm:space-y-4 relative"
      style={{
        scrollBehavior: 'smooth',
        transform: 'translateZ(0)',
        willChange: 'scroll-position'
      }}
    >
      {isLoadingSessionMessages && chatMessages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            <p>Loading session messages...</p>
          </div>
        </div>
      ) : chatMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500 dark:text-gray-400 px-6 sm:px-4">
            <p className="font-bold text-lg sm:text-xl mb-3">Start a conversation with Gemini</p>
            <p className="text-sm sm:text-base leading-relaxed">
              Ask questions about your code, request changes, or get help with development tasks
            </p>
          </div>
        </div>
      ) : (
        <>
          {chatMessages.length > visibleMessageCount && (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2 border-b border-gray-200 dark:border-gray-700">
              Showing last {visibleMessageCount} messages ({chatMessages.length} total) •
              <button
                className="ml-1 text-blue-600 hover:text-blue-700 underline"
                onClick={loadEarlierMessages}
              >
                Load earlier messages
              </button>
            </div>
          )}

          {visibleMessages.map((message, index) => {
            const prevMessage = index > 0 ? visibleMessages[index - 1] : null;

            return (
              <MessageItem
                key={`${message.id || index}-${message.timestamp}`}
                message={message}
                index={index}
                prevMessage={prevMessage}
                createDiff={createDiff}
                onFileOpen={onFileOpen}
                onShowSettings={onShowSettings}
                autoExpandTools={autoExpandTools}
                showRawParameters={showRawParameters}
              />
            );
          })}
        </>
      )}

      {isLoading && (
        <div className="chat-message assistant px-3 sm:px-0">
          <div className="w-full">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                G
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Gemini</div>
            </div>
            <div className="w-full text-sm text-gray-500 dark:text-gray-400 pl-3 sm:pl-0">
              <div className="flex items-center space-x-1">
                <div className="animate-pulse">●</div>
                <div className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</div>
                <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</div>
                <span className="ml-2">Thinking...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

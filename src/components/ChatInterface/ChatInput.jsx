import React from 'react';
import ImageAttachment from './ImageAttachment';
import GeminiStatus from '../GeminiStatus';
import { MicButton } from '../MicButton.jsx'; // This was HIDDEN but still imported

const ChatInput = ({
  input,
  setInput,
  isLoading,
  textareaRef,
  handleSubmit,
  handleKeyDown,
  handlePaste,
  handleInputChange,
  handleTextareaClick,
  setIsInputFocused,
  isInputFocused,
  isTextareaExpanded,
  setIsTextareaExpanded,
  getRootProps,
  getInputProps,
  isDragActive,
  attachedImages,
  setAttachedImages,
  uploadingImages,
  imageErrors,
  open,
  showFileDropdown,
  filteredFiles,
  selectedFileIndex,
  selectFile,
  geminiStatus,
  handleAbortSession,
  isUserScrolledUp,
  chatMessages,
  scrollToBottom,
  setCursorPosition
}) => {
  return (
    <div className={`p-2 sm:p-4 md:p-6 flex-shrink-0 ${isInputFocused ? 'pb-2 sm:pb-4 md:pb-6' : 'pb-16 sm:pb-4 md:pb-6'}`}>
      {/* Gemini Working Status - positioned above the input form */}
      <GeminiStatus
        status={geminiStatus}
        isLoading={isLoading}
        onAbort={handleAbortSession}
      />

      {/* Scroll to bottom button - positioned above input when scrolled up */}
      {isUserScrolledUp && chatMessages.length > 0 && (
        <div className="max-w-4xl mx-auto mb-3 flex justify-center">
          <button
            onClick={scrollToBottom}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-gray-800 animate-in fade-in slide-in-from-bottom-2"
            title="Scroll to bottom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
        {/* Drag overlay */}
        {isDragActive && (
          <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
              <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium">Drop images here</p>
            </div>
          </div>
        )}

        {/* Image attachments preview */}
        {attachedImages.length > 0 && (
          <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {attachedImages.map((file, index) => (
                <ImageAttachment
                  key={index}
                  file={file}
                  onRemove={() => {
                    setAttachedImages(prev => prev.filter((_, i) => i !== index));
                  }}
                  uploadProgress={uploadingImages.get(file.name)}
                  error={imageErrors.get(file.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* File dropdown - positioned outside dropzone to avoid conflicts */}
        {showFileDropdown && filteredFiles.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 backdrop-blur-sm">
            {filteredFiles.map((file, index) => (
              <div
                key={file.path}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 touch-manipulation ${index === selectedFileIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                onMouseDown={(e) => {
                  // Prevent textarea from losing focus on mobile
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  selectFile(file);
                }}
              >
                <div className="font-medium text-sm">{file.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {file.path}
                </div>
              </div>
            ))}
          </div>
        )}

        <div {...getRootProps()} className={`chat-input-container relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200 ${isTextareaExpanded ? 'chat-input-expanded' : ''}`}>
          <input {...getInputProps()} />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onClick={handleTextareaClick}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onInput={(e) => {
              // Immediate resize on input for better UX
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
              setCursorPosition(e.target.selectionStart);

              // Check if textarea is expanded (more than 2 lines worth of height)
              const lineHeight = parseInt(window.getComputedStyle(e.target).lineHeight);
              const isExpanded = e.target.scrollHeight > lineHeight * 2;
              setIsTextareaExpanded(isExpanded);
            }}
            placeholder="Ask Gemini to help with your code... (@ to reference files)"
            disabled={isLoading}
            rows={1}
            className="chat-input-placeholder w-full pl-12 pr-28 sm:pr-40 py-3 sm:py-4 bg-transparent rounded-2xl focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 resize-none min-h-[40px] sm:min-h-[56px] max-h-[40vh] sm:max-h-[300px] overflow-y-auto text-sm sm:text-base transition-all duration-200"
            style={{ height: 'auto' }}
          />
          {/* Clear button - shown when there's text */}
          {input.trim() && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setInput('');
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto';
                  textareaRef.current.focus();
                }
                setIsTextareaExpanded(false);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setInput('');
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto';
                  textareaRef.current.focus();
                }
                setIsTextareaExpanded(false);
              }}
              className="absolute -left-0.5 -top-3 sm:right-28 sm:left-auto sm:top-1/2 sm:-translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center transition-all duration-200 group z-10 shadow-sm"
              title="Clear input"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          {/* Image upload button */}
          <button
            type="button"
            onClick={open}
            className="absolute left-2 bottom-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Attach images"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Mic button - HIDDEN */}
          <div className="absolute right-16 sm:right-16 top-1/2 transform -translate-y-1/2" style={{ display: 'none' }}>
            {/* MicButton would go here */}
          </div>
          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            onMouseDown={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 sm:w-12 sm:h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-gray-800"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white transform rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        {/* Hint text */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 hidden sm:block">
          Press Enter to send • Shift+Enter for new line • Tab to change modes • @ to reference files
        </div>
        <div className={`text-xs text-gray-500 dark:text-gray-400 text-center mt-2 sm:hidden transition-opacity duration-200 ${isInputFocused ? 'opacity-100' : 'opacity-0'}`}>
          Enter to send • Tab for modes • @ for files
        </div>
      </form>
    </div>
  );
};

export default ChatInput;

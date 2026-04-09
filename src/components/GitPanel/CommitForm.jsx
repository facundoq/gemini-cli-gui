import React, { useRef, useEffect } from 'react';
import { GitCommit, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import { MicButton } from '../MicButton.jsx';
import { Button } from '../ui/button';

const CommitForm = ({ 
  commitMessage, 
  setCommitMessage, 
  onCommit, 
  onGenerateMessage, 
  isCommitting, 
  isGeneratingMessage, 
  selectedFilesCount,
  isMobile,
  isCollapsed,
  onToggleCollapse
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!isCollapsed && textareaRef.current && !isMobile) {
      textareaRef.current.focus();
    }
  }, [isCollapsed, isMobile]);

  const handleTextareaChange = (e) => {
    setCommitMessage(e.target.value);
    // Auto-expand textarea height
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out ${isCollapsed ? 'h-10 md:h-12' : ''}`}>
      {/* Collapse/Expand Toggle Header */}
      <div 
        className="flex items-center justify-between px-3 md:px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <GitCommit className="w-3.5 h-3.5" />
            Commit Changes {selectedFilesCount > 0 && `(${selectedFilesCount} file${selectedFilesCount !== 1 ? 's' : ''})`}
          </span>
        </div>
        {!isCollapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGenerateMessage();
            }}
            disabled={isGeneratingMessage || selectedFilesCount === 0}
            className="flex items-center gap-1 text-[10px] md:text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold transition-all disabled:opacity-50 group"
          >
            <Sparkles className={`w-3 h-3 ${isGeneratingMessage ? 'animate-pulse' : 'group-hover:scale-110'}`} />
            {isGeneratingMessage ? 'Generating...' : 'AI Message'}
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="px-3 md:px-4 pb-4 md:pb-5 space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="relative group">
            <textarea
              ref={textareaRef}
              value={commitMessage}
              onChange={handleTextareaChange}
              placeholder="Enter a commit message..."
              className="w-full min-h-[80px] md:min-h-[100px] p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-inner"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  onCommit();
                }
              }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MicButton 
                onTranscript={(text) => setCommitMessage(prev => prev ? `${prev} ${text}` : text)}
                isSmall={true}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-3">
            <div className="hidden md:block text-[10px] text-gray-500 font-medium">
               Press <kbd className="font-sans px-1 py-0.5 rounded border border-gray-300 dark:border-gray-600">Ctrl + Enter</kbd> to commit
            </div>
            <button
              onClick={onCommit}
              disabled={isCommitting || !commitMessage.trim() || selectedFilesCount === 0}
              className="flex-1 md:flex-none md:min-w-[120px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all duration-200 font-bold text-sm flex items-center justify-center gap-2"
            >
              {isCommitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Committing...</span>
                </>
              ) : (
                <>
                  <GitCommit className="w-4 h-4" />
                  <span>Commit</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitForm;

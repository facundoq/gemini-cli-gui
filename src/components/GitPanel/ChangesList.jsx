import React, { useState } from 'react';
import { ChevronRight, Trash2, Check, X, RefreshCw } from 'lucide-react';
import { renderDiffLine, getStatusLabel } from './utils.jsx';

const FileItem = ({ 
  filePath, 
  status, 
  isExpanded, 
  onToggleExpand, 
  isSelected, 
  onToggleSelect, 
  diff, 
  onDiscard, 
  isMobile,
  wrapText,
  setWrapText
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0 overflow-hidden">
      <div className={`flex items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors ${isMobile ? 'px-2 py-2' : 'px-3 py-2'}`}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(filePath)}
          className={`rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500/20 dark:bg-gray-800 ${isMobile ? 'mr-2' : 'mr-3'}`}
        />
        <div 
          className="flex items-center flex-1 cursor-pointer min-w-0"
          onClick={() => onToggleExpand(filePath)}
        >
          <div className={`p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${isMobile ? 'mr-1' : 'mr-2'}`}>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
          </div>
          <span className={`flex-1 truncate font-medium ${isMobile ? 'text-xs' : 'text-sm text-gray-700 dark:text-gray-300'}`}>
            {filePath}
          </span>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {(status === 'M' || status === 'D') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDiscard(filePath);
                }}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded text-red-600 dark:text-red-400 transition-colors"
                title="Discard changes"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <span 
              className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold border ${
                status === 'M' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' :
                status === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' :
                status === 'D' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-300 dark:border-gray-600'
              }`}
              title={getStatusLabel(status)}
            >
              {status}
            </span>
          </div>
        </div>
      </div>
      
      {isExpanded && diff && (
        <div className="bg-gray-50/50 dark:bg-black/20 border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100/50 dark:bg-gray-800/30">
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {getStatusLabel(status)} Diff
            </span>
            {isMobile && (
              <button
                onClick={() => setWrapText(!wrapText)}
                className="text-[10px] bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-colors"
              >
                {wrapText ? '↩️ Wrap' : '↔️ Scroll'}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto p-1 md:p-2 bg-white dark:bg-gray-950/50">
            {diff.split('\n').map((line, index) => renderDiffLine(line, index, isMobile, wrapText))}
          </div>
        </div>
      )}
    </div>
  );
};

const ChangesList = ({ 
  gitStatus, 
  selectedFiles, 
  onToggleSelect, 
  gitDiff, 
  onDiscard, 
  isMobile 
}) => {
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [wrapText, setWrapText] = useState(true);

  const toggleFileExpanded = (filePath) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) newSet.delete(filePath);
      else newSet.add(filePath);
      return newSet;
    });
  };

  const getFilesByStatus = (status) => {
    if (!gitStatus) return [];
    switch (status) {
      case 'M': return gitStatus.modified || [];
      case 'A': return gitStatus.added || [];
      case 'D': return gitStatus.deleted || [];
      case 'U': return gitStatus.untracked || [];
      default: return [];
    }
  };

  const allStatuses = ['M', 'A', 'D', 'U'];
  if (!gitStatus) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-8 space-y-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center animate-pulse">
          <RefreshCw className="w-8 h-8 opacity-20" />
        </div>
        <p className="font-medium">Loading status...</p>
      </div>
    );
  }

  const hasChanges = allStatuses.some(s => getFilesByStatus(s).length > 0);

  if (!hasChanges) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-8 space-y-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <div className="text-center">
          <p className="font-medium text-gray-900 dark:text-white">Clean Working Directory</p>
          <p className="text-sm">No staged or unstaged changes found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {allStatuses.map(status => {
        const files = getFilesByStatus(status);
        if (files.length === 0) return null;

        return (
          <div key={status}>
            <div className="px-3 py-1.5 bg-gray-100/80 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                {getStatusLabel(status)} ({files.length})
              </span>
            </div>
            {files.map(file => (
              <FileItem 
                key={file}
                filePath={file}
                status={status}
                isExpanded={expandedFiles.has(file)}
                onToggleExpand={toggleFileExpanded}
                isSelected={selectedFiles.has(file)}
                onToggleSelect={onToggleSelect}
                diff={gitDiff[file]}
                onDiscard={onDiscard}
                isMobile={isMobile}
                wrapText={wrapText}
                setWrapText={setWrapText}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default ChangesList;

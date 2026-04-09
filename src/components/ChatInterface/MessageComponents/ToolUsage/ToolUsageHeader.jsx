import React from 'react';
import { Settings } from 'lucide-react';

const ToolUsageHeader = ({ toolName, toolId, onShowSettings }) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center shadow-sm">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        </div>
        <span className="font-bold text-blue-900 dark:text-blue-200 text-sm">
          Using {toolName}
        </span>
        <span className="text-[10px] text-blue-600/60 dark:text-blue-400/50 font-mono tracking-tighter">
          #{toolId}
        </span>
      </div>
      {onShowSettings && (
        <button
          onClick={(e) => { e.stopPropagation(); onShowSettings(); }}
          className="p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-blue-600 dark:text-blue-400"
          title="Tool Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default ToolUsageHeader;

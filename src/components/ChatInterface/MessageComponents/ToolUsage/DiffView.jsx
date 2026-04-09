import React from 'react';

const DiffView = ({ diffLines, filePath, onFileOpen, oldString, newString, title }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm mt-3 animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onFileOpen && onFileOpen(filePath, { old_string: oldString, new_string: newString })}
          className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate underline cursor-pointer"
        >
          {filePath}
        </button>
        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          {title}
        </span>
      </div>
      <div className="text-[11px] font-mono overflow-x-auto">
        {diffLines.map((diffLine, i) => (
          <div key={i} className="flex border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-200/20 dark:hover:bg-gray-800/20 transition-colors">
            <span className={`w-8 text-center border-r font-bold py-1 ${diffLine.type === 'removed'
              ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
              : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
              }`}>
              {diffLine.type === 'removed' ? '-' : '+'}
            </span>
            <span className={`px-3 py-1 flex-1 whitespace-pre leading-relaxed ${diffLine.type === 'removed'
              ? 'bg-red-50/50 dark:bg-red-900/10 text-red-800 dark:text-red-200'
              : 'bg-green-50/50 dark:bg-green-900/10 text-green-800 dark:text-green-200'
              }`}>
              {diffLine.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiffView;

import React from 'react';

export const renderDiffLine = (line, index, isMobile, wrapText) => {
  const isAddition = line.startsWith('+') && !line.startsWith('+++');
  const isDeletion = line.startsWith('-') && !line.startsWith('---');
  const isHeader = line.startsWith('@@');
  
  return (
    <div
      key={index}
      className={`font-mono text-[10px] md:text-xs ${
        isMobile && wrapText ? 'whitespace-pre-wrap break-all' : 'whitespace-pre overflow-x-auto shadow-sm'
      } ${
        isAddition ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-l-2 border-green-500' :
        isDeletion ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-l-2 border-red-500' :
        isHeader ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-y border-blue-200/50 dark:border-blue-800/50 my-1 py-0.5' :
        'text-gray-600 dark:text-gray-400 opacity-80'
      } px-2 py-0.5`}
    >
      {line}
    </div>
  );
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'M': return 'Modified';
    case 'A': return 'Added';
    case 'D': return 'Deleted';
    case 'U': return 'Untracked';
    default: return status;
  }
};

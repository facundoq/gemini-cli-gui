import React from 'react';

const SystemMessage = ({ content }) => {
  return (
    <div className="flex justify-center w-full py-4">
      <div className="bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 rounded-2xl px-5 py-2.5 text-xs font-semibold uppercase tracking-widest shadow-sm border border-gray-200 dark:border-gray-700 max-w-md text-center">
        {content}
      </div>
    </div>
  );
};

export default SystemMessage;

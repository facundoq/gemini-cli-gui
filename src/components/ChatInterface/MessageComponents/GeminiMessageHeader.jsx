import React from 'react';
import GeminiLogo from '../../GeminiLogo.jsx';

const GeminiMessageHeader = ({ type, isGrouped }) => {
  if (isGrouped) return null;

  return (
    <div className="flex items-center space-x-2.5 mb-2 animate-in fade-in duration-500">
      {type === 'error' ? (
        <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-red-500/20 border border-red-400">
          !
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 p-0.5 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 border border-blue-400">
          <GeminiLogo className="w-full h-full" />
        </div>
      )}
      <div className="flex flex-col">
        <div className="text-[11px] font-bold uppercase tracking-widest text-gray-900 dark:text-gray-100">
          {type === 'error' ? 'System Error' : 'Gemini AI'}
        </div>
        <div className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">
          {type === 'error' ? 'Execution failed' : 'Pro Vision 1.5'}
        </div>
      </div>
    </div>
  );
};

export default GeminiMessageHeader;

import React from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

const BashTool = ({ input, showRawParameters }) => {
  try {
    const parsedInput = typeof input === 'string' ? JSON.parse(input) : input;
    return (
      <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
        <div className="bg-gray-900 dark:bg-black rounded-xl p-4 font-mono text-sm shadow-xl border border-gray-800">
          <div className="flex items-center gap-2 mb-3 text-gray-500 border-b border-gray-800 pb-2">
            <TerminalIcon className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Terminal Session</span>
          </div>
          <div className="whitespace-pre-wrap break-all text-green-400 leading-relaxed">
            <span className="text-gray-500 mr-2">$</span>
            {parsedInput.command}
          </div>
        </div>
        {parsedInput.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 italic px-1 flex items-center gap-2">
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            {parsedInput.description}
          </div>
        )}
      </div>
    );
  } catch (e) {
    return <pre className="mt-2 text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">{input}</pre>;
  }
};

export default BashTool;

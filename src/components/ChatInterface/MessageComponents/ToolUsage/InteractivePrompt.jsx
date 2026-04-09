import React from 'react';
import { HelpCircle, CheckCircle2 } from 'lucide-react';

const InteractivePrompt = ({ content }) => {
  const lines = content.split('\n').filter(line => line.trim());
  const questionLine = lines.find(line => line.includes('?')) || lines[0] || '';
  const options = [];

  lines.forEach(line => {
    const optionMatch = line.match(/[❯\s]*(\d+)\.\s+(.+)/);
    if (optionMatch) {
      const isSelected = line.includes('❯');
      options.push({
        number: optionMatch[1],
        text: optionMatch[2].trim(),
        isSelected
      });
    }
  });

  const selectedOption = options.find(o => o.isSelected);

  return (
    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 shadow-lg shadow-amber-500/5 animate-in zoom-in-95 duration-300">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
          <HelpCircle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-amber-900 dark:text-amber-100 text-lg mb-2">
            Interactive Prompt
          </h4>
          <p className="text-sm sm:text-base text-amber-800 dark:text-amber-200 mb-6 font-medium leading-relaxed">
            {questionLine}
          </p>

          <div className="grid grid-cols-1 gap-3 mb-6">
            {options.map((option) => (
              <div
                key={option.number}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-xl border-2 transition-all ${
                  option.isSelected
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xl scale-[1.02]'
                    : 'bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-100 border-amber-100 dark:border-amber-900/50 opacity-70'
                }`}
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  option.isSelected ? 'bg-white/20' : 'bg-amber-100 dark:bg-amber-900/50'
                }`}>
                  {option.number}
                </span>
                <span className="text-sm sm:text-base font-bold flex-1 truncate">
                  {option.text}
                </span>
                {option.isSelected && <CheckCircle2 className="w-5 h-5" />}
              </div>
            ))}
          </div>

          {selectedOption && (
            <div className="bg-amber-100/50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <p className="text-amber-900 dark:text-amber-100 text-sm font-bold">
                  Gemini selected option {selectedOption.number}
                </p>
              </div>
              <p className="text-amber-800/70 dark:text-amber-400 text-[11px] leading-relaxed">
                Response automatically provided to the interactive CLI process.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractivePrompt;

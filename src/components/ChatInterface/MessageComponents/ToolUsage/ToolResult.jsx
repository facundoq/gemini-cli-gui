import React from 'react';
import ReactMarkdown from 'react-markdown';
import TodoList from '../../../TodoList';
import InteractivePrompt from './InteractivePrompt';

const ToolResult = ({ toolName, result, onFileOpen, autoExpandTools }) => {
  const content = String(result.content || '');
  const isError = result.isError;

  return (
    <div className="mt-4 border-t border-blue-100 dark:border-blue-900/50 pt-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shadow-sm ${isError ? 'bg-red-500' : 'bg-green-500'}`}>
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isError ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            )}
          </svg>
        </div>
        <span className={`text-sm font-bold uppercase tracking-wider ${isError ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
          {isError ? 'Tool Error' : 'Tool Result'}
        </span>
      </div>

      <div className={`text-sm leading-relaxed ${isError ? 'text-red-900 dark:text-red-200' : 'text-green-900 dark:text-green-200'}`}>
        {(() => {
          // Special handling for TodoWrite/TodoRead results
          if ((toolName === 'TodoWrite' || toolName === 'TodoRead') &&
            (content.includes('Todos have been modified successfully') ||
              content.includes('Todo list') ||
              (content.startsWith('[') && content.includes('"content"')))) {
            try {
              let todos = null;
              if (content.startsWith('[')) {
                todos = JSON.parse(content);
              } else if (content.includes('Todos have been modified successfully')) {
                return (
                  <div className="flex items-center gap-2 font-bold py-2 px-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <span>✓ Todo list updated successfully</span>
                  </div>
                );
              }

              if (todos && Array.isArray(todos)) {
                return (
                  <div className="space-y-3">
                    <p className="font-bold text-xs uppercase tracking-widest text-green-600/70">Current Items</p>
                    <TodoList todos={todos} isResult={true} />
                  </div>
                );
              }
            } catch (e) {}
          }

          // Special handling for implementation plans
          if (toolName === 'exit_plan_mode') {
            try {
              const parsed = JSON.parse(content);
              if (parsed.plan) {
                const planContent = parsed.plan.replace(/\\n/g, '\n');
                return (
                  <div className="space-y-4">
                    <p className="font-bold text-xs uppercase tracking-widest text-green-600/70">Final Implementation Plan</p>
                    <div className="prose prose-sm max-w-none dark:prose-invert bg-white/50 dark:bg-gray-800/30 p-4 rounded-xl border border-green-200/50 dark:border-green-800/30">
                      <ReactMarkdown>{planContent}</ReactMarkdown>
                    </div>
                  </div>
                );
              }
            } catch (e) {}
          }

          // Special handling for interactive prompts in results
          if (content.includes('Do you want to proceed?') && toolName === 'Bash') {
            return <InteractivePrompt content={content} />;
          }

          // File update success messages
          const fileEditMatch = content.match(/The file (.+?) has been updated\./);
          if (fileEditMatch) {
            return (
              <div className="flex items-center gap-3">
                <span className="font-bold">Updated:</span>
                <button
                  onClick={() => onFileOpen && onFileOpen(fileEditMatch[1])}
                  className="text-xs font-mono bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:scale-105 transition-transform underline"
                >
                  {fileEditMatch[1]}
                </button>
              </div>
            );
          }

          // File creation success messages
          const fileCreateMatch = content.match(/(?:The file|File) (.+?) has been (?:created|written)/);
          if (fileCreateMatch) {
            return (
              <div className="flex items-center gap-3">
                <span className="font-bold">Created:</span>
                <button
                  onClick={() => onFileOpen && onFileOpen(fileCreateMatch[1])}
                  className="text-xs font-mono bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:scale-105 transition-transform underline"
                >
                  {fileCreateMatch[1]}
                </button>
              </div>
            );
          }

          // Hide redundant write tool content
          if (toolName === 'Write' && !isError) {
            return (
              <div className="flex items-center gap-2 text-green-700 italic font-medium">
                <p>File content has been saved to disk. Diff shown above.</p>
              </div>
            );
          }

          // Truncation for long outputs
          if (content.length > 500) {
            return (
              <details className="group" open={autoExpandTools}>
                <summary className="text-sm font-bold text-green-700 dark:text-green-400 cursor-pointer hover:text-green-800 flex items-center gap-2 list-none">
                  <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>View Full Output ({content.length} chars)</span>
                </summary>
                <div className="mt-3 prose prose-sm max-w-none dark:prose-invert bg-white/30 dark:bg-gray-800/20 p-4 rounded-xl border border-green-200/30 dark:border-green-800/20">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              </details>
            );
          }

          return (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ToolResult;

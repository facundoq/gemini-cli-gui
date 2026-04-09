import React from 'react';
import ReactMarkdown from 'react-markdown';
import TodoList from '../../../TodoList';
import ToolUsageHeader from './ToolUsageHeader';
import DiffView from './DiffView';
import BashTool from './BashTool';
import ToolResult from './ToolResult';

const ToolUsageSection = ({ 
  message, 
  onFileOpen, 
  onShowSettings, 
  createDiff, 
  autoExpandTools, 
  showRawParameters 
}) => {
  const { toolName, toolId, toolInput, toolResult } = message;

  const renderToolInput = () => {
    if (!toolInput) return null;

    try {
      const parsedInput = typeof toolInput === 'string' ? JSON.parse(toolInput) : toolInput;

      // Special handling for Edit tool
      if (toolName === 'Edit' && parsedInput.file_path && parsedInput.old_string && parsedInput.new_string) {
        return (
          <details className="mt-2 group" open={autoExpandTools}>
            <summary className="text-sm font-bold text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 flex items-center gap-2 list-none">
              <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
              <span>📝 View Edit Diff</span>
            </summary>
            <DiffView 
              diffLines={createDiff(parsedInput.old_string, parsedInput.new_string)}
              filePath={parsedInput.file_path}
              onFileOpen={onFileOpen}
              oldString={parsedInput.old_string}
              newString={parsedInput.new_string}
              title="Diff View"
            />
          </details>
        );
      }

      // Special handling for Write tool
      if (toolName === 'Write' && parsedInput.file_path && parsedInput.content !== undefined) {
        return (
          <details className="mt-2 group" open={autoExpandTools}>
            <summary className="text-sm font-bold text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 flex items-center gap-2 list-none">
              <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
              <span>📄 Creating New File</span>
            </summary>
            <DiffView 
              diffLines={createDiff('', parsedInput.content)}
              filePath={parsedInput.file_path}
              onFileOpen={onFileOpen}
              oldString=""
              newString={parsedInput.content}
              title="New File Content"
            />
          </details>
        );
      }

      // Special handling for Bash tool
      if (toolName === 'Bash') {
        return <BashTool input={toolInput} showRawParameters={showRawParameters} />;
      }

      // Special handling for TodoWrite tool
      if (toolName === 'TodoWrite' && parsedInput.todos && Array.isArray(parsedInput.todos)) {
        return (
          <details className="mt-2 group" open={autoExpandTools}>
            <summary className="text-sm font-bold text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 flex items-center gap-2 list-none">
              <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Updating Todo List</span>
            </summary>
            <div className="mt-3 bg-white/50 dark:bg-gray-800/30 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/30 shadow-sm">
              <TodoList todos={parsedInput.todos} />
            </div>
          </details>
        );
      }

      // Implementation Plan mode
      if (toolName === 'exit_plan_mode' && parsedInput.plan) {
        const planContent = parsedInput.plan.replace(/\\n/g, '\n');
        return (
          <details className="mt-2 group" open={autoExpandTools}>
            <summary className="text-sm font-bold text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-800 flex items-center gap-2 list-none">
              <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
              <span>📋 View Implementation Plan</span>
            </summary>
            <div className="mt-3 prose prose-sm max-w-none dark:prose-invert bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200/30 dark:border-blue-800/20">
              <ReactMarkdown>{planContent}</ReactMarkdown>
            </div>
          </details>
        );
      }
    } catch (e) {}

    // Fallback for generic tool input
    return (
      <details className="mt-2 group" open={autoExpandTools}>
        <summary className="text-[11px] font-bold text-blue-600/70 dark:text-blue-400/70 cursor-pointer hover:text-blue-600 flex items-center gap-2 list-none uppercase tracking-widest">
          <svg className="w-3 h-3 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
          <span>Input Parameters</span>
        </summary>
        <pre className="mt-2 text-[10px] bg-blue-100/30 dark:bg-blue-900/10 p-3 rounded-lg font-mono text-blue-900 dark:text-blue-100 break-words whitespace-pre-wrap border border-blue-200/20 dark:border-blue-800/20">
          {typeof toolInput === 'string' ? toolInput : JSON.stringify(toolInput, null, 2)}
        </pre>
      </details>
    );
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-950/10 border border-blue-200/60 dark:border-blue-800/50 rounded-2xl p-4 sm:p-5 mb-4 shadow-sm shadow-blue-500/5 animate-in slide-in-from-left-2 duration-300">
      <ToolUsageHeader toolName={toolName} toolId={toolId} onShowSettings={onShowSettings} />
      
      {renderToolInput()}

      {toolResult && (
        <ToolResult 
          toolName={toolName} 
          result={toolResult} 
          onFileOpen={onFileOpen} 
          autoExpandTools={autoExpandTools} 
        />
      )}
    </div>
  );
};

export default ToolUsageSection;

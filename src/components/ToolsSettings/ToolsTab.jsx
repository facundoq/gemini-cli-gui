import React, { useState } from 'react';
import { Plus, X, Shield, Volume2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const ToolsTab = ({
  allowedTools,
  setAllowedTools,
  disallowedTools,
  setDisallowedTools,
  enableNotificationSound,
  setEnableNotificationSound
}) => {
  const [newAllowedTool, setNewAllowedTool] = useState("");
  const [newDisallowedTool, setNewDisallowedTool] = useState("");

  const commonTools = [
    "Bash(git log:*)", "Bash(git diff:*)", "Bash(git status:*)",
    "Write", "write_file", "Read", "Edit", "Glob", "Grep",
    "MultiEdit", "Task", "TodoWrite", "TodoRead", "WebFetch", "WebSearch"
  ];

  const addAllowedTool = (tool) => {
    if (tool && !allowedTools.includes(tool)) {
      setAllowedTools([...allowedTools, tool]);
      setNewAllowedTool("");
    }
  };

  const addDisallowedTool = (tool) => {
    if (tool && !disallowedTools.includes(tool)) {
      setDisallowedTools([...disallowedTools, tool]);
      setNewDisallowedTool("");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Notifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-medium text-foreground">Notifications</h3>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableNotificationSound}
              onChange={(e) => setEnableNotificationSound(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
            />
            <div>
              <div className="font-medium text-purple-900 dark:text-purple-100">Notification Sound</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Play a sound when a task is completed or needs attention</div>
            </div>
          </label>
        </div>
      </div>

      {/* Allowed Tools */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-medium text-foreground">Allowed Tools</h3>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAllowedTool}
                onChange={(e) => setNewAllowedTool(e.target.value)}
                placeholder="e.g. Bash(git log:*)"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-foreground"
                onKeyDown={(e) => e.key === 'Enter' && addAllowedTool(newAllowedTool)}
              />
              <Button size="sm" onClick={() => addAllowedTool(newAllowedTool)} disabled={!newAllowedTool.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allowedTools.map(tool => (
                <Badge key={tool} variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-800 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                  {tool}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setAllowedTools(allowedTools.filter(t => t !== tool))} />
                </Badge>
              ))}
              {allowedTools.length === 0 && <div className="text-sm text-gray-500">No tools explicitly allowed by path</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Disallowed Tools */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-medium text-foreground">Disallowed Tools</h3>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newDisallowedTool}
                onChange={(e) => setNewDisallowedTool(e.target.value)}
                placeholder="e.g. Bash(rm -rf *)"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-foreground"
                onKeyDown={(e) => e.key === 'Enter' && addDisallowedTool(newDisallowedTool)}
              />
              <Button size="sm" variant="destructive" onClick={() => addDisallowedTool(newDisallowedTool)} disabled={!newDisallowedTool.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {disallowedTools.map(tool => (
                <Badge key={tool} variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-800 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                  {tool}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setDisallowedTools(disallowedTools.filter(t => t !== tool))} />
                </Badge>
              ))}
              {disallowedTools.length === 0 && <div className="text-sm text-gray-500">No tools explicitly disallowed by path</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Preset Suggestions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Common Tools Presets</h4>
        <div className="flex flex-wrap gap-2">
          {commonTools.map(tool => (
            <button
              key={tool}
              onClick={() => addAllowedTool(tool)}
              className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md transition-colors border border-gray-200 dark:border-gray-700"
            >
              + {tool}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolsTab;

import React from 'react';
import { Zap, Shield } from 'lucide-react';

export const ModelSelector = ({ selectedModel, setSelectedModel, availableModels }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 text-cyan-500" />
        <h3 className="text-lg font-medium text-foreground">Gemini Model</h3>
      </div>
      <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">Select Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          >
            {availableModels.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {availableModels.find((m) => m.value === selectedModel)?.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ApprovalModeSelector = ({ approvalMode, setApprovalMode, setSkipPermissions, useSandbox, setUseSandbox, approvalModes }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-medium text-foreground">Approval Mode</h3>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">Select Mode</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {approvalModes.map((mode) => (
                <div
                  key={mode.value}
                  onClick={() => {
                    setApprovalMode(mode.value);
                    setSkipPermissions(mode.value === 'yolo');
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${approvalMode === mode.value
                    ? "bg-blue-600 border-blue-600 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400"
                    }`}
                >
                  <div className="font-medium text-sm">{mode.label}</div>
                  <div className={`text-xs mt-1 ${approvalMode === mode.value ? "text-blue-100" : "text-gray-500"}`}>
                    {mode.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useSandbox}
                onChange={(e) => setUseSandbox(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  Enable Sandbox Mode
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Run tool executions in a secure, containerized environment (--sandbox)
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

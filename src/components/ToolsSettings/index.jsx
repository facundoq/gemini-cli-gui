import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';

import ToolsTab from './ToolsTab';
import AppearanceTab from './AppearanceTab';
import McpTab from './McpTab';
import { ModelSelector, ApprovalModeSelector } from './Selectors';

import { useSettings } from './hooks/useSettings';
import { useMcpServers } from './hooks/useMcpServers';

export const availableModels = [
  { value: "auto", label: "Auto model (Recommended)", description: "Automatically chooses the best model (Gemini 3) for the task." },
  { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview", description: "Latest advanced reasoning model for complex tasks." },
  { value: "gemini-3-pro-preview", label: "Gemini 3 Pro Preview", description: "Capable next-generation model for debugging and design." },
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview", description: "High-speed next-generation model for fast iterations." },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "Stable advanced model for complex tasks." },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "Fast and balanced model for general tasks." },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", description: "Fastest possible model for simple tasks." },
];

export const approvalModes = [
  { value: "default", label: "Default (Prompt)", description: "Prompt for all tool approvals (Secure)." },
  { value: "auto_edit", label: "Auto-edit", description: "Auto-approve file edits, prompt for shell commands." },
  { value: "yolo", label: "YOLO (Full Auto)", description: "Auto-approve all tools including shell commands (Fastest)." },
  { value: "plan", label: "Plan (Read-only)", description: "Research-only mode. Cannot modify files or run commands." },
];

function ToolsSettings({ isOpen, onClose }) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("tools");

  const {
    allowedTools, setAllowedTools,
    disallowedTools, setDisallowedTools,
    approvalMode, setApprovalMode,
    setSkipPermissions,
    useSandbox, setUseSandbox,
    projectSortOrder, setProjectSortOrder,
    selectedModel, setSelectedModel,
    enableNotificationSound, setEnableNotificationSound,
    isSaving, saveStatus,
    saveSettings
  } = useSettings(isOpen, onClose);

  const {
    mcpServers,
    mcpTestResults,
    mcpServerTools,
    mcpToolsLoading,
    onDeleteServer,
    onTestServer,
    onDiscoverTools
  } = useMcpServers();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 flex items-center justify-center z-[100] md:p-4 bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-border md:rounded-2xl shadow-2xl w-full md:max-w-4xl h-full md:h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-gray-50/50 dark:bg-gray-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Settings</h2>
              <p className="text-xs text-muted-foreground">Configure tools, environment, and appearance</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full w-10 h-10 p-0 text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-gray-50/30 dark:bg-gray-900/10 p-2 md:p-4 flex md:flex-col gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("tools")}
              className={`flex-1 md:flex-none px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "tools" ? "bg-blue-600 text-white shadow-md" : "text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-800"}`}
            >
              Tools & Permissions
            </button>
            <button
              onClick={() => setActiveTab("mcp")}
              className={`flex-1 md:flex-none px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "mcp" ? "bg-blue-600 text-white shadow-md" : "text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-800"}`}
            >
              MCP Servers
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex-1 md:flex-none px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "appearance" ? "bg-blue-600 text-white shadow-md" : "text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-800"}`}
            >
              Appearance
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === "tools" && (
              <div className="space-y-10">
                <ModelSelector 
                  selectedModel={selectedModel} 
                  setSelectedModel={setSelectedModel} 
                  availableModels={availableModels} 
                />
                <ApprovalModeSelector 
                  approvalMode={approvalMode} 
                  setApprovalMode={setApprovalMode} 
                  setSkipPermissions={setSkipPermissions} 
                  useSandbox={useSandbox} 
                  setUseSandbox={setUseSandbox} 
                  approvalModes={approvalModes} 
                />
                <ToolsTab 
                  allowedTools={allowedTools}
                  setAllowedTools={setAllowedTools}
                  disallowedTools={disallowedTools}
                  setDisallowedTools={setDisallowedTools}
                  enableNotificationSound={enableNotificationSound}
                  setEnableNotificationSound={setEnableNotificationSound}
                />
              </div>
            )}

            {activeTab === "appearance" && (
              <AppearanceTab 
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                projectSortOrder={projectSortOrder}
                setProjectSortOrder={setProjectSortOrder}
              />
            )}

            {activeTab === "mcp" && (
              <McpTab 
                mcpServers={mcpServers}
                onOpenForm={() => alert('MCP configuration is currently read-only in this version.')}
                onDeleteServer={() => {}}
                onTestServer={() => {}}
                onDiscoverTools={() => {}}
                mcpTestResults={mcpTestResults}
                mcpServerTools={mcpServerTools}
                mcpToolsLoading={mcpToolsLoading}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-border bg-gray-50/50 dark:bg-gray-800/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground font-medium">
            {saveStatus === 'success' && <span className="text-green-600 dark:text-green-400 flex items-center gap-2">✓ Settings saved successfully</span>}
            {saveStatus === 'error' && <span className="text-red-600 dark:text-red-400">✗ Error saving settings</span>}
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" onClick={onClose} className="flex-1 md:flex-none font-bold rounded-xl h-11">Cancel</Button>
            <Button onClick={saveSettings} disabled={isSaving} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11 px-8 shadow-lg active:scale-95 transition-all">
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ToolsSettings;

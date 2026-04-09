import React, { useState, useCallback } from 'react';
import { RefreshCw, GitBranch, History, FileText, AlertTriangle, Check, X } from 'lucide-react';

import BranchSelector from './BranchSelector';
import RemoteActions from './RemoteActions';
import ChangesList from './ChangesList';
import CommitHistory from './CommitHistory';
import CommitForm from './CommitForm';

import { useGitStatus } from './hooks/useGitStatus';
import { useGitActions } from './hooks/useGitActions';

function GitPanel({ selectedProject, isMobile }) {
  const [activeView, setActiveView] = useState('changes'); // 'changes' or 'history'
  const [isCommitAreaCollapsed, setIsCommitAreaCollapsed] = useState(isMobile);
  const [commitMessage, setCommitMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const {
    gitStatus,
    branches,
    currentBranch,
    remoteStatus,
    isLoading,
    selectedFiles,
    setSelectedFiles,
    gitDiff,
    fetchGitStatus,
    fetchBranches,
    fetchRemoteStatus,
    switchBranch
  } = useGitStatus(selectedProject, activeView);

  const {
    isCommitting,
    isCreatingBranch,
    isFetching,
    isPulling,
    isPushing,
    isGeneratingMessage,
    handleCommit,
    discardChanges,
    handleFetch,
    handlePull,
    handlePush,
    createBranch,
    generateCommitMessage
  } = useGitActions(selectedProject, fetchGitStatus, fetchRemoteStatus, setSelectedFiles);

  const executeCommit = async () => {
    const success = await handleCommit(commitMessage, selectedFiles);
    if (success) {
      setCommitMessage('');
    }
  };

  const executeAICommitMessage = async () => {
    const message = await generateCommitMessage(selectedFiles);
    if (message) {
      setCommitMessage(message);
    }
  };

  const confirmAndExecute = async () => {
    if (!confirmAction) return;
    const { type, file } = confirmAction;
    setConfirmAction(null);

    switch (type) {
      case 'discard':
        await discardChanges(file);
        break;
      case 'pull':
        await handlePull();
        break;
      case 'push':
        await handlePush();
        break;
      default:
        break;
    }
  };

  if (!selectedProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-8 space-y-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 opacity-20" />
        </div>
        <p className="font-medium">Select a project to view source control</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}>
        <BranchSelector 
          currentBranch={currentBranch}
          branches={branches}
          onSwitchBranch={switchBranch}
          onCreateBranch={createBranch}
          isCreatingBranch={isCreatingBranch}
          isMobile={isMobile}
          remoteStatus={remoteStatus}
        />
        
        <div className="flex items-center gap-2">
          <RemoteActions 
            remoteStatus={remoteStatus}
            onPull={handlePull}
            onPush={handlePush}
            onFetch={handleFetch}
            isPulling={isPulling}
            isPushing={isPushing}
            isFetching={isFetching}
            setConfirmAction={setConfirmAction}
          />
          
          <button
            onClick={() => { fetchGitStatus(); fetchBranches(); fetchRemoteStatus(); }}
            disabled={isLoading}
            className={`p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-500 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`}
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {gitStatus?.error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 px-6 py-12 space-y-6">
          <AlertTriangle className="w-16 h-16 text-amber-500 opacity-50" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{gitStatus.error}</h3>
            {gitStatus.details && <p className="text-sm leading-relaxed max-w-sm">{gitStatus.details}</p>}
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/50 max-w-md shadow-sm">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center font-medium">
              💡 Run <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded font-mono text-xs">git init</code> to start tracking.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* View Toggle Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4">
            <button
              onClick={() => setActiveView('changes')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all duration-200 ${
                activeView === 'changes' 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-500' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Changes
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all duration-200 ${
                activeView === 'history' 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-500' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              History
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-950/20">
            {activeView === 'changes' ? (
              <ChangesList 
                gitStatus={gitStatus}
                selectedFiles={selectedFiles}
                onToggleSelect={(file) => {
                  setSelectedFiles(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(file)) newSet.delete(file);
                    else newSet.add(file);
                    return newSet;
                  });
                }}
                gitDiff={gitDiff}
                onDiscard={(file) => setConfirmAction({ 
                  type: 'discard', 
                  file, 
                  message: `Discard changes in ${file}?` 
                })}
                isMobile={isMobile}
              />
            ) : (
              <CommitHistory 
                selectedProject={selectedProject}
                isMobile={isMobile}
              />
            )}
          </div>

          {activeView === 'changes' && (
            <CommitForm 
              commitMessage={commitMessage}
              setCommitMessage={setCommitMessage}
              onCommit={executeCommit}
              onGenerateMessage={executeAICommitMessage}
              isCommitting={isCommitting}
              isGeneratingMessage={isGeneratingMessage}
              selectedFilesCount={selectedFiles.size}
              isMobile={isMobile}
              isCollapsed={isCommitAreaCollapsed}
              onToggleCollapse={() => setIsCommitAreaCollapsed(!isCommitAreaCollapsed)}
            />
          )}
        </>
      )}

      {/* Generic Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Action</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{confirmAction.message}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setConfirmAction(null)} 
                  className="flex-1 px-4 py-2.5 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAndExecute}
                  className="flex-1 px-4 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GitPanel;

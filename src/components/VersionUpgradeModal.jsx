import React from 'react';

const VersionUpgradeModal = ({ 
  isOpen, 
  onClose, 
  currentVersion, 
  latestVersion 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 p-6 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Update Available</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">A new version is ready</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Version Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-gray-100 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-400">Current</span>
            <span className="text-sm text-gray-900 dark:text-white font-mono font-bold">{currentVersion}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Latest</span>
            <span className="text-sm text-blue-900 dark:text-blue-100 font-mono font-bold animate-pulse">{latestVersion}</span>
          </div>
        </div>

        {/* Upgrade Instructions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">To Upgrade:</h3>
          <div className="bg-gray-100 dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <code className="text-[13px] text-blue-600 dark:text-blue-400 font-mono font-bold">
              git pull && npm install
            </code>
          </div>
          <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed italic">
            Restart the application after completion to apply changes.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            Later
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText('git checkout main && git pull && npm install');
              onClose();
            }}
            className="flex-1 px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            Copy Command
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionUpgradeModal;

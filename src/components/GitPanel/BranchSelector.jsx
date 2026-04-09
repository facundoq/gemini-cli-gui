import React, { useState, useRef, useEffect } from 'react';
import { GitBranch, ChevronDown, Check, Plus, X } from 'lucide-react';

const BranchSelector = ({ 
  currentBranch, 
  branches, 
  onSwitchBranch, 
  onCreateBranch, 
  isCreatingBranch,
  isMobile,
  remoteStatus
}) => {
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showNewBranchModal, setShowNewBranchModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowBranchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = async () => {
    if (await onCreateBranch(newBranchName)) {
      setShowNewBranchModal(false);
      setShowBranchDropdown(false);
      setNewBranchName('');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowBranchDropdown(!showBranchDropdown)}
        className={`flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors ${isMobile ? 'space-x-1 px-2 py-1' : 'space-x-2 px-3 py-1.5'}`}
      >
        <GitBranch className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
        <div className="flex items-center gap-1">
          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>{currentBranch}</span>
          {remoteStatus?.hasRemote && (
            <div className="flex items-center gap-1 text-xs">
              {remoteStatus.ahead > 0 && (
                <span className="text-green-600 dark:text-green-400" title={`${remoteStatus.ahead} ahead`}>↑{remoteStatus.ahead}</span>
              )}
              {remoteStatus.behind > 0 && (
                <span className="text-blue-600 dark:text-blue-400" title={`${remoteStatus.behind} behind`}>↓{remoteStatus.behind}</span>
              )}
              {remoteStatus.isUpToDate && (
                <span className="text-gray-500 dark:text-gray-400" title="Up to date">✓</span>
              )}
            </div>
          )}
        </div>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${showBranchDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showBranchDropdown && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1 max-h-64 overflow-y-auto">
            {branches.map(branch => (
              <button
                key={branch}
                onClick={() => { onSwitchBranch(branch); setShowBranchDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  branch === currentBranch ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {branch === currentBranch && <Check className="w-3 h-3 text-green-600 dark:text-green-400" />}
                  <span className={branch === currentBranch ? 'font-medium' : ''}>{branch}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <button
              onClick={() => { setShowNewBranchModal(true); setShowBranchDropdown(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <Plus className="w-3 h-3" />
              <span>Create new branch</span>
            </button>
          </div>
        </div>
      )}

      {showNewBranchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Create New Branch</h3>
              <button onClick={() => setShowNewBranchModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Branch Name</label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="feature/new-feature"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowNewBranchModal(false)} className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button
                  onClick={handleCreate}
                  disabled={!newBranchName.trim() || isCreatingBranch}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreatingBranch ? 'Creating...' : 'Create Branch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchSelector;

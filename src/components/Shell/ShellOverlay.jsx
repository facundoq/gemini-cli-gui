import React from 'react';

const ShellOverlay = ({ 
  isInitialized, 
  isConnected, 
  isConnecting, 
  selectedSession, 
  selectedProject, 
  onConnect 
}) => {
  if (!isInitialized) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
        <div className="text-white">Loading terminal...</div>
      </div>
    );
  }

  if (!isConnected && !isConnecting) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
        <div className="text-center max-w-sm w-full">
          <button
            onClick={onConnect}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-base font-medium w-full sm:w-auto shadow-lg"
            title="Connect to shell"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Continue in Shell</span>
          </button>
          <p className="text-gray-400 text-sm mt-3 px-2">
            {selectedSession ? 
              `Resume session: ${selectedSession.summary.slice(0, 50)}...` : 
              'Start a new Gemini session'
            }
          </p>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
        <div className="text-center max-w-sm w-full">
          <div className="flex items-center justify-center space-x-3 text-yellow-400">
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent"></div>
            <span className="text-base font-medium">Connecting to shell...</span>
          </div>
          <p className="text-gray-400 text-sm mt-3 px-2">
            Starting Gemini CLI in {selectedProject?.displayName || selectedProject?.name}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default ShellOverlay;

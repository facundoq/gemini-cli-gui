import React from 'react';
import { Download, Upload, RefreshCw } from 'lucide-react';

const RemoteActions = ({ 
  remoteStatus, 
  onPull, 
  onPush, 
  onFetch, 
  isPulling, 
  isPushing, 
  isFetching,
  setConfirmAction 
}) => {
  if (!remoteStatus?.hasRemote) return null;

  return (
    <div className="flex items-center gap-1 md:gap-2">
      {remoteStatus.behind > 0 && (
        <button
          onClick={() => setConfirmAction({ 
            type: 'pull', 
            message: `Pull ${remoteStatus.behind} commit${remoteStatus.behind !== 1 ? 's' : ''} from ${remoteStatus.remoteName}?` 
          })}
          disabled={isPulling}
          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
          title={`Pull ${remoteStatus.behind} commits`}
        >
          <Download className={`w-3 h-3 ${isPulling ? 'animate-pulse' : ''}`} />
          <span>{isPulling ? 'Pulling...' : `Pull ${remoteStatus.behind}`}</span>
        </button>
      )}
      
      {remoteStatus.ahead > 0 && (
        <button
          onClick={() => setConfirmAction({ 
            type: 'push', 
            message: `Push ${remoteStatus.ahead} commit${remoteStatus.ahead !== 1 ? 's' : ''} to ${remoteStatus.remoteName}?` 
          })}
          disabled={isPushing}
          className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
          title={`Push ${remoteStatus.ahead} commits`}
        >
          <Upload className={`w-3 h-3 ${isPushing ? 'animate-pulse' : ''}`} />
          <span>{isPushing ? 'Pushing...' : `Push ${remoteStatus.ahead}`}</span>
        </button>
      )}
      
      {(remoteStatus.ahead > 0 || remoteStatus.behind > 0) && (
        <button
          onClick={onFetch}
          disabled={isFetching}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
          title="Fetch from remote"
        >
          <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
          <span>{isFetching ? 'Fetching...' : 'Fetch'}</span>
        </button>
      )}
      
      {remoteStatus.isUpToDate && (
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
          ✓ Up to date
        </span>
      )}
    </div>
  );
};

export default RemoteActions;

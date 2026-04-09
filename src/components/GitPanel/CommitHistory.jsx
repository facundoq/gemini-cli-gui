import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, History } from 'lucide-react';
import { authenticatedFetch } from '../../utils/api';
import { renderDiffLine } from './utils.jsx';

const CommitItem = ({ commit, project, isMobile }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleExpand = async () => {
    setIsExpanded(!isExpanded);
    if (!diff && !loading) {
      setLoading(true);
      try {
        const response = await authenticatedFetch(`/api/git/commit-diff?project=${encodeURIComponent(project.name)}&commit=${commit.hash}`);
        const data = await response.json();
        if (!data.error && data.diff) setDiff(data.diff);
      } catch (error) {
        console.error('Error fetching commit diff:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0 overflow-hidden">
      <div 
        className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer group transition-colors"
        onClick={toggleExpand}
      >
        <div className="mr-2 mt-0.5 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-400 group-hover:text-gray-600">
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate leading-snug">
                {commit.message}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-gray-500 dark:text-gray-400">
                  {commit.hash.substring(0, 7)}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-500">•</span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{commit.author}</span> • {commit.date}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="bg-gray-50/50 dark:bg-black/20 border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-1 duration-200">
          {loading ? (
            <div className="p-4 text-center text-xs text-gray-500 animate-pulse font-medium">Loading diff...</div>
          ) : diff ? (
            <div className="max-h-96 overflow-y-auto p-1 md:p-2 bg-white dark:bg-gray-950/50">
              <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 px-3 py-1.5 mb-2 rounded border border-blue-100 dark:border-blue-900/50 leading-relaxed font-medium">
                {commit.stats}
              </div>
              {diff.split('\n').map((line, index) => renderDiffLine(line, index, isMobile, false))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-red-500 font-medium">Failed to load diff</div>
          )}
        </div>
      )}
    </div>
  );
};

const CommitHistory = ({ selectedProject, isMobile }) => {
  const [recentCommits, setRecentCommits] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentCommits = useCallback(async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const response = await authenticatedFetch(`/api/git/commits?project=${encodeURIComponent(selectedProject.name)}&limit=20`);
      const data = await response.json();
      if (!data.error && data.commits) setRecentCommits(data.commits);
    } catch (error) {
      console.error('Error fetching commits:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  React.useEffect(() => {
    fetchRecentCommits();
  }, [fetchRecentCommits]);

  if (loading && recentCommits.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
        <p className="text-sm font-medium">Loading history...</p>
      </div>
    );
  }

  if (recentCommits.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-8 space-y-4">
        <History className="w-12 h-12 opacity-20" />
        <p className="text-sm font-medium">No commits found yet.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {recentCommits.map(commit => (
        <CommitItem 
          key={commit.hash} 
          commit={commit} 
          project={selectedProject} 
          isMobile={isMobile} 
        />
      ))}
    </div>
  );
};

export default CommitHistory;

import { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch } from '../../../utils/api';

export const useGitStatus = (selectedProject, activeView) => {
  const [gitStatus, setGitStatus] = useState(null);
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('');
  const [remoteStatus, setRemoteStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [gitDiff, setGitDiff] = useState({});

  const fetchFileDiff = useCallback(async (filePath) => {
    if (!selectedProject) return;
    try {
      const response = await authenticatedFetch(`/api/git/diff?project=${encodeURIComponent(selectedProject.name)}&file=${encodeURIComponent(filePath)}`);
      const data = await response.json();
      if (!data.error && data.diff) {
        setGitDiff(prev => ({ ...prev, [filePath]: data.diff }));
      }
    } catch (error) {
      console.error('Error fetching file diff:', error);
    }
  }, [selectedProject]);

  const fetchGitStatus = useCallback(async () => {
    if (!selectedProject) return;
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`/api/git/status?project=${encodeURIComponent(selectedProject.name)}`);
      const data = await response.json();
      if (data.error) {
        setGitStatus({ error: data.error, details: data.details });
      } else {
        setGitStatus(data);
        setCurrentBranch(data.branch || 'main');
        
        const allFiles = new Set([
          ...(data.modified || []),
          ...(data.added || []),
          ...(data.deleted || []),
          ...(data.untracked || [])
        ]);
        setSelectedFiles(allFiles);
        
        for (const file of data.modified || []) fetchFileDiff(file);
        for (const file of data.added || []) fetchFileDiff(file);
      }
    } catch (error) {
      console.error('Error fetching git status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, fetchFileDiff]);

  const fetchBranches = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const response = await authenticatedFetch(`/api/git/branches?project=${encodeURIComponent(selectedProject.name)}`);
      const data = await response.json();
      if (!data.error && data.branches) setBranches(data.branches);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  }, [selectedProject]);

  const fetchRemoteStatus = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const response = await authenticatedFetch(`/api/git/remote-status?project=${encodeURIComponent(selectedProject.name)}`);
      const data = await response.json();
      if (!data.error) setRemoteStatus(data);
      else setRemoteStatus(null);
    } catch (error) {
      console.error('Error fetching remote status:', error);
      setRemoteStatus(null);
    }
  }, [selectedProject]);

  const switchBranch = async (branchName) => {
    if (!selectedProject) return;
    try {
      const response = await authenticatedFetch('/api/git/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: selectedProject.name, branch: branchName })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentBranch(branchName);
        fetchGitStatus();
      }
    } catch (error) {
      console.error('Error switching branch:', error);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      fetchGitStatus();
      fetchBranches();
      fetchRemoteStatus();
    }
  }, [selectedProject, fetchGitStatus, fetchBranches, fetchRemoteStatus]);

  return {
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
  };
};

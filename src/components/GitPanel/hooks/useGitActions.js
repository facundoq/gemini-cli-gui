import { useState } from 'react';
import { authenticatedFetch } from '../../../utils/api';

export const useGitActions = (selectedProject, fetchGitStatus, fetchRemoteStatus, setSelectedFiles) => {
  const [isCommitting, setIsCommitting] = useState(false);
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);

  const handleCommit = async (commitMessage, selectedFiles) => {
    if (!commitMessage.trim() || selectedFiles.size === 0) return;
    setIsCommitting(true);
    try {
      const response = await authenticatedFetch('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: selectedProject.name,
          message: commitMessage,
          files: Array.from(selectedFiles)
        })
      });
      const data = await response.json();
      if (data.success) {
        setSelectedFiles(new Set());
        fetchGitStatus();
        fetchRemoteStatus();
        return true;
      }
    } catch (error) {
      console.error('Error committing changes:', error);
    } finally {
      setIsCommitting(false);
    }
    return false;
  };

  const discardChanges = async (filePath) => {
    try {
      const response = await authenticatedFetch('/api/git/discard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: selectedProject.name, file: filePath })
      });
      const data = await response.json();
      if (data.success) {
        setSelectedFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(filePath);
          return newSet;
        });
        fetchGitStatus();
        return true;
      }
    } catch (error) {
      console.error('Error discarding changes:', error);
    }
    return false;
  };

  const handleFetch = async () => {
    setIsFetching(true);
    try {
      const response = await authenticatedFetch('/api/git/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: selectedProject.name })
      });
      const data = await response.json();
      if (data.success) {
        fetchGitStatus();
        fetchRemoteStatus();
      }
    } catch (error) {
      console.error('Error fetching from remote:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handlePull = async () => {
    setIsPulling(true);
    try {
      const response = await authenticatedFetch('/api/git/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: selectedProject.name })
      });
      const data = await response.json();
      if (data.success) {
        fetchGitStatus();
        fetchRemoteStatus();
        return true;
      }
    } catch (error) {
      console.error('Error pulling from remote:', error);
    } finally {
      setIsPulling(false);
    }
    return false;
  };

  const handlePush = async () => {
    setIsPushing(true);
    try {
      const response = await authenticatedFetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: selectedProject.name })
      });
      const data = await response.json();
      if (data.success) {
        fetchGitStatus();
        fetchRemoteStatus();
        return true;
      }
    } catch (error) {
      console.error('Error pushing to remote:', error);
    } finally {
      setIsPushing(false);
    }
    return false;
  };

  const createBranch = async (newBranchName) => {
    if (!newBranchName.trim()) return false;
    setIsCreatingBranch(true);
    try {
      const response = await authenticatedFetch('/api/git/create-branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: selectedProject.name, branch: newBranchName.trim() })
      });
      const data = await response.json();
      if (data.success) {
        fetchGitStatus();
        return true;
      }
    } catch (error) {
      console.error('Error creating branch:', error);
    } finally {
      setIsCreatingBranch(false);
    }
    return false;
  };

  const generateCommitMessage = async (selectedFiles) => {
    setIsGeneratingMessage(true);
    try {
      const response = await authenticatedFetch('/api/git/generate-commit-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: selectedProject.name, files: Array.from(selectedFiles) })
      });
      const data = await response.json();
      return data.message || '';
    } catch (error) {
      console.error('Error generating commit message:', error);
    } finally {
      setIsGeneratingMessage(false);
    }
    return '';
  };

  return {
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
  };
};

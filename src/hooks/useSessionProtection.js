import { useState, useCallback } from 'react';

export const useSessionProtection = (projects, selectedProject, selectedSession) => {
  const [activeSessions, setActiveSessions] = useState(new Set());

  const isUpdateAdditive = useCallback((updatedProjects) => {
    if (!selectedProject || !selectedSession) return true;

    const currentSelectedProject = projects?.find(p => p.name === selectedProject.name);
    const updatedSelectedProject = updatedProjects?.find(p => p.name === selectedProject.name);

    if (!currentSelectedProject || !updatedSelectedProject) return false;

    const currentSelectedSession = currentSelectedProject.sessions?.find(s => s.id === selectedSession.id);
    const updatedSelectedSession = updatedSelectedProject.sessions?.find(s => s.id === selectedSession.id);

    if (!currentSelectedSession || !updatedSelectedSession) return false;

    return (
      currentSelectedSession.id === updatedSelectedSession.id &&
      currentSelectedSession.title === updatedSelectedSession.title &&
      currentSelectedSession.created_at === updatedSelectedSession.created_at &&
      currentSelectedSession.updated_at === updatedSelectedSession.updated_at
    );
  }, [projects, selectedProject, selectedSession]);

  const hasActiveSession = useCallback(() => {
    return (selectedSession && activeSessions.has(selectedSession.id)) ||
           (activeSessions.size > 0 && Array.from(activeSessions).some(id => id.startsWith('new-session-')));
  }, [selectedSession, activeSessions]);

  const markSessionAsActive = useCallback((sessionId) => {
    if (sessionId) setActiveSessions(prev => new Set([...prev, sessionId]));
  }, []);

  const markSessionAsInactive = useCallback((sessionId) => {
    if (sessionId) setActiveSessions(prev => {
      const newSet = new Set(prev);
      newSet.delete(sessionId);
      return newSet;
    });
  }, []);

  const replaceTemporarySession = useCallback((realSessionId) => {
    if (realSessionId) setActiveSessions(prev => {
      const newSet = new Set();
      for (const id of prev) if (!id.startsWith('new-session-')) newSet.add(id);
      newSet.add(realSessionId);
      return newSet;
    });
  }, []);

  return {
    activeSessions,
    isUpdateAdditive,
    hasActiveSession,
    markSessionAsActive,
    markSessionAsInactive,
    replaceTemporarySession
  };
};

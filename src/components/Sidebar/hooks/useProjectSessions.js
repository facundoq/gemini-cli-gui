import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';

export const useProjectSessions = (projects, isLoading) => {
  const [loadingSessions, setLoadingSessions] = useState({});
  const [additionalSessions, setAdditionalSessions] = useState({});
  const [initialSessionsLoaded, setInitialSessionsLoaded] = useState(new Set());

  useEffect(() => {
    setAdditionalSessions({});
    setInitialSessionsLoaded(new Set());
  }, [projects]);

  useEffect(() => {
    if (projects.length > 0 && !isLoading) {
      const newLoaded = new Set();
      projects.forEach(project => {
        if (project.sessions && project.sessions.length >= 0) {
          newLoaded.add(project.name);
        }
      });
      setInitialSessionsLoaded(newLoaded);
    }
  }, [projects, isLoading]);

  const loadMoreSessions = async (project) => {
    const canLoadMore = project.sessionMeta?.hasMore !== false;
    
    if (!canLoadMore || loadingSessions[project.name]) {
      return;
    }

    setLoadingSessions(prev => ({ ...prev, [project.name]: true }));

    try {
      const currentSessionCount = (project.sessions?.length || 0) + (additionalSessions[project.name]?.length || 0);
      const result = await api.getSessions(project.name, 5, currentSessionCount);
      
      setAdditionalSessions(prev => ({
        ...prev,
        [project.name]: [
          ...(prev[project.name] || []),
          ...result.sessions
        ]
      }));
      
      if (result.hasMore === false) {
        project.sessionMeta = { ...project.sessionMeta, hasMore: false };
      }
    } catch (error) {
      console.error('Error loading more sessions:', error);
    } finally {
      setLoadingSessions(prev => ({ ...prev, [project.name]: false }));
    }
  };

  const getAllSessions = (project) => {
    const initialSessions = project.sessions || [];
    const additional = additionalSessions[project.name] || [];
    return [...initialSessions, ...additional];
  };

  return {
    loadingSessions,
    additionalSessions,
    initialSessionsLoaded,
    loadMoreSessions,
    getAllSessions
  };
};

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebSocket } from '../utils/websocket';
import { useVersionCheck } from './useVersionCheck';
import { api } from '../utils/api';
import { useSessionProtection } from './useSessionProtection';

export const useAppLogic = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  
  const { updateAvailable, latestVersion, currentVersion } = useVersionCheck('cruzyjapan', 'Gemini-CLI-UI');
  const [showVersionModal, setShowVersionModal] = useState(false);
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showToolsSettings, setShowToolsSettings] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  
  const [autoExpandTools, setAutoExpandTools] = useState(() => {
    const saved = localStorage.getItem('autoExpandTools');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [showRawParameters, setShowRawParameters] = useState(() => {
    const saved = localStorage.getItem('showRawParameters');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(() => {
    const saved = localStorage.getItem('autoScrollToBottom');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const { ws, sendMessage, messages } = useWebSocket();
  const sessionProtection = useSessionProtection(projects, selectedProject, selectedSession);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    let resizeTimeout;
    const debouncedCheckMobile = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };
    checkMobile();
    window.addEventListener('resize', debouncedCheckMobile);
    return () => window.removeEventListener('resize', debouncedCheckMobile);
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const response = await api.projects();
      const data = await response.json();
      setProjects(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  window.refreshProjects = fetchProjects;

  // Handle Real-time Updates
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.type === 'projects_updated') {
        if (sessionProtection.hasActiveSession() && !sessionProtection.isUpdateAdditive(latestMessage.projects)) {
          return;
        }
        
        const updatedProjects = latestMessage.projects;
        setProjects(updatedProjects);
        
        if (selectedProject) {
          const updatedSelectedProject = updatedProjects.find(p => p.name === selectedProject.name);
          if (updatedSelectedProject) {
            setSelectedProject(updatedSelectedProject);
            if (selectedSession && !updatedSelectedProject.sessions?.some(s => s.id === selectedSession.id)) {
              setSelectedSession(null);
            }
          }
        }
      }
    }
  }, [messages, selectedProject, selectedSession, sessionProtection]);

  // URL-based session loading
  useEffect(() => {
    if (sessionId && projects.length > 0) {
      const shouldSwitchTab = !selectedSession || selectedSession.id !== sessionId;
      for (const project of projects) {
        const session = project.sessions?.find(s => s.id === sessionId);
        if (session) {
          setSelectedProject(project);
          setSelectedSession(session);
          if (shouldSwitchTab) setActiveTab('chat');
          return;
        }
      }
    }
  }, [sessionId, projects, selectedSession]);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedSession(null);
    navigate('/');
    if (isMobile) setSidebarOpen(false);
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    if (activeTab !== 'git' && activeTab !== 'preview') setActiveTab('chat');
    if (isMobile) setSidebarOpen(false);
    navigate(`/session/${session.id}`);
  };

  const handleSessionDelete = (deletedSessionId) => {
    if (selectedSession?.id === deletedSessionId) {
      setSelectedSession(null);
      navigate('/');
    }
    fetchProjects();
  };

  const handleProjectDelete = (projectName) => {
    if (selectedProject?.name === projectName) {
      setSelectedProject(null);
      setSelectedSession(null);
      navigate('/');
    }
    fetchProjects();
  };

  return {
    navigate,
    updateAvailable, latestVersion, currentVersion,
    showVersionModal, setShowVersionModal,
    projects, selectedProject, selectedSession,
    activeTab, setActiveTab,
    isMobile, sidebarOpen, setSidebarOpen,
    isLoadingProjects, isInputFocused, setIsInputFocused,
    showToolsSettings, setShowToolsSettings,
    showQuickSettings, setShowQuickSettings,
    autoExpandTools, setAutoExpandTools,
    showRawParameters, setShowRawParameters,
    autoScrollToBottom, setAutoScrollToBottom,
    ws, sendMessage, messages,
    sessionProtection,
    handleProjectSelect, handleSessionSelect, handleSessionDelete, handleProjectDelete,
    fetchProjects
  };
};

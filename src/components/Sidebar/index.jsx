import React, { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Folder, Search, X, Plus, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { api } from '../../utils/api';

import SidebarHeader from './SidebarHeader';
import SidebarFooter from './SidebarFooter';
import ProjectItem from './ProjectItem';
import SessionItem from './SessionItem';
import NewProjectForm from './NewProjectForm';

import { useStarredProjects } from './hooks/useStarredProjects';
import { useProjectSessions } from './hooks/useProjectSessions';
import { sortProjects } from './utils';

function Sidebar({ 
  projects, 
  selectedProject, 
  selectedSession, 
  onProjectSelect, 
  onSessionSelect, 
  onNewSession,
  onSessionDelete,
  onProjectDelete,
  isLoading,
  onRefresh,
  onShowSettings,
  updateAvailable,
  latestVersion,
  currentVersion,
  onShowVersionModal
}) {
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [editingProject, setEditingProject] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [newProjectPath, setNewProjectPath] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [projectSortOrder, setProjectSortOrder] = useState('name');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [editingSessionName, setEditingSessionName] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const { starredProjects, toggleStarProject, isProjectStarred } = useStarredProjects();
  const { 
    loadingSessions, 
    additionalSessions, 
    initialSessionsLoaded, 
    loadMoreSessions, 
    getAllSessions 
  } = useProjectSessions(projects, isLoading);

  // Auto-update timestamps every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-expand project folder when a session is selected
  useEffect(() => {
    if (selectedSession && selectedProject) {
      setExpandedProjects(prev => new Set([...prev, selectedProject.name]));
    }
  }, [selectedSession, selectedProject]);

  // Load project sort order from settings
  useEffect(() => {
    const loadSortOrder = () => {
      try {
        const savedSettings = localStorage.getItem('gemini-tools-settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setProjectSortOrder(settings.projectSortOrder || 'name');
        }
      } catch (error) {}
    };
    loadSortOrder();
    const handleStorageChange = (e) => { if (e.key === 'gemini-tools-settings') loadSortOrder(); };
    window.addEventListener('storage', handleStorageChange);
    const checkInterval = setInterval(() => { if (document.hasFocus()) loadSortOrder(); }, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, []);

  const toggleProject = (projectName) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectName)) newExpanded.delete(projectName);
    else newExpanded.add(projectName);
    setExpandedProjects(newExpanded);
  };

  const handleCreateProject = async () => {
    if (!newProjectPath.trim()) return;
    setCreatingProject(true);
    try {
      const response = await api.createProject(newProjectPath.trim());
      if (response.ok) {
        setShowNewProject(false);
        setNewProjectPath('');
        if (window.refreshProjects) window.refreshProjects();
        else window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create project');
      }
    } catch (error) {
      alert('Error creating project');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleSaveProjectName = async (projectName) => {
    try {
      const response = await api.renameProject(projectName, editingName);
      if (response.ok) {
        if (window.refreshProjects) window.refreshProjects();
        else window.location.reload();
      }
    } catch (error) {}
    setEditingProject(null);
    setEditingName('');
  };

  const handleDeleteProject = async (projectName) => {
    if (!confirm('Are you sure you want to delete this empty project?')) return;
    try {
      const response = await api.deleteProject(projectName);
      if (response.ok && onProjectDelete) onProjectDelete(projectName);
      else {
        const error = await response.json();
        alert(error.error || 'Failed to delete project');
      }
    } catch (error) {}
  };

  const handleDeleteSession = async (projectName, sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      const response = await api.deleteSession(projectName, sessionId);
      if (response.ok && onSessionDelete) onSessionDelete(sessionId);
    } catch (error) {}
  };

  const updateSessionSummary = async (projectName, sessionId, newSummary) => {
    try {
      const response = await api.updateSession(projectName, sessionId, { summary: newSummary });
      if (response.ok) {
        setEditingSession(null);
        setEditingSessionName('');
        if (onRefresh) onRefresh();
      }
    } catch (error) {}
  };

  const sortedProjectsList = sortProjects(projects, starredProjects, projectSortOrder, additionalSessions);
  const filteredProjects = sortedProjectsList.filter(project => {
    if (!searchFilter.trim()) return true;
    const searchLower = searchFilter.toLowerCase();
    return (project.displayName || project.name).toLowerCase().includes(searchLower) || 
           project.name.toLowerCase().includes(searchLower);
  });

  // Touch handler helper
  const handleTouchClick = (callback) => (e) => {
    if (e.target.closest('.overflow-y-auto')) return;
    e.preventDefault(); e.stopPropagation();
    callback();
  };

  return (
    <div className="h-full flex flex-col bg-card md:select-none">
      <SidebarHeader 
        onRefresh={async () => {
          setIsRefreshing(true);
          try { await onRefresh(); } finally { setIsRefreshing(false); }
        }}
        onNewProject={() => setShowNewProject(true)}
        isRefreshing={isRefreshing}
      />

      {showNewProject && (
        <NewProjectForm 
          newProjectPath={newProjectPath}
          setNewProjectPath={setNewProjectPath}
          onCreateProject={handleCreateProject}
          onCancel={() => { setShowNewProject(false); setNewProjectPath(''); }}
          creatingProject={creatingProject}
        />
      )}

      {projects.length > 0 && !isLoading && (
        <div className="px-3 md:px-4 py-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9 h-9 text-sm bg-muted/50 border-0"
            />
            {searchFilter && (
              <button onClick={() => setSearchFilter('')} className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 md:px-2 md:py-3 overflow-y-auto overscroll-contain">
        <div className="md:space-y-1 pb-safe-area-inset-bottom">
          {isLoading ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4 animate-spin border-2 border-muted-foreground border-t-transparent" />
              <h3 className="text-base font-medium">Loading projects...</h3>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base font-medium">No projects found</h3>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base font-medium">No matching projects</h3>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div key={project.name} className="md:space-y-1">
                <ProjectItem 
                  project={project}
                  isSelected={selectedProject?.name === project.name}
                  isExpanded={expandedProjects.has(project.name)}
                  isStarred={isProjectStarred(project.name)}
                  editingProject={editingProject}
                  editingName={editingName}
                  setEditingName={setEditingName}
                  onToggleProject={toggleProject}
                  onProjectSelect={onProjectSelect}
                  onStartEditing={(p) => { setEditingProject(p.name); setEditingName(p.displayName); }}
                  onSaveProjectName={handleSaveProjectName}
                  onCancelEditing={() => { setEditingProject(null); setEditingName(''); }}
                  onDeleteProject={handleDeleteProject}
                  onToggleStar={toggleStarProject}
                  allSessionsCount={getAllSessions(project).length}
                  hasMoreSessions={project.sessionMeta?.hasMore !== false}
                  handleTouchClick={handleTouchClick}
                />
                {expandedProjects.has(project.name) && (
                  <div className="ml-3 space-y-1 border-l border-border pl-3">
                    {!initialSessionsLoaded.has(project.name) ? (
                      <div className="p-2 animate-pulse text-xs text-muted-foreground">Loading sessions...</div>
                    ) : getAllSessions(project).length === 0 ? (
                      <div className="py-2 px-3 text-xs text-muted-foreground">No sessions yet</div>
                    ) : (
                      getAllSessions(project).map(session => (
                        <SessionItem 
                          key={session.id}
                          session={session}
                          project={project}
                          selectedSession={selectedSession}
                          currentTime={currentTime}
                          onSessionSelect={onSessionSelect}
                          onProjectSelect={onProjectSelect}
                          onDeleteSession={handleDeleteSession}
                          editingSession={editingSession}
                          setEditingSession={setEditingSession}
                          editingSessionName={editingSessionName}
                          setEditingSessionName={setEditingSessionName}
                          updateSessionSummary={updateSessionSummary}
                          handleTouchClick={handleTouchClick}
                        />
                      ))
                    )}
                    {getAllSessions(project).length > 0 && project.sessionMeta?.hasMore !== false && (
                      <Button variant="ghost" size="sm" className="w-full justify-center gap-2 mt-2 text-xs" onClick={() => loadMoreSessions(project)} disabled={loadingSessions[project.name]}>
                        {loadingSessions[project.name] ? 'Loading...' : 'Show more sessions'}
                      </Button>
                    )}
                    <Button variant="default" size="sm" className="w-full justify-start gap-2 mt-1 h-8 text-xs" onClick={() => onNewSession(project)}>
                      <Plus className="w-3 h-3" /> New Session
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <SidebarFooter 
        updateAvailable={updateAvailable}
        latestVersion={latestVersion}
        onShowVersionModal={onShowVersionModal}
        onShowSettings={onShowSettings}
      />
    </div>
  );
}

export default Sidebar;

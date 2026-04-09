import React from 'react';
import { Button } from '../ui/button';
import { Folder, FolderOpen, Edit3, Trash2, Star, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const ProjectItem = ({
  project,
  isSelected,
  isExpanded,
  isStarred,
  editingProject,
  editingName,
  setEditingName,
  onToggleProject,
  onProjectSelect,
  onStartEditing,
  onSaveProjectName,
  onCancelEditing,
  onDeleteProject,
  onToggleStar,
  allSessionsCount,
  hasMoreSessions,
  handleTouchClick
}) => {
  const sessionCountText = hasMoreSessions && allSessionsCount >= 5 ? `${allSessionsCount}+` : allSessionsCount;

  return (
    <div className="group md:group">
      {/* Mobile Project Item */}
      <div className="md:hidden">
        <div
          className={cn(
            "p-3 mx-3 my-1 rounded-lg bg-card border border-border/50 active:scale-[0.98] transition-all duration-150",
            isSelected && "bg-primary/5 border-primary/20",
            isStarred && !isSelected && "bg-yellow-50/50 dark:bg-yellow-900/5 border-yellow-200/30 dark:border-yellow-800/30"
          )}
          onClick={() => onToggleProject(project.name)}
          onTouchEnd={handleTouchClick(() => onToggleProject(project.name))}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                isExpanded ? "bg-primary/10" : "bg-muted"
              )}>
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-primary" />
                ) : (
                  <Folder className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {editingProject === project.name ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-primary/40 focus:border-primary rounded-lg bg-background text-foreground shadow-sm focus:shadow-md transition-all duration-200 focus:outline-none"
                    placeholder="Project name"
                    autoFocus
                    autoComplete="off"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSaveProjectName(project.name);
                      if (e.key === 'Escape') onCancelEditing();
                    }}
                    style={{ fontSize: '16px', WebkitAppearance: 'none', borderRadius: '8px' }}
                  />
                ) : (
                  <>
                    <h3 className="text-sm font-medium text-foreground truncate">{project.displayName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {sessionCountText} session{allSessionsCount === 1 ? '' : 's'}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {editingProject === project.name ? (
                <>
                  <button
                    className="w-8 h-8 rounded-lg bg-green-500 dark:bg-green-600 flex items-center justify-center active:scale-90 transition-all duration-150 shadow-sm active:shadow-none"
                    onClick={(e) => { e.stopPropagation(); onSaveProjectName(project.name); }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </button>
                  <button
                    className="w-8 h-8 rounded-lg bg-gray-500 dark:bg-gray-600 flex items-center justify-center active:scale-90 transition-all duration-150 shadow-sm active:shadow-none"
                    onClick={(e) => { e.stopPropagation(); onCancelEditing(); }}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-all duration-150 border",
                      isStarred ? "bg-yellow-500/10 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800" : "bg-gray-500/10 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800"
                    )}
                    onClick={(e) => { e.stopPropagation(); onToggleStar(project.name); }}
                    onTouchEnd={handleTouchClick(() => onToggleStar(project.name))}
                  >
                    <Star className={cn("w-4 h-4 transition-colors", isStarred ? "text-yellow-600 dark:text-yellow-400 fill-current" : "text-gray-600 dark:text-gray-400")} />
                  </button>
                  {allSessionsCount === 0 && (
                    <button
                      className="w-8 h-8 rounded-lg bg-red-500/10 dark:bg-red-900/30 flex items-center justify-center active:scale-90 border border-red-200 dark:border-red-800"
                      onClick={(e) => { e.stopPropagation(); onDeleteProject(project.name); }}
                      onTouchEnd={handleTouchClick(() => onDeleteProject(project.name))}
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  )}
                  <button
                    className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center active:scale-90 border border-primary/20 dark:border-primary/30"
                    onClick={(e) => { e.stopPropagation(); onStartEditing(project); }}
                    onTouchEnd={handleTouchClick(() => onStartEditing(project))}
                  >
                    <Edit3 className="w-4 h-4 text-primary" />
                  </button>
                  <div className="w-6 h-6 rounded-md bg-muted/30 flex items-center justify-center">
                    {isExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop Project Item */}
      <Button
        variant="ghost"
        className={cn(
          "hidden md:flex w-full justify-between p-2 h-auto font-normal hover:bg-accent/50",
          isSelected && "bg-accent text-accent-foreground",
          isStarred && !isSelected && "bg-yellow-50/50 dark:bg-yellow-900/10 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/20"
        )}
        onClick={() => {
          if (!isSelected) onProjectSelect(project);
          onToggleProject(project.name);
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isExpanded ? <FolderOpen className="w-4 h-4 text-primary flex-shrink-0" /> : <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
          <div className="min-w-0 flex-1 text-left">
            {editingProject === project.name ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:ring-2 focus:ring-primary/20"
                  placeholder="Project name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSaveProjectName(project.name);
                    if (e.key === 'Escape') onCancelEditing();
                  }}
                />
                <div className="text-xs text-muted-foreground truncate" title={project.fullPath}>{project.fullPath}</div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-semibold truncate text-foreground" title={project.displayName}>{project.displayName}</div>
                <div className="text-xs text-muted-foreground">
                  {sessionCountText}
                  {project.fullPath !== project.displayName && (
                    <span className="ml-1 opacity-60" title={project.fullPath}>
                      • {project.fullPath.length > 25 ? '...' + project.fullPath.slice(-22) : project.fullPath}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {editingProject === project.name ? (
            <>
              <div className="w-6 h-6 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center justify-center rounded cursor-pointer" onClick={(e) => { e.stopPropagation(); onSaveProjectName(project.name); }}>
                <Check className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center rounded cursor-pointer" onClick={(e) => { e.stopPropagation(); onCancelEditing(); }}>
                <X className="w-3 h-3" />
              </div>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center rounded cursor-pointer",
                  isStarred ? "hover:bg-yellow-50 dark:hover:bg-yellow-900/20 opacity-100" : "hover:bg-accent"
                )}
                onClick={(e) => { e.stopPropagation(); onToggleStar(project.name); }}
              >
                <Star className={cn("w-3 h-3 transition-colors", isStarred ? "text-yellow-600 dark:text-yellow-400 fill-current" : "text-muted-foreground")} />
              </div>
              <div className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent flex items-center justify-center rounded cursor-pointer" onClick={(e) => { e.stopPropagation(); onStartEditing(project); }}>
                <Edit3 className="w-3 h-3" />
              </div>
              {allSessionsCount === 0 && (
                <div className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center rounded cursor-pointer" onClick={(e) => { e.stopPropagation(); onDeleteProject(project.name); }}>
                  <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                </div>
              )}
              {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />}
            </>
          )}
        </div>
      </Button>
    </div>
  );
};

export default ProjectItem;

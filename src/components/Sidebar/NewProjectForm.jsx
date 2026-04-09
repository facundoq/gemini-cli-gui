import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FolderPlus, X } from 'lucide-react';

const NewProjectForm = ({
  newProjectPath,
  setNewProjectPath,
  onCreateProject,
  onCancel,
  creatingProject
}) => {
  return (
    <div className="md:p-3 md:border-b md:border-border md:bg-muted/30">
      {/* Desktop Form */}
      <div className="hidden md:block space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <FolderPlus className="w-4 h-4" />
          Create New Project
        </div>
        <div className="space-y-2">
          <Input
            value={newProjectPath}
            onChange={(e) => setNewProjectPath(e.target.value)}
            placeholder="/path/to/project or new/folder/name"
            className="text-sm focus:ring-2 focus:ring-primary/20"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCreateProject();
              if (e.key === 'Escape') onCancel();
            }}
          />
          {newProjectPath.trim() && (
            <div className="text-xs text-muted-foreground italic">
              💡 Folder will be created if it doesn't exist
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onCreateProject}
            disabled={!newProjectPath.trim() || creatingProject}
            className="flex-1 h-8 text-xs hover:bg-primary/90 transition-colors"
          >
            {creatingProject ? 'Creating...' : 'Create Project'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={creatingProject}
            className="h-8 text-xs hover:bg-accent transition-colors"
          >
            Cancel
          </Button>
        </div>
      </div>
      
      {/* Mobile Form - Simple Overlay */}
      <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-lg border-t border-border p-4 space-y-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
                <FolderPlus className="w-3 h-3 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">New Project</h2>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={creatingProject}
              className="w-6 h-6 rounded-md bg-muted flex items-center justify-center active:scale-95 transition-transform"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <Input
                value={newProjectPath}
                onChange={(e) => setNewProjectPath(e.target.value)}
                placeholder="/path/to/project or new/folder/name"
                className="text-sm h-10 rounded-md focus:border-primary transition-colors"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onCreateProject();
                  if (e.key === 'Escape') onCancel();
                }}
              />
              {newProjectPath.trim() && (
                <div className="text-xs text-muted-foreground italic mt-2">
                  💡 Folder will be created if it doesn't exist
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={onCancel}
                disabled={creatingProject}
                variant="outline"
                className="flex-1 h-9 text-sm rounded-md active:scale-95 transition-transform"
              >
                Cancel
              </Button>
              <Button
                onClick={onCreateProject}
                disabled={!newProjectPath.trim() || creatingProject}
                className="flex-1 h-9 text-sm rounded-md bg-primary hover:bg-primary/90 active:scale-95 transition-all"
              >
                {creatingProject ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
          
          {/* Safe area for mobile */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
};

export default NewProjectForm;

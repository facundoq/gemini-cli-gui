import React from 'react';
import { Button } from '../ui/button';
import { MessageSquare, RefreshCw, FolderPlus } from 'lucide-react';

const SidebarHeader = ({ onRefresh, onNewProject, isRefreshing }) => {
  return (
    <div className="md:p-4 md:border-b md:border-border">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <MessageSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Gemini CLI UI</h1>
            <p className="text-sm text-muted-foreground">AI coding assistant interface</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 px-0 hover:bg-accent transition-colors duration-200 group"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh projects and sessions (Ctrl+R)"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''} group-hover:rotate-180 transition-transform duration-300`} />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-9 w-9 px-0 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={onNewProject}
            title="Create new project (Ctrl+N)"
          >
            <FolderPlus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Gemini CLI UI</h1>
              <p className="text-sm text-muted-foreground">Projects</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center active:scale-95 transition-all duration-150"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 text-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-all duration-150"
              onClick={onNewProject}
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;

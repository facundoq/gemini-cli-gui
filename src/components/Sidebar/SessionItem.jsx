import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MessageSquare, Clock, Trash2, Edit2, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatTimeAgo } from './utils';

const SessionItem = ({
  session,
  project,
  selectedSession,
  currentTime,
  onSessionSelect,
  onProjectSelect,
  onDeleteSession,
  editingSession,
  setEditingSession,
  editingSessionName,
  setEditingSessionName,
  updateSessionSummary,
  handleTouchClick
}) => {
  const sessionDate = new Date(session.lastActivity);
  const diffInMinutes = Math.floor((currentTime - sessionDate) / (1000 * 60));
  const isActive = diffInMinutes < 10;

  const handleSelect = () => {
    onProjectSelect(project);
    onSessionSelect(session);
  };

  return (
    <div className="group relative">
      {/* Active session indicator dot */}
      {isActive && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}

      {/* Mobile Session Item */}
      <div className="md:hidden">
        <div
          className={cn(
            "p-2 mx-3 my-0.5 rounded-md bg-card border active:scale-[0.98] transition-all duration-150 relative",
            selectedSession?.id === session.id ? "bg-primary/5 border-primary/20" :
            isActive ? "border-green-500/30 bg-green-50/5 dark:bg-green-900/5" : "border-border/30"
          )}
          onClick={handleSelect}
          onTouchEnd={handleTouchClick(handleSelect)}
        >
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0",
              selectedSession?.id === session.id ? "bg-primary/10" : "bg-muted/50"
            )}>
              <MessageSquare className={cn(
                "w-3 h-3",
                selectedSession?.id === session.id ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate text-foreground">
                {session.summary || 'New Session'}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(session.lastActivity, currentTime)}
                </span>
                {session.messageCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 ml-auto">
                    {session.messageCount}
                  </Badge>
                )}
              </div>
            </div>
            {/* Mobile delete button */}
            <button
              className="w-5 h-5 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center active:scale-95 transition-transform opacity-70 ml-1"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(project.name, session.id);
              }}
              onTouchEnd={handleTouchClick(() => onDeleteSession(project.name, session.id))}
            >
              <Trash2 className="w-2.5 h-2.5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Session Item */}
      <div className="hidden md:block">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start p-2 h-auto font-normal text-left hover:bg-accent/50 transition-colors duration-200",
            selectedSession?.id === session.id && "bg-accent text-accent-foreground"
          )}
          onClick={() => onSessionSelect(session)}
          onTouchEnd={handleTouchClick(() => onSessionSelect(session))}
        >
          <div className="flex items-start gap-2 min-w-0 w-full">
            <MessageSquare className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate text-foreground">
                {session.summary || 'New Session'}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(session.lastActivity, currentTime)}
                </span>
                {session.messageCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 ml-auto">
                    {session.messageCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Button>

        {/* Desktop hover buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          {editingSession === session.id ? (
            <>
              <input
                type="text"
                value={editingSessionName}
                onChange={(e) => setEditingSessionName(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    updateSessionSummary(project.name, session.id, editingSessionName);
                  } else if (e.key === 'Escape') {
                    setEditingSession(null);
                    setEditingSessionName('');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-32 px-2 py-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <button
                className="w-6 h-6 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  updateSessionSummary(project.name, session.id, editingSessionName);
                }}
                title="Save"
              >
                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
              </button>
              <button
                className="w-6 h-6 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/40 rounded flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSession(null);
                  setEditingSessionName('');
                }}
                title="Cancel"
              >
                <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
            </>
          ) : (
            <>
              {/* Edit button */}
              <button
                className="w-6 h-6 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/40 rounded flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSession(session.id);
                  setEditingSessionName(session.summary || 'New Session');
                }}
                title="Manually edit session name"
              >
                <Edit2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
              {/* Delete button */}
              <button
                className="w-6 h-6 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(project.name, session.id);
                }}
                title="Delete this session permanently"
              >
                <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionItem;

export const formatTimeAgo = (dateString, currentTime) => {
  const date = new Date(dateString);
  const now = currentTime;
  
  if (isNaN(date.getTime())) {
    return 'Unknown';
  }
  
  const diffInMs = now - date;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInMinutes === 1) return '1 min ago';
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
};

export const getProjectLastActivity = (project, additionalSessions = {}) => {
  const initialSessions = project.sessions || [];
  const additional = additionalSessions[project.name] || [];
  const allSessions = [...initialSessions, ...additional];
  
  if (allSessions.length === 0) {
    return new Date(0);
  }
  
  return allSessions.reduce((latest, session) => {
    const sessionDate = new Date(session.lastActivity);
    return sessionDate > latest ? sessionDate : latest;
  }, new Date(0));
};

export const sortProjects = (projects, starredProjects, sortOrder, additionalSessions) => {
  return [...projects].sort((a, b) => {
    const aStarred = starredProjects.has(a.name);
    const bStarred = starredProjects.has(b.name);
    
    if (aStarred && !bStarred) return -1;
    if (!aStarred && bStarred) return 1;
    
    if (sortOrder === 'date') {
      return getProjectLastActivity(b, additionalSessions) - getProjectLastActivity(a, additionalSessions);
    } else {
      const nameA = a.displayName || a.name;
      const nameB = b.displayName || b.name;
      return nameA.localeCompare(nameB);
    }
  });
};

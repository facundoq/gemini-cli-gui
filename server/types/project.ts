export interface Project {
  name: string;
  path: string;
  displayName: string;
  fullPath: string;
  isCustomName: boolean;
  isManuallyAdded?: boolean;
  sessions: any[]; // To be typed in session.ts
  sessionMeta?: {
    hasMore: boolean;
    total: number;
  };
}

export interface ProjectConfig {
  displayName?: string;
  manuallyAdded?: boolean;
  originalPath?: string;
}

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: string | null;
  permissions: string;
  permissionsRwx: string;
  children?: FileItem[];
}

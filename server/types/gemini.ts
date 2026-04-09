export interface GeminiOptions {
  sessionId: string;
  projectPath?: string;
  cwd?: string;
  resume?: boolean;
  toolsSettings?: {
    allowedTools: string[];
    disallowedTools: string[];
    skipPermissions: boolean;
  };
  permissionMode?: boolean;
  images?: Array<{
    data: string;
    mimeType: string;
  }>;
}

export interface GeminiProcess {
  sessionId: string;
  process: any; // child_process.ChildProcess
  startTime: number;
}

export interface GeminiResponse {
  type: 'chunk' | 'done' | 'error' | 'status' | 'session-created' | 'tools-executed';
  content?: string;
  sessionId?: string;
  error?: string;
  status?: string;
  tools?: any[];
}

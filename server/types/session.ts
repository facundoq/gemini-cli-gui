export interface Message {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
}

export interface Session {
  id: string;
  summary: string;
  messageCount: number;
  lastActivity: Date;
  cwd: string;
}

export interface SessionMeta {
  hasMore: boolean;
  total: number;
  offset: number;
  limit: number;
}

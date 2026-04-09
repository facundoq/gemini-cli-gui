export interface User {
  id: number;
  username: string;
  email?: string;
}

export interface TokenPayload {
  userId: number;
  username: string;
}

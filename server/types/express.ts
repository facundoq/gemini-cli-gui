import { Request } from 'express';
import { User } from './auth.ts';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

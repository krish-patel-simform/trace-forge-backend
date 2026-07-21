import { IUser } from '../models/user.model.js';
import { IProject } from '../models/project.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      project?: IProject;
    }
  }
}

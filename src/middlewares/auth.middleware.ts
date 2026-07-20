import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token.util.js';
import { User } from '../models/user.model.js';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Not authorized to access this route' });
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(500).json({ success: false, message: 'Server Error during authentication' });
  }
};

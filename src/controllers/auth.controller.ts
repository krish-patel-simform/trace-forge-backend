import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse({ body: req.body }).body;
    const result = await authService.registerUser(validatedData);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    if (err.name === 'ZodError') {
      res.status(422).json({ success: false, errors: err.errors });
      return;
    }
    const status = err.message?.includes('already exists') ? 409 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse({ body: req.body }).body;
    const result = await authService.loginUser(validatedData);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    if (err.name === 'ZodError') {
      res.status(422).json({ success: false, errors: err.errors });
      return;
    }
    const status = err.message === 'Invalid credentials' ? 401 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = refreshSchema.parse({ body: req.body }).body;
    const result = await authService.refreshUserToken(refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    if (err.name === 'ZodError') {
      res.status(422).json({ success: false, errors: err.errors });
      return;
    }
    res.status(401).json({ success: false, message: err.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    await authService.logoutUser(String(req.user._id));
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, data: { user: req.user } });
};

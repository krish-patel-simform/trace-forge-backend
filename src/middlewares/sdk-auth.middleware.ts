import type { Request, Response, NextFunction } from 'express';
import { Project } from '../models/project.model.js';
import { hashApiKey } from '../utils/api-key.util.js';

export const sdkAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({ success: false, message: 'Missing API Key in headers (x-api-key)' });
      return;
    }

    const apiKeyHash = hashApiKey(apiKey);

    // Find the project associated with this API key
    const project = await Project.findOne({ apiKeyHash });

    if (!project) {
      res.status(401).json({ success: false, message: 'Invalid API Key' });
      return;
    }

    // Attach project to the request object for downstream use
    req.project = project;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Server error during API Key validation' + error });
  }
};

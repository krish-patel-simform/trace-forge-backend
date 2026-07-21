import type { Request, Response } from 'express';
import * as projectService from '../services/project.service.js';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator.js';
import type { IProject } from '../models/project.model.ts';

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createProjectSchema.parse({ body: req.body }).body;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    const result = await projectService.createProject(String(req.user._id), validatedData);
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

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    const projects = await projectService.getProjectsByOwner(String(req.user._id));
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' + error });
  }
};

export const getProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    const project = await projectService.getProjectByIdAndOwner(
      req.params.id as string,
      String(req.user._id),
    );
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' + error });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    const validatedData = updateProjectSchema.parse({ body: req.body }).body;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = await projectService.updateProject(
      req.params.id as string,
      String(req.user._id),
      validatedData as Partial<IProject>,
    );
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.status(200).json({ success: true, data: project });
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

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    const success = await projectService.deleteProject(
      req.params.id as string,
      String(req.user._id),
    );
    if (!success) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' + error });
  }
};

export const regenerateKey = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    const result = await projectService.regenerateApiKey(
      req.params.id as string,
      String(req.user._id),
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    const status = err.message?.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

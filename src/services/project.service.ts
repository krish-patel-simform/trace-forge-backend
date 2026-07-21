import { Project, type IProject } from '../models/project.model.js';
import { generateApiKey } from '../utils/api-key.util.js';
import { Types } from 'mongoose';

export const createProject = async (
  ownerId: string,
  data: { name: string; websiteUrl?: string | undefined; description?: string | undefined }
): Promise<{ project: IProject; apiKey: string }> => {
  // Check if project name already exists for this owner
  const existingProject = await Project.findOne({ name: data.name, owner: ownerId });
  if (existingProject) {
    throw new Error('Project with this name already exists for this user');
  }

  const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();

  const project = new Project({
    ...data,
    owner: ownerId,
    apiKeyHash,
    apiKeyPrefix,
  });

  await project.save();

  // Return the plaintext API key only once
  return { project, apiKey };
};

export const getProjectsByOwner = async (ownerId: string): Promise<IProject[]> => {
  return Project.find({ owner: ownerId }).sort({ createdAt: -1 });
};

export const getProjectByIdAndOwner = async (projectId: string, ownerId: string): Promise<IProject | null> => {
  if (!Types.ObjectId.isValid(projectId)) return null;
  return Project.findOne({ _id: projectId, owner: ownerId });
};

export const updateProject = async (
  projectId: string,
  ownerId: string,
  data: Partial<IProject>
): Promise<IProject | null> => {
  if (!Types.ObjectId.isValid(projectId)) return null;
  
  if (data.name) {
    // Check name collision
    const existingProject = await Project.findOne({ name: data.name, owner: ownerId, _id: { $ne: projectId } });
    if (existingProject) {
      throw new Error('Project with this name already exists for this user');
    }
  }

  return Project.findOneAndUpdate({ _id: projectId, owner: ownerId }, { $set: data }, { new: true });
};

export const deleteProject = async (projectId: string, ownerId: string): Promise<boolean> => {
  if (!Types.ObjectId.isValid(projectId)) return false;
  const result = await Project.deleteOne({ _id: projectId, owner: ownerId });
  return result.deletedCount > 0;
};

export const regenerateApiKey = async (
  projectId: string,
  ownerId: string
): Promise<{ project: IProject; newApiKey: string }> => {
  if (!Types.ObjectId.isValid(projectId)) {
    throw new Error('Project not found');
  }

  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) {
    throw new Error('Project not found or access denied');
  }

  const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();
  
  project.apiKeyHash = apiKeyHash;
  project.apiKeyPrefix = apiKeyPrefix;
  await project.save();

  return { project, newApiKey: apiKey };
};

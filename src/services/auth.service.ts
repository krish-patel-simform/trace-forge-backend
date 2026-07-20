import { User } from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/token.util.js';

export const registerUser = async (data: { name: string; email: string; password: string }) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await hashPassword(data.password);
  
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  user.refreshToken = await hashPassword(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
};

export const loginUser = async (data: { email: string; password: string }) => {
  const user = await User.findOne({ email: data.email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await comparePassword(data.password, user.password as string);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  user.refreshToken = await hashPassword(refreshToken);
  await user.save();

  return { user, accessToken, refreshToken };
};

export const refreshUserToken = async (refreshTokenStr: string) => {
  const decoded = verifyToken(refreshTokenStr);
  if (!decoded) {
    throw new Error('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.refreshToken) {
    throw new Error('User not found or session terminated');
  }

  const isMatch = await comparePassword(refreshTokenStr, user.refreshToken);
  if (!isMatch) {
    throw new Error('Invalid refresh token');
  }

  const newAccessToken = generateAccessToken(user.id);
  
  return { accessToken: newAccessToken };
};

export const logoutUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
};

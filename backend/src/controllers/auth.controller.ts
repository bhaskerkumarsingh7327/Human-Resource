import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const AuthController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    sendSuccess(res, 201, 'Account created successfully', result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    sendSuccess(res, 200, 'Login successful', result);
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, 200, 'Logout successful', null);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, 200, 'Current user fetched', req.user);
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.forgotPassword(req.body);
    sendSuccess(res, 200, result.message, null);
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.resetPassword(req.body);
    sendSuccess(res, 200, result.message, null);
  }),
};
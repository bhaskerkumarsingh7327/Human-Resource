import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const NotificationController = {
  send: asyncHandler(async (req: Request, res: Response) => {
    const result = await NotificationService.send(req.body);
    sendSuccess(res, 201, 'Notification sent', result);
  }),

  myNotifications: asyncHandler(async (req: Request, res: Response) => {
    const unreadOnly = req.query.unread === 'true';
    const notifications = await NotificationService.myNotifications(req.user!.userId, unreadOnly);
    sendSuccess(res, 200, 'Notifications fetched', notifications);
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    await NotificationService.markRead(Number(req.params.id), req.user!.userId);
    sendSuccess(res, 200, 'Notification marked as read', null);
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await NotificationService.markAllRead(req.user!.userId);
    sendSuccess(res, 200, 'All notifications marked as read', null);
  }),
};
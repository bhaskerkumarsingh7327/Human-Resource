import { NotificationModel } from '../models/notification.model';
import { CreateNotificationInput } from '../validators/notification.validator';

export const NotificationService = {
  async send(input: CreateNotificationInput) {
    const id = await NotificationModel.create(input.userId, input.title, input.message);
    return { notificationId: id };
  },

  async myNotifications(userId: number, unreadOnly: boolean) {
    return NotificationModel.findByUser(userId, unreadOnly);
  },

  async markRead(notificationId: number, userId: number) {
    await NotificationModel.markAsRead(notificationId, userId);
  },

  async markAllRead(userId: number) {
    await NotificationModel.markAllAsRead(userId);
  },
};
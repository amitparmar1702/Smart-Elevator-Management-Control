import { INITIAL_NOTIFICATION_MATRIX, NotificationRule } from '../mocks/notificationMock';

export class NotificationService {
  /**
   * Fetches the user's multi-channel notification preferences matrix.
   * Backed by mock implementation until notifications API endpoint is wired.
   * TODO: connect to real API: GET /api/v1/users/me/notifications/matrix
   */
  public static async getNotificationMatrix(): Promise<NotificationRule[]> {
    try {
      // In production environment with live backend endpoint:
      // const res = await fetch('/api/v1/users/me/notifications/matrix');
      // if (res.ok) return await res.json();
    } catch {
      // Fallback cleanly to mock
    }
    return [...INITIAL_NOTIFICATION_MATRIX];
  }

  /**
   * Updates multi-channel notification preferences.
   * TODO: connect to real API: PUT /api/v1/users/me/notifications/matrix
   */
  public static async updateNotificationMatrix(rules: NotificationRule[]): Promise<boolean> {
    try {
      // In production environment:
      // const res = await fetch('/api/v1/users/me/notifications/matrix', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(rules),
      // });
      // return res.ok;
    } catch {
      // Fallback cleanly
    }
    return true;
  }
}

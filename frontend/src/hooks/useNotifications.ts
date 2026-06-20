import { useApp } from '../context/AppContext';

export function useNotifications() {
  const {
    notificationsList,
    setNotificationsList,
    notificationCount,
    setNotificationCount,
    handleClearNotifications,
    handleMarkNotificationsRead,
    handleDeleteNotification,
  } = useApp();

  return {
    notificationsList,
    setNotificationsList,
    notificationCount,
    setNotificationCount,
    handleClearNotifications,
    handleMarkNotificationsRead,
    handleDeleteNotification,
  };
}

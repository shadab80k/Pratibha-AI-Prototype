import { useApp } from '../context/AppContext';

export function useOffline() {
  const {
    isOffline,
    setIsOffline,
    pendingSync,
    setPendingSync,
    registerOfflineAction,
    toggleOffline,
    handleSyncNow,
  } = useApp();

  return {
    isOffline,
    setIsOffline,
    pendingSync,
    setPendingSync,
    registerOfflineAction,
    toggleOffline,
    handleSyncNow,
  };
}

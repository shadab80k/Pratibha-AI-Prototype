import { useApp } from '../context/AppContext';

export function useAppLayout() {
  const {
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode,
    isSidebarOpen,
    setIsSidebarOpen,
    scale,
    setScale,
    toast,
    setToast,
    showToast,
    handleResetData,
  } = useApp();

  return {
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode,
    isSidebarOpen,
    setIsSidebarOpen,
    scale,
    setScale,
    toast,
    setToast,
    showToast,
    handleResetData,
  };
}

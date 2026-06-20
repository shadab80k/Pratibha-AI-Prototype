import { useApp } from '../context/AppContext';

export function useAuth() {
  const {
    workerName,
    setWorkerName,
    workerId,
    setWorkerId,
    anganwadiBlock,
    setAnganwadiBlock,
    screen,
    setScreen,
    prevScreen,
    setPrevScreen,
    activeTab,
    setActiveTab,
    navigateTo,
    goBack,
    handleTabChange,
  } = useApp();

  return {
    workerName,
    setWorkerName,
    workerId,
    setWorkerId,
    anganwadiBlock,
    setAnganwadiBlock,
    screen,
    setScreen,
    prevScreen,
    setPrevScreen,
    activeTab,
    setActiveTab,
    navigateTo,
    goBack,
    handleTabChange,
  };
}

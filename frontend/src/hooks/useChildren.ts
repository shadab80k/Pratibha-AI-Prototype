import { useApp } from '../context/AppContext';

export function useChildren() {
  const {
    childrenList,
    setChildrenList,
    selectedChildId,
    setSelectedChildId,
    selectChild,
    toggleAttendance,
    addObservation,
    syncVoiceReport,
    loadDataFromServer,
  } = useApp();

  return {
    childrenList,
    setChildrenList,
    selectedChildId,
    setSelectedChildId,
    selectChild,
    toggleAttendance,
    addObservation,
    syncVoiceReport,
    loadDataFromServer,
  };
}

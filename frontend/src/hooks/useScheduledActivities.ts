import { useApp } from '../context/AppContext';

export function useScheduledActivities() {
  const {
    scheduledActivities,
    setScheduledActivities,
    handleScheduleActivity,
  } = useApp();

  return {
    scheduledActivities,
    setScheduledActivities,
    handleScheduleActivity,
  };
}

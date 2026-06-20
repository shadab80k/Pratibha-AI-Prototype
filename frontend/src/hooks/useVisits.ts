import { useApp } from '../context/AppContext';

export function useVisits() {
  const {
    visitsList,
    setVisitsList,
    completeVisit,
    handleAddVisit,
  } = useApp();

  return {
    visitsList,
    setVisitsList,
    completeVisit,
    handleAddVisit,
  };
}

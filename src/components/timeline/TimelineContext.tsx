import { createContext, useContext } from 'react';
import { useToast } from '../ui/use-toast';

interface TimelineContextType {
  toast: ReturnType<typeof useToast>['toast'];
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export const TimelineProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  
  return (
    <TimelineContext.Provider value={{ toast }}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimelineContext = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimelineContext must be used within a TimelineProvider');
  }
  return context;
};
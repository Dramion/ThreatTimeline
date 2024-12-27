import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { generateReport } from '@/lib/report';
import type { TimelineEvent } from '@/pages/Index';

interface ReportButtonProps {
  events: TimelineEvent[];
}

export const ReportButton: React.FC<ReportButtonProps> = ({ events }) => {
  const handleGenerateReport = () => {
    // Generate the report
    const report = generateReport(events);
    
    // Create a blob with the markdown content
    const blob = new Blob([report], { type: 'text/markdown' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'incident-response-report.md';
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerateReport}
      className="gap-2"
    >
      <FileDown className="h-4 w-4" />
      Export Report
    </Button>
  );
}; 
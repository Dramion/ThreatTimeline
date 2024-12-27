import { Button } from "@/components/ui/button";
import { Eye, Edit2, Database, RotateCcw, Download } from "lucide-react";
import { ReportButton } from "@/components/ReportButton";
import type { TimelineEvent } from "@/pages/Index";

interface ActionButtonsProps {
  page: 'timeline' | 'visualization' | 'artifacts';
  events: TimelineEvent[];
  // Timeline specific props
  onLoadDemo?: () => void;
  onEditMode?: () => void;
  isEditMode?: boolean;
  // Visualization specific props
  onResetLayout?: () => void;
  onExportPng?: () => void;
}

export function ActionButtons({
  page,
  events,
  onLoadDemo,
  onEditMode,
  onResetLayout,
  onExportPng,
  isEditMode,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {page === 'timeline' && (
        <>
          <Button variant="outline" onClick={onLoadDemo}>
            <Database className="mr-2 h-4 w-4" />
            Load Demo Data
          </Button>
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={onEditMode}
          >
            {isEditMode ? (
              <Eye className="mr-2 h-4 w-4" />
            ) : (
              <Edit2 className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? "View Mode" : "Edit Mode"}
          </Button>
          <ReportButton events={events} />
        </>
      )}

      {page === 'visualization' && (
        <>
          <Button variant="outline" onClick={onResetLayout}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Layout
          </Button>
          <Button variant="outline" onClick={onExportPng}>
            <Download className="mr-2 h-4 w-4" />
            Export as PNG
          </Button>
        </>
      )}

      {page === 'artifacts' && (
        <ReportButton events={events} />
      )}
    </div>
  );
} 
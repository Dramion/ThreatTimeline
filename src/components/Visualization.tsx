import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Handle,
  Position,
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  getBezierPath,
  NodeDragHandler,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  XYPosition,
  ReactFlowProvider,
  Panel,
  getRectOfNodes,
  getTransformForBounds,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { TimelineEvent } from '@/pages/Index';
import { calculateLayout } from './visualization/layoutUtils';
import { cn } from '@/lib/utils';
import { ActionButtons } from './ActionButtons';
import { toPng } from 'html-to-image';

interface VisualizationProps {
  events: TimelineEvent[];
  savedPositions?: Record<string, XYPosition>;
  onPositionsChange?: (positions: Record<string, XYPosition>) => void;
  onResetRequest?: () => void;
}

// Custom Edge Component
const CustomEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  style,
  markerEnd,
  data
}: EdgeProps) => {
  if (data?.path) {
    return (
      <path
        d={data.path}
        fill="none"
        style={style}
        markerEnd={markerEnd}
      />
    );
  }

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <path
      d={edgePath}
      fill="none"
      style={style}
      markerEnd={markerEnd}
    />
  );
};

// Custom Node Component
const EventNode = ({ data }: { data: TimelineEvent }) => {
  const isRootEvent = !data.parentId;
  
  return (
    <div className={cn(
      "px-4 py-2 shadow-lg rounded-lg border bg-background",
      isRootEvent && "ring-2 ring-primary/50 shadow-primary/20",
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-muted-foreground"
      />
      <div className="flex flex-col gap-2">
        <div className="text-sm font-medium flex items-center gap-2">
          {isRootEvent && <span className="text-primary">◆</span>}
          {data.title || "Untitled Event"}
        </div>
        {data.tactic && (
          <div className={cn(
            "text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground w-fit",
            data.tactic === "Lateral Movement" && "bg-red-500/10 text-red-500"
          )}>
            {data.tactic}
          </div>
        )}
        {data.technique && (
          <div className="text-xs px-2 py-1 rounded bg-primary/10 text-primary w-fit mt-1">
            {data.technique}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-muted-foreground"
      />
    </div>
  );
};

const Flow: React.FC<VisualizationProps> = ({ 
  events, 
  savedPositions,
  onPositionsChange,
  onResetRequest,
}) => {
  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  // Define node and edge types
  const nodeTypes = React.useMemo(() => ({ default: EventNode }), []);
  const edgeTypes = React.useMemo(() => ({ smoothstep: CustomEdge }), []);

  const handleNodeDragStop: NodeDragHandler = (event, node) => {
    if (onPositionsChange) {
      const newPositions = nodes.reduce((acc, n) => ({
        ...acc,
        [n.id]: { x: n.position.x, y: n.position.y }
      }), {});
      onPositionsChange(newPositions);
    }
  };

  const handleExportPng = async () => {
    if (reactFlowWrapper.current === null) {
      return;
    }

    const nodesBounds = getRectOfNodes(nodes);
    const transform = getTransformForBounds(nodesBounds, 1000, 800, 0.5, 2);
    
    const dataUrl = await toPng(reactFlowWrapper.current, {
      backgroundColor: '#ffffff',
      width: 1000,
      height: 800,
      style: {
        width: '1000px',
        height: '800px',
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    });

    const link = document.createElement('a');
    link.download = 'threat-timeline.png';
    link.href = dataUrl;
    link.click();
  };

  // Update nodes and edges when events change or saved positions change
  React.useEffect(() => {
    if (events.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const newState = calculateLayout(events);
    
    if (savedPositions) {
      newState.nodes = newState.nodes.map(node => ({
        ...node,
        position: savedPositions[node.id] || node.position
      }));
    }
    
    setNodes(newState.nodes);
    setEdges(newState.edges);
  }, [events, savedPositions, setNodes, setEdges]);

  // Handle node changes and update parent with new positions
  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);
    
    const dragChange = changes.find(change => change.type === 'position' && change.dragging === false);
    if (dragChange && onPositionsChange) {
      const newPositions = nodes.reduce((acc, node) => {
        acc[node.id] = node.position;
        return acc;
      }, {} as Record<string, XYPosition>);
      onPositionsChange(newPositions);
    }
  }, [nodes, onNodesChange, onPositionsChange]);

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Panel position="top-right" className="bg-background/95 p-2 rounded-lg shadow-lg">
          <ActionButtons
            page="visualization"
            onResetLayout={onResetRequest}
            onExportPng={handleExportPng}
            events={events}
          />
        </Panel>
        <Background />
        <Controls className="bg-background/95 border-border" />
        <MiniMap 
          className="bg-background/95 !border-border"
          nodeColor="hsl(var(--muted))"
          maskColor="hsl(var(--background)/50)"
        />
      </ReactFlow>
    </div>
  );
};

export const Visualization: React.FC<VisualizationProps> = (props) => {
  return (
    <div style={{ height: '800px' }} className="w-full border rounded-lg bg-background/50 backdrop-blur">
      <ReactFlowProvider>
        <Flow {...props} />
      </ReactFlowProvider>
    </div>
  );
};

export default Visualization;
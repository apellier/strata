'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  Node,
  NodeDragHandler,
  OnNodesDelete,
  OnConnectStart,
  OnConnectEnd,
  NodePositionChange,
  ControlButton,
} from 'reactflow';
import 'reactflow/dist/style.css';

import SidePanel, { PanelState } from './SidePanel';
import CustomNode from './CustomNode';
import { useStore, NodeData, AppState } from '@/lib/store';
import type { Opportunity, Solution, Outcome } from '@prisma/client';
import { useShallow } from 'zustand/react/shallow';
import { useHotkeys } from 'react-hotkeys-hook';
import { Undo, Redo } from 'lucide-react';

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  updateNodePosition: state.updateNodePosition,
  addNode: state.addNode,
  createOpportunityOnDrop: state.createOpportunityOnDrop,
  getCanvasData: state.getCanvasData,
  onNodesDelete: state.onNodesDelete,
  past: state.past,
  future: state.future,
  undo: state.undo,
  redo: state.redo,
  takeSnapshot: state.takeSnapshot,
});

const getEdgeStyles = (targetNode?: Node<NodeData>) => {
  const style: React.CSSProperties = { stroke: '#b1b1b7', strokeWidth: 2 };
  let animated = false;
  let strokeDasharray: string | undefined;

  if (targetNode?.data?.type === 'opportunity' || targetNode?.data?.type === 'solution') {
    switch (targetNode.data.status) {
      case 'DISCOVERY':
        style.stroke = '#8b5cf6';
        style.strokeWidth = 2.5;
        animated = true;
        break;
      case 'IN_PROGRESS':
        style.stroke = '#22c55e';
        style.strokeWidth = 2.5;
        animated = true;
        break;
      case 'DONE':
        style.stroke = '#6b7280';
        break;
      case 'BLOCKED':
        style.stroke = '#ef4444';
        style.strokeWidth = 2.5;
        strokeDasharray = '5,5';
        break;
      case 'BACKLOG':
      default:
        strokeDasharray = '5,5';
        break;
    }
  }
  return { style, animated, strokeDasharray };
};

const DiscoveryCanvasContent = ({
  focusedNodeId,
  onFocusOpportunity,
  onFocusSolution,
  onFocusOutcome,
  panelState,
  setPanelState,
}: {
  focusedNodeId: string | null;
  onFocusOpportunity: (opportunity: Opportunity) => void;
  onFocusSolution: (solution: Solution) => void;
  onFocusOutcome: (outcome: Outcome) => void;
  panelState: PanelState;
  setPanelState: (state: PanelState) => void;
}) => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    getCanvasData,
    updateNodePosition,
    addNode,
    createOpportunityOnDrop,
    onNodesDelete,
    past,
    future,
    undo,
    redo,
    takeSnapshot,
  } = useStore(useShallow(selector));

  const { screenToFlowPosition, getNode, getNodes, fitView } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);
  const [isDraggingEvidence, setIsDraggingEvidence] = useState(false);

  const dragData = useRef<{
    startPositions: Map<string, { x: number; y: number }>;
    draggedNodeId: string;
  } | null>(null);

  useEffect(() => {
    getCanvasData();
  }, [getCanvasData]);

  useEffect(() => {
    if (focusedNodeId) {
      setTimeout(() => {
        fitView({ nodes: [{ id: focusedNodeId }], duration: 800, padding: 0.2 });
      }, 100);
    }
  }, [focusedNodeId, fitView]);

  // Keyboard shortcuts for adding nodes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping =
        activeElement &&
        (activeElement.matches('input, textarea, [contenteditable="true"]') ||
          activeElement.closest('.ProseMirror'));

      if (isTyping) return;

      if (event.key === 'o' || event.key === 'u') {
        event.preventDefault();
        const allNodes = getNodes();
        const selectedNodes = allNodes.filter((n) => n.selected);
        const parentNode = selectedNodes.length === 1 ? selectedNodes[0] : undefined;
        const type = event.key === 'o' ? 'opportunity' : 'outcome';
        addNode(type, parentNode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [addNode, getNodes]);
  
  // Undo / Redo Hotkeys
  useHotkeys('mod+z', undo, { preventDefault: true });
  useHotkeys('mod+shift+z', redo, { preventDefault: true });

  const handleAddNodeButtonClick = (type: 'outcome' | 'opportunity') => {
    const allNodes = getNodes();
    const selectedNodes = allNodes.filter((n) => n.selected);
    const parentNode = selectedNodes.length === 1 ? selectedNodes[0] : undefined;
    addNode(type, parentNode);
  };

  const styledEdges = useMemo(() => {
    return edges.map((edge) => {
      const targetNode = nodes.find((n) => n.id === edge.target);
      const { style, ...rest } = getEdgeStyles(targetNode);
      return { ...edge, style, ...rest };
    });
  }, [edges, nodes]);

  const onNodeDragStart: NodeDragHandler = useCallback((_, node) => {
    const allNodes = getNodes();
    const allEdges = useStore.getState().edges;
    const descendants = new Map<string, Node>();
    const queue: string[] = [node.id];
    
    // Using a Map to keep track of visited nodes to avoid cycles
    const visited = new Set<string>([node.id]);

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const children = allEdges.filter(e => e.source === currentId).map(e => e.target);
        for (const childId of children) {
            if (!visited.has(childId)) {
                visited.add(childId);
                const childNode = allNodes.find(n => n.id === childId);
                if (childNode) {
                    descendants.set(childId, childNode);
                    queue.push(childId);
                }
            }
        }
    }

    const startPositions = new Map();
    startPositions.set(node.id, { ...node.position });
    descendants.forEach(desc => startPositions.set(desc.id, { ...desc.position }));

    dragData.current = {
        startPositions,
        draggedNodeId: node.id
    };
  }, [getNodes]);

  const onNodeDrag: NodeDragHandler = useCallback((_, draggedNode) => {
    if (!dragData.current) return;

    const parentStartPos = dragData.current.startPositions.get(draggedNode.id);
    if (!parentStartPos) return;

    const diff = {
        x: draggedNode.position.x - parentStartPos.x,
        y: draggedNode.position.y - parentStartPos.y,
    };

    const changes: NodePositionChange[] = Array.from(dragData.current.startPositions.keys()).map(id => {
        const startPos = dragData.current!.startPositions.get(id)!;
        return {
            id,
            type: 'position',
            position: {
                x: startPos.x + diff.x,
                y: startPos.y + diff.y,
            },
        };
    });

    onNodesChange(changes);
  }, [onNodesChange]);

  const onNodeDragStop: NodeDragHandler = useCallback((_, node) => {
    takeSnapshot(); // Create a history entry for the drag operation.

    if (dragData.current) {
      const parentStartPos = dragData.current.startPositions.get(node.id);
      if (parentStartPos) {
        const diff = {
          x: node.position.x - parentStartPos.x,
          y: node.position.y - parentStartPos.y,
        };

        dragData.current.startPositions.forEach((startPos, id) => {
          const draggedNode = getNodes().find((n) => n.id === id);
          if (draggedNode) {
            const newPosition = {
              x: startPos.x + diff.x,
              y: startPos.y + diff.y,
            };
            updateNodePosition(id, draggedNode.data.type, newPosition);
          }
        });
      }
    } else {
      updateNodePosition(node.id, node.data.type, node.position);
    }
    dragData.current = null;
  }, [updateNodePosition, getNodes, takeSnapshot]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = () => {
    setIsDraggingEvidence(false);
  };

  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      if (e.dataTransfer?.getData('application/json')) {
        setIsDraggingEvidence(true);
      }
    };
    const handleDragEnd = () => setIsDraggingEvidence(false);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const currentNodeInStore = getNodes().find((n) => n.id === node.id);
      if (currentNodeInStore) {
        setPanelState({ isOpen: true, mode: 'edit', nodeId: node.id });
      }
    },
    [setPanelState, getNodes]
  );

  const handleNodesDelete: OnNodesDelete = useCallback((deletedNodes) => {
    if (panelState.isOpen && panelState.mode === 'edit') {
        const isPanelNodeDeleted = deletedNodes.some(node => node.id === (panelState as { nodeId: string }).nodeId);
        if (isPanelNodeDeleted) {
            setPanelState({ isOpen: false });
        }
    }
    onNodesDelete(deletedNodes);
}, [panelState, setPanelState, onNodesDelete]);

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;
      const sourceNode = getNode(connectingNodeId.current);
      if (!sourceNode || (sourceNode.data.type !== 'outcome' && sourceNode.data.type !== 'opportunity')) {
        connectingNodeId.current = null;
        return;
      }
      const targetIsPane = (event.target as Element).classList.contains('react-flow__pane');
      if (targetIsPane) {
        const position = screenToFlowPosition({
          x: (event as MouseEvent).clientX,
          y: (event as MouseEvent).clientY,
        });
        createOpportunityOnDrop(sourceNode, position);
      }
      connectingNodeId.current = null;
    },
    [screenToFlowPosition, getNode, createOpportunityOnDrop]
  );

  return (
    <div className="w-full h-full flex">
      <main className="flex-1 relative" onDragOver={handleDragOver} onDrop={handleDrop}>
        <ReactFlow
          nodes={nodes.map((node) => ({ ...node, data: { ...node.data, isDraggingEvidence } }))}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeClick={onNodeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onNodesDelete={handleNodesDelete}
          nodeTypes={useMemo(() => ({ default: CustomNode }), [])}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Controls>
             <ControlButton onClick={() => undo()} disabled={past.length === 0} title="Undo (Cmd+Z)">
                <Undo />
            </ControlButton>
            <ControlButton onClick={() => redo()} disabled={future.length === 0} title="Redo (Cmd+Shift+Z)">
                <Redo />
            </ControlButton>
          </Controls>
          <Background />
        </ReactFlow>
        {nodes.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-gray-400 pointer-events-none">
            <h3 className="text-lg font-semibold">Canvas is Empty</h3>
            <p>Click &quot;+ New Outcome&quot; or press &apos;u&apos; to start.</p>
          </div>
        )}
        <div className="absolute top-4 left-4 z-10 flex space-x-2">
          <button className="btn btn-primary" onClick={() => handleAddNodeButtonClick('outcome')}>+ New Outcome</button>
          <button className="btn btn-secondary" onClick={() => handleAddNodeButtonClick('opportunity')}>+ New Opportunity</button>
        </div>
      </main>
      <SidePanel
        panelState={panelState}
        onClose={() => setPanelState({ isOpen: false })}
        onFocusOpportunity={onFocusOpportunity}
        onFocusSolution={onFocusSolution}
        onFocusOutcome={onFocusOutcome}
      />
    </div>
  );
};

interface DiscoveryCanvasProps {
  focusedNodeId: string | null;
  onFocusOpportunity: (opportunity: Opportunity) => void;
  onFocusSolution: (solution: Solution) => void;
  onFocusOutcome: (outcome: Outcome) => void;
  panelState: PanelState;
  setPanelState: (state: PanelState) => void;
}

export default function DiscoveryCanvas(props: DiscoveryCanvasProps) {
  return (
    <ReactFlowProvider>
      <DiscoveryCanvasContent {...props} />
    </ReactFlowProvider>
  );
}
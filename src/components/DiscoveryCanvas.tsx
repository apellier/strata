'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Node,
  Edge,
  NodeDragHandler,
  OnNodesDelete,
  OnConnectStart,
  OnConnectEnd,
  NodePositionChange,
  XYPosition
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cloneDeep } from 'lodash';

import SidePanel, { PanelState } from './SidePanel';
import CustomNode from './CustomNode';
import { useStore, NodeData } from '@/lib/store';
import type { Opportunity, Solution, Outcome } from '@prisma/client';

// Helper to get edge styles based on target node status
const getEdgeStyles = (sourceNode?: Node<NodeData>, targetNode?: Node<NodeData>) => {
    // Default style
    let style = { stroke: '#b1b1b7', strokeWidth: 2 };

    if (targetNode?.data?.type === 'opportunity' || targetNode?.data?.type === 'solution') {
        switch (targetNode.data.status) {
            case 'DISCOVERY': return { stroke: '#8b5cf6', strokeWidth: 2.5, animated: true };
            case 'IN_PROGRESS': return { stroke: '#22c55e', strokeWidth: 2.5, animated: true };
            case 'DONE': return { stroke: '#6b7280', strokeWidth: 2 };
            case 'BLOCKED': return { stroke: '#ef4444', strokeWidth: 2.5, strokeDasharray: '5,5' };
            case 'BACKLOG':
            default: return { stroke: '#b1b1b7', strokeWidth: 2, strokeDasharray: '5,5' };
        }
    }
    return style;
};

// This new component contains all the logic and state that needs the React Flow context
const DiscoveryCanvasContent = ({
    focusedNodeId,
    onFocusOpportunity,
    onFocusSolution,
    onFocusOutcome,
    panelState,
    setPanelState,
}: {
    focusedNodeId: string | null,
    onFocusOpportunity: (opportunity: Opportunity) => void,
    onFocusSolution: (solution: Solution) => void,
    onFocusOutcome: (outcome: Outcome) => void,
    panelState: PanelState,
    setPanelState: (state: PanelState) => void
}) => {
    const { getCanvasData, updateNodePosition, addNode, createOpportunityOnDrop } = useStore();
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore();
    const onNodesDeleteFromStore = useStore(state => state.onNodesDelete);
    
    const { screenToFlowPosition, getNode, fitView } = useReactFlow();
    const connectingNodeId = useRef<string | null>(null);
    const [isDraggingEvidence, setIsDraggingEvidence] = useState(false);

    // --- State for Parent-Child Dragging ---
    const dragData = useRef<{
        draggedNodeId: string;
        children: { id: string; position: XYPosition }[];
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

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const activeElement = document.activeElement;
            const isTyping = activeElement && (
                activeElement.matches('input, textarea, [contenteditable="true"]') ||
                activeElement.closest('.ProseMirror')
            );

            if (isTyping) return;

            const allNodes = useStore.getState().nodes;
            const selectedNodes = allNodes.filter(n => n.selected);
            const parentNode = selectedNodes.length === 1 ? selectedNodes[0] : undefined;

            if (event.key === 'o') {
                event.preventDefault();
                addNode('opportunity', parentNode);
            }
            if (event.key === 'u') {
                 event.preventDefault();
                 addNode('outcome');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [addNode]);

    const handleAddNodeButtonClick = (type: 'outcome' | 'opportunity') => {
        const allNodes = useStore.getState().nodes;
        const selectedNodes = allNodes.filter(n => n.selected);
        const parentNode = selectedNodes.length === 1 ? selectedNodes[0] : undefined;
        
        if (type === 'opportunity' && parentNode && (parentNode.data.type === 'outcome' || parentNode.data.type === 'opportunity')) {
            addNode('opportunity', parentNode);
        } else {
            addNode(type);
        }
    };

        // --- Dynamic Edge Styling ---
        const styledEdges = useMemo(() => {
            return edges.map(edge => {
                const sourceNode = getNode(edge.source!);
                const targetNode = getNode(edge.target!);
                return {
                    ...edge,
                    ...getEdgeStyles(sourceNode, targetNode),
                };
            });
        }, [edges, nodes, getNode]); // Add getNode to dependency array
    
    
        // --- Parent-Child Dragging Logic ---
        const onNodeDragStart: NodeDragHandler = useCallback((_, node) => {
            const childNodes = edges
                .filter(edge => edge.source === node.id)
                .map(edge => {
                    const childNode = getNode(edge.target);
                    return childNode ? { id: childNode.id, position: childNode.position } : null;
                })
                .filter(Boolean) as { id: string; position: XYPosition }[];
    
            if (childNodes.length > 0) {
                dragData.current = {
                    draggedNodeId: node.id,
                    children: childNodes,
                };
            }
        }, [edges, getNode]);
    
        const onNodeDrag: NodeDragHandler = useCallback((event, draggedNode) => {
            if (!dragData.current || dragData.current.draggedNodeId !== draggedNode.id) {
                return;
            }
    
            const parentStartPos = useStore.getState().nodes.find(n => n.id === draggedNode.id)?.position;
            if (!parentStartPos) return;
    
            const diff = {
                x: draggedNode.position.x - parentStartPos.x,
                y: draggedNode.position.y - parentStartPos.y,
            };
    
            const updatedNodes = useStore.getState().nodes.map(n => {
                if (n.id === draggedNode.id) return { ...n, position: draggedNode.position };
                
                const childData = dragData.current?.children.find(c => c.id === n.id);
                if (childData) {
                    return {
                        ...n,
                        position: {
                            x: childData.position.x + diff.x,
                            y: childData.position.y + diff.y,
                        },
                    };
                }
                return n;
            });
    
            useStore.setState({ nodes: updatedNodes });
        }, []);
    
        const onNodeDragStop: NodeDragHandler = useCallback((_, node) => {
            if (dragData.current) {
                // Save parent position
                updateNodePosition(node.id, node.data.type, node.position);
                
                // Save children positions
                const parentStartPos = useStore.getState().nodes.find(n => n.id === node.id)?.position;
                if (parentStartPos) {
                    const diff = {
                        x: node.position.x - parentStartPos.x,
                        y: node.position.y - parentStartPos.y,
                    };
    
                    dragData.current.children.forEach(child => {
                        const childNode = getNode(child.id);
                        if (childNode) {
                            const newPosition = {
                                x: child.position.x + diff.x,
                                y: child.position.y + diff.y,
                            };
                            updateNodePosition(childNode.id, childNode.data.type, newPosition);
                        }
                    });
                }
            } else {
                // Default behavior for nodes without children
                updateNodePosition(node.id, node.data.type, node.position);
            }
            dragData.current = null;
        }, [updateNodePosition, getNode]);


    
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

    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        const currentNodeInStore = useStore.getState().nodes.find(n => n.id === node.id);
        if (currentNodeInStore) {
            setPanelState({ isOpen: true, mode: 'edit', nodeId: node.id });
        }
    }, [setPanelState]);

    const handleNodesDelete: OnNodesDelete = useCallback((deletedNodes) => {
        if (panelState.isOpen && panelState.mode === 'edit') {
            const isPanelNodeDeleted = deletedNodes.some(node => node.id === (panelState as any).nodeId);
            if (isPanelNodeDeleted) {
                setPanelState({ isOpen: false });
            }
        }
        onNodesDeleteFromStore(deletedNodes);
    }, [panelState, setPanelState, onNodesDeleteFromStore]);

    const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
        connectingNodeId.current = nodeId;
    }, []);

    const onConnectEnd: OnConnectEnd = useCallback((event) => {
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
    }, [screenToFlowPosition, getNode, createOpportunityOnDrop]);

    return (
        <div className="w-full h-full flex">
            <main 
                className="flex-1 relative"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <ReactFlow
                    nodes={nodes.map(node => ({ ...node, data: { ...node.data, isDraggingEvidence } }))}
                    edges={styledEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onConnectStart={onConnectStart}
                    onConnectEnd={onConnectEnd}
                    onNodeClick={onNodeClick}
                    onNodeDragStop={onNodeDragStop}
                    onNodesDelete={handleNodesDelete}
                    nodeTypes={useMemo(() => ({ default: CustomNode }), [])}
                    fitView
                    deleteKeyCode={['Backspace', 'Delete']}
                >
                    <Controls />
                    <Background />
                </ReactFlow>
                {nodes.length === 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-gray-400 pointer-events-none">
                        <h3 className="text-lg font-semibold">Canvas is Empty</h3>
                        <p>Click "+ New Outcome" or press 'u' to start.</p>
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

// The main export is now a clean wrapper that only provides the context
export default function DiscoveryCanvas(props: any) {
    return (
        <ReactFlowProvider>
            <DiscoveryCanvasContent {...props} />
        </ReactFlowProvider>
    );
}

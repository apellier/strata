import { create } from 'zustand';
import { Node, Edge, OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges, Connection } from 'reactflow';
import * as api from './api';
import type { Outcome, Opportunity, Solution, Evidence } from '@prisma/client';
import toast from 'react-hot-toast';

type NodeType = 'outcome' | 'opportunity' | 'solution';

// Define a union type for all possible data objects our nodes can hold
type NodeData = Outcome | Opportunity | Solution;

// Constants for a clean layout
const NODE_WIDTH = 256;
const HORIZONTAL_SPACING = 50;
const VERTICAL_SPACING = 150;

export interface AppState {
  nodes: Node[];
  edges: Edge[];
  isDraggingEvidence: boolean; // <-- Add new state here
  setIsDraggingEvidence: (isDragging: boolean) => void;
  getCanvasData: () => Promise<void>;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => Promise<void>;
  updateNodePosition: (id: string, type: string, position: { x: number; y: number }) => void;
  addNode: (type: 'outcome' | 'opportunity', parentNode?: Node) => Promise<void>;
  updateNodeData: (id: string, type: string, data: any) => Promise<void>;
  onNodesDelete: (deletedNodes: Node[]) => void;
  promoteIdeaToSolution: (idea: string, opportunity: Opportunity) => Promise<void>;
  linkEvidenceToOpportunity: (evidenceId: string, opportunityId: string) => Promise<void>;
  createOpportunityOnDrop: (sourceNode: Node, position: { x: number; y: number }) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  isDraggingEvidence: false, // <-- Initialize the state
  setIsDraggingEvidence: (isDragging) => set({ isDraggingEvidence: isDragging }), // <-- Implement the setter

  getCanvasData: async () => {
    try {
        const [outcomes, opportunities, solutions] = await api.getCanvasData();
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        outcomes.forEach((o: Outcome) => newNodes.push({ id: o.id, type: 'default', position: { x: o.x_position, y: o.y_position }, data: { ...o, label: o.name, type: 'outcome' } }));
        
        opportunities.forEach((o: Opportunity) => {
            newNodes.push({ id: o.id, type: 'default', position: { x: o.x_position, y: o.y_position }, data: { ...o, label: o.name, type: 'opportunity' } });
            if (o.parentId) newEdges.push({ id: `e-${o.parentId}-${o.id}`, source: o.parentId, target: o.id, animated: true });
            else if (o.outcomeId) newEdges.push({ id: `e-${o.outcomeId}-${o.id}`, source: o.outcomeId, target: o.id, animated: true });
        });

        solutions.forEach((s: Solution & { opportunityId?: string }) => {
            newNodes.push({ id: s.id, type: 'default', position: { x: s.x_position, y: s.y_position }, data: { ...s, label: s.name, type: 'solution' } });
            if (s.opportunityId) {
                newEdges.push({ id: `e-${s.opportunityId}-${s.id}`, source: s.opportunityId, target: s.id, animated: true, style: { stroke: '#1DB954', strokeWidth: 2 } });
            }
        });

        set({ nodes: newNodes, edges: newEdges });
    } catch (error) {
        toast.error("Failed to load canvas data.");
        console.error("Error fetching canvas data:", error);
    }
  },

  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: async (connection: Connection) => {
    const { source, target } = connection;
    if (!source || !target) return;
    
    const { nodes } = get();
    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);
    if (!sourceNode || !targetNode) return;

    const updateData: any = {};
    if (targetNode.data.type === 'opportunity') {
        updateData.outcomeId = sourceNode.data.type === 'outcome' ? source : sourceNode.data.outcomeId;
        updateData.parentId = sourceNode.data.type === 'opportunity' ? source : null;
    } else if (targetNode.data.type === 'solution') {
        updateData.opportunityId = source;
    }

    const apiCall = api.updateNode(targetNode.data.type, target, updateData);
    toast.promise(apiCall, {
      loading: 'Connecting nodes...',
      success: 'Nodes connected!',
      error: 'Failed to connect nodes.',
    });
    
    const updatedNode = await apiCall;
    set(state => ({
        edges: applyEdgeChanges([{ type: 'add', item: { id: `e-${source}-${target}`, source, target, animated: true } }], state.edges),
        nodes: state.nodes.map(n => n.id === target ? { ...n, data: { ...n.data, ...updatedNode } } : n)
    }));
    
    if (updatedNode) { // Check if updatedNode is not null to prevent spread error
      set(state => ({
          edges: applyEdgeChanges([{ type: 'add', item: { id: `e-${source}-${target}`, source, target, animated: true } }], state.edges),
          nodes: state.nodes.map(n => n.id === target ? { ...n, data: { ...n.data, ...updatedNode } } : n)
      }));
  }
  },
  
  updateNodePosition: (id, type, position) => {
    api.updateNode(type, id, { x_position: position.x, y_position: position.y }).catch(err => {
        toast.error("Failed to save new position.");
        console.error(err);
    });
  },

  addNode: async (type, parentNode) => {
    const { nodes } = get();
    let position = { x: 100, y: 100 };

    if (parentNode) {
      const children = nodes.filter(n => n.data.parentId === parentNode.id || n.data.outcomeId === parentNode.id);
      position = {
        x: parentNode.position.x + children.length * (NODE_WIDTH + HORIZONTAL_SPACING),
        y: parentNode.position.y + VERTICAL_SPACING,
      };
    }

    const defaultData: Partial<Opportunity | Outcome> = {
        name: type === 'outcome' ? 'New Outcome' : 'New Opportunity',
        x_position: position.x,
        y_position: position.y,
        ...(parentNode && {
            outcomeId: parentNode.data.type === 'outcome' ? parentNode.id : parentNode.data.outcomeId,
            parentId: parentNode.data.type === 'opportunity' ? parentNode.id : null,
        }),
    };
    
    const apiCall = api.addNode(type, defaultData);
    toast.promise(apiCall, {
      loading: `Creating new ${type}...`,
      success: `New ${type} created!`,
      error: `Failed to create ${type}.`,
    });

    const createdNode = await apiCall;
    const newNode: Node = {
        id: createdNode.id,
        type: 'default',
        position,
        data: { ...createdNode, label: createdNode.name, type },
    };

    set(state => ({ nodes: [...state.nodes, newNode] }));

    if (parentNode) {
        const newEdge: Edge = {
            id: `e-${parentNode.id}-${newNode.id}`,
            source: parentNode.id,
            target: newNode.id,
            animated: true,
        };
        set(state => ({ edges: [...state.edges, newEdge] }));
    }
  },
  
  updateNodeData: async (id, type, data) => {
    set(state => ({
        nodes: state.nodes.map(n => {
            if (n.id === id) {
                const newLabel = data.name || n.data.label;
                return { ...n, data: { ...n.data, ...data, label: newLabel } };
            }
            return n;
        })
    }));
    api.updateNode(type, id, data).catch(() => {
        toast.error(`Failed to save ${type}.`);
        get().getCanvasData();
    });
  },

  onNodesDelete: (deletedNodes) => {
    for (const node of deletedNodes) {
        const apiCall = api.deleteNode(node.data.type, node.id);
        toast.promise(apiCall, {
            loading: `Deleting ${node.data.type}...`,
            success: `${node.data.type} deleted.`,
            error: `Failed to delete ${node.data.type}.`,
        });
    }
  },

  promoteIdeaToSolution: async (idea, opportunity) => {
    const apiCall = api.promoteIdeaToSolution(idea, opportunity);
    toast.promise(apiCall, {
        loading: 'Promoting idea to solution...',
        success: 'Solution created on canvas!',
        error: 'Failed to create solution.',
    });

    const newSolution = await apiCall;
    const newNode: Node = {
        id: newSolution.id,
        type: 'default',
        position: { x: newSolution.x_position, y: newSolution.y_position },
        data: { ...newSolution, label: newSolution.name, type: 'solution' },
    };
    const newEdge: Edge = {
        id: `e-${opportunity.id}-${newNode.id}`,
        source: opportunity.id,
        target: newNode.id,
        animated: true,
        style: { stroke: '#1DB954', strokeWidth: 2 },
    };
    set(state => ({
        nodes: [...state.nodes, newNode],
        edges: [...state.edges, newEdge],
    }));
  },

  linkEvidenceToOpportunity: async (evidenceId, opportunityId) => {
    const { nodes } = get();
    const opportunityNode = nodes.find(n => n.id === opportunityId);
    if (!opportunityNode) return;

    const currentEvidenceIds = (opportunityNode.data.evidences || []).map((e: Evidence) => e.id);
    if (currentEvidenceIds.includes(evidenceId)) return;
    
    const newEvidenceIds = [...currentEvidenceIds, evidenceId];
    
    const apiCall = api.updateNode('opportunity', opportunityId, { evidenceIds: newEvidenceIds });
    toast.promise(apiCall, {
        loading: 'Linking evidence...',
        success: 'Evidence linked!',
        error: 'Failed to link evidence.',
    });

    const allEvidence = await api.getAllEvidence();
    const newEvidenceObject = allEvidence.find(e => e.id === evidenceId);

    if (newEvidenceObject) {
        set(state => ({
            nodes: state.nodes.map(n => {
                if (n.id === opportunityId) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            evidences: [...(n.data.evidences || []), newEvidenceObject],
                        }
                    };
                }
                return n;
            })
        }));
    }
  },

  createOpportunityOnDrop: async (sourceNode, position) => {
    const { nodes } = get();
    const children = nodes.filter(n => n.data.parentId === sourceNode.id || n.data.outcomeId === sourceNode.id);
    const newPosition = {
        x: sourceNode.position.x + children.length * (NODE_WIDTH + HORIZONTAL_SPACING),
        y: sourceNode.position.y + VERTICAL_SPACING,
    };
    
    const newNodeData = {
      name: 'New Opportunity',
      x_position: newPosition.x,
      y_position: newPosition.y,
      outcomeId: sourceNode.data.type === 'outcome' ? sourceNode.id : sourceNode.data.outcomeId,
      parentId: sourceNode.data.type === 'opportunity' ? sourceNode.id : null,
    };

    const apiCall = api.addNode('opportunity', newNodeData);
    toast.promise(apiCall, {
        loading: 'Creating new opportunity...',
        success: 'New opportunity created!',
        error: 'Failed to create opportunity.',
    });

    const createdNode = await apiCall;
    const newNode: Node = {
        id: createdNode.id,
        type: 'default',
        position: newPosition,
        data: { ...createdNode, label: createdNode.name, type: 'opportunity' },
    };
    const newEdge: Edge = {
        id: `e-${sourceNode.id}-${newNode.id}`,
        source: sourceNode.id,
        target: newNode.id,
        animated: true,
    };
    set(state => ({ 
        nodes: [...state.nodes, newNode],
        edges: [...state.edges, newEdge],
    }));
  },
}));

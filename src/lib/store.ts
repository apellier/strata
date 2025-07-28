import { create } from 'zustand';
import { Node, Edge, OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges, Connection } from 'reactflow';
import * as api from './api';
import type { Outcome, Opportunity, Solution, Evidence, Interview } from '@prisma/client';
import toast from 'react-hot-toast';

// --- Create Discriminated Union Types ---
type NodeType = 'outcome' | 'opportunity' | 'solution';

// 1. Extend the Prisma types with properties needed for UI logic
// Add 'evidenceIds' as an optional property for API calls
export type TypedOutcome = Outcome & { type: 'outcome'; label: string; };
export type TypedOpportunity = Opportunity & { type: 'opportunity'; label: string; evidences: (Evidence & { interview: Interview })[]; evidenceIds?: string[] };
export type TypedSolution = Solution & { type: 'solution'; label: string; };

// 2. Create the NodeData union from our new, specific types
export type NodeData = TypedOutcome | TypedOpportunity | TypedSolution;


// Constants for a clean layout
const NODE_WIDTH = 256;
const HORIZONTAL_SPACING = 50;
const VERTICAL_SPACING = 150;

export interface AppState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  isDraggingEvidence: boolean;
  setIsDraggingEvidence: (isDragging: boolean) => void;
  getCanvasData: () => Promise<void>;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => Promise<void>;
  updateNodePosition: (id: string, type: NodeType, position: { x: number; y: number }) => void;
  addNode: (type: 'outcome' | 'opportunity', parentNode?: Node<NodeData>) => Promise<void>;
  updateNodeData: (id: string, type: NodeType, data: Partial<NodeData>) => Promise<void>;
  onNodesDelete: (deletedNodes: Node<NodeData>[]) => void;
  promoteIdeaToSolution: (candidate: { title: string; quickAssumptions: string[] }, opportunity: Opportunity) => Promise<void>;
  linkEvidenceToOpportunity: (evidenceId: string, opportunityId: string) => Promise<void>;
  createOpportunityOnDrop: (sourceNode: Node<NodeData>, position: { x: number; y: number }) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  isDraggingEvidence: false,
  setIsDraggingEvidence: (isDragging) => set({ isDraggingEvidence: isDragging }),

  getCanvasData: async () => {
    try {
      const [outcomes, opportunities, solutions] = await api.getCanvasData();
      const newNodes: Node<NodeData>[] = [];
      const newEdges: Edge[] = [];

      outcomes.forEach((o) => newNodes.push({ id: o.id, type: 'default', position: { x: o.x_position, y: o.y_position }, data: { ...o, label: o.name, type: 'outcome' } }));
      
      opportunities.forEach((o) => {
          newNodes.push({ id: o.id, type: 'default', position: { x: o.x_position, y: o.y_position }, data: { ...o, label: o.name, type: 'opportunity' } });
          if (o.parentId) newEdges.push({ id: `e-${o.parentId}-${o.id}`, source: o.parentId, target: o.id, animated: true });
          else if (o.outcomeId) newEdges.push({ id: `e-${o.outcomeId}-${o.id}`, source: o.outcomeId, target: o.id, animated: true });
      });

      solutions.forEach((s) => {
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

  onNodesChange: (changes) => set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) => set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  onConnect: async (connection) => {
    const { source, target } = connection;
    if (!source || !target) return;
    
    const { nodes } = get();
    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);
    if (!sourceNode || !targetNode) return;

    const targetType = targetNode.data.type;
    let updateData: Partial<Opportunity | Solution> = {};

    if (targetType === 'opportunity') {
        updateData = {
            outcomeId: sourceNode.data.type === 'outcome' ? source : (sourceNode.data as Opportunity).outcomeId,
            parentId: sourceNode.data.type === 'opportunity' ? source : null
        };
    } else if (targetType === 'solution') {
        updateData = { opportunityId: source };
    }
    
    const updatedNode = await toast.promise(api.updateNode(targetType, target, updateData), {
        loading: 'Connecting nodes...',
        success: 'Nodes connected!',
        error: 'Failed to connect nodes.',
    });
    
    if (updatedNode) { // This check prevents the spread error
        set(state => ({
            edges: applyEdgeChanges([{ type: 'add', item: { id: `e-${source}-${target}`, source, target, animated: true } }], state.edges),
            nodes: state.nodes.map(n => n.id === target ? { ...n, data: { ...n.data, ...updatedNode } } : n)
        }));
    }
  },
  
  updateNodePosition: (id, type, position) => {
    // Optimistically update the UI
    set(state => ({
        nodes: state.nodes.map(n => n.id === id ? { ...n, position } : n)
    }));

    const apiCall = api.updateNode(type, id, { x_position: position.x, y_position: position.y });

    toast.promise(apiCall, {
        loading: 'Saving position...',
        success: 'Position saved!',
        error: (err) => {
            console.error("Failed to save position:", err);
            // Revert on failure
            get().getCanvasData(); 
            return 'Failed to save position.';
        }
    });
  },

  addNode: async (type, parentNode) => {
    const { nodes } = get();
    let position = { x: 100, y: 100 };

    if (parentNode) {
      // Use a type guard to safely access properties
      const children = nodes.filter(n => {
        if (n.data.type === 'opportunity') {
          return n.data.parentId === parentNode.id || n.data.outcomeId === parentNode.id;
        }
        return false;
      });
      position = {
        x: parentNode.position.x + children.length * (NODE_WIDTH + HORIZONTAL_SPACING),
        y: parentNode.position.y + VERTICAL_SPACING,
      };
    }

    const defaultData = {
        name: type === 'outcome' ? 'New Outcome' : 'New Opportunity',
        x_position: position.x,
        y_position: position.y,
        ...(parentNode && type === 'opportunity' && {
            outcomeId: parentNode.data.type === 'outcome' ? parentNode.id : (parentNode.data as TypedOpportunity).outcomeId,
            parentId: parentNode.data.type === 'opportunity' ? parentNode.id : null,
        }),
    };

    const createdNode = await toast.promise(api.addNode(type, defaultData), {
        loading: `Creating new ${type}...`,
        success: `New ${type} created!`,
        error: `Failed to create ${type}.`,
    });

    if (!createdNode) return;

    // Cast the final data object to NodeData to satisfy the compiler
    const newNode: Node<NodeData> = {
        id: createdNode.id,
        type: 'default',
        position,
        data: { ...createdNode, label: createdNode.name, type } as NodeData,
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
    // Optimistically update the label for immediate text feedback
    set(state => ({
        nodes: state.nodes.map(n => {
            if (n.id === id) {
                const newLabel = data.name || n.data.label;
                return { ...n, data: { ...n.data, ...data, label: newLabel } };
            }
            return n;
        })
    }));

    try {
      // Wait for the API call to complete
      const updatedNodeFromServer = await api.updateNode(type, id, data);
      
      // Update the store with the fresh, complete data from the server
      set(state => ({
        nodes: state.nodes.map(n => {
          if (n.id === id) {
            return { ...n, data: { ...updatedNodeFromServer, label: updatedNodeFromServer.name, type: n.data.type } as NodeData };
          }
          return n;
        })
      }));
    } catch (error) {
        toast.error(`Failed to save ${type}.`);
        // If the API call fails, revert to the server's state
        get().getCanvasData();
    }
  },

  onNodesDelete: (deletedNodes) => {
    for (const node of deletedNodes) {
        api.deleteNode(node.data.type, node.id)
            .then(() => toast.success(`${node.data.type} deleted.`))
            .catch(() => toast.error(`Failed to delete ${node.data.type}.`));
    }
  },

  promoteIdeaToSolution: async (candidate, opportunity) => {
    const apiCall = api.promoteIdeaToSolution(candidate, opportunity);
    toast.promise(apiCall, {
        loading: 'Promoting idea to solution...',
        success: 'Solution created on canvas!',
        error: 'Failed to create solution.',
    });

    const newSolution = await apiCall;
    if (!newSolution) return; // Guard against failed API call

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

  linkEvidenceToOpportunity: async (evidenceId: string, opportunityId: string) => {
    const { nodes } = get();
    const opportunityNode = nodes.find(n => n.id === opportunityId);
    // Use a type guard to ensure we're working with an opportunity
    if (!opportunityNode || opportunityNode.data.type !== 'opportunity') return;

    const currentEvidences = opportunityNode.data.evidences || [];
    const currentEvidenceIds = currentEvidences.map((e) => e.id);
    if (currentEvidenceIds.includes(evidenceId)) return;
    
    const newEvidenceIds = [...currentEvidenceIds, evidenceId];
    
    // Explicitly cast the update object to the correct type
    const updatePayload: Partial<TypedOpportunity> = { evidenceIds: newEvidenceIds };

    await toast.promise(api.updateNode('opportunity', opportunityId, updatePayload), {
        loading: 'Linking evidence...',
        success: 'Evidence linked!',
        error: 'Failed to link evidence.',
    });

    // Refresh the canvas data to show the newly linked evidence
    await get().getCanvasData();
  },

  createOpportunityOnDrop: async (sourceNode, position) => {
    const { nodes } = get();
    const children = nodes.filter(n => {
        // Use a type guard to safely access properties
        if (n.data.type === 'opportunity') {
            return n.data.parentId === sourceNode.id || n.data.outcomeId === sourceNode.id;
        }
        return false;
    });
    const newPosition = {
        x: sourceNode.position.x + children.length * (NODE_WIDTH + HORIZONTAL_SPACING),
        y: sourceNode.position.y + VERTICAL_SPACING,
    };
    
    const newNodeData = {
      name: 'New Opportunity',
      x_position: newPosition.x,
      y_position: newPosition.y,
      // Use type guards to safely access properties
      outcomeId: sourceNode.data.type === 'outcome' ? sourceNode.id : (sourceNode.data as TypedOpportunity).outcomeId,
      parentId: sourceNode.data.type === 'opportunity' ? sourceNode.id : null,
    };

    const createdNode = await toast.promise(api.addNode('opportunity', newNodeData), {
        loading: 'Creating new opportunity...',
        success: 'New opportunity created!',
        error: 'Failed to create opportunity.',
    });

    if (!createdNode) return;

    const newNode: Node<NodeData> = {
        id: createdNode.id,
        type: 'default',
        position,
        data: { ...createdNode, label: createdNode.name, type: 'opportunity' } as NodeData,
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

import { create } from 'zustand';
import {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import * as api from './api';
import type {
  Outcome,
  Opportunity,
  Solution,
  Evidence,
  Interview,
  Assumption,
  Experiment,
} from '@prisma/client';
import toast from 'react-hot-toast';
import { devtools } from 'zustand/middleware';

type NodeType = 'outcome' | 'opportunity' | 'solution';

export type TypedOutcome = Outcome & { type: 'outcome'; label: string };
export type TypedOpportunity = Opportunity & {
  type: 'opportunity';
  label: string;
  evidences: (Evidence & { interview: Interview })[];
  evidenceIds?: string[];
  _count?: { solutions: number };
};
export type TypedSolution = Solution & {
  type: 'solution';
  label: string;
  assumptions: (Assumption & { experiments: Experiment[] })[];
};

export type NodeData = TypedOutcome | TypedOpportunity | TypedSolution;

// Constants for a clean layout
const NODE_WIDTH = 256;
const HORIZONTAL_SPACING = 50;
const VERTICAL_SPACING = 150;

export type HistoryState = {
  nodes: Node<NodeData>[];
  edges: Edge[];
};

export interface AppState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  isDraggingEvidence: boolean;
  past: HistoryState[];
  future: HistoryState[];
  setIsDraggingEvidence: (isDragging: boolean) => void;
  getCanvasData: () => Promise<void>;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => Promise<void>;
  updateNodePosition: (
    id: string,
    type: NodeType,
    position: { x: number; y: number }
  ) => void;
  addNode: (
    type: 'outcome' | 'opportunity',
    parentNode?: Node<NodeData>
  ) => Promise<void>;
  updateNodeData: (
    id: string,
    type: NodeType,
    data: Partial<NodeData>
  ) => Promise<void>;
  onNodesDelete: (deletedNodes: Node<NodeData>[]) => void;
  promoteIdeaToSolution: (
    candidate: { title: string; quickAssumptions: string[] },
    opportunity: Opportunity
  ) => Promise<void>;
  linkEvidenceToOpportunity: (
    evidenceId: string,
    opportunityId: string
  ) => Promise<void>;
  createOpportunityOnDrop: (
    sourceNode: Node<NodeData>,
    position: { x: number; y: number }
  ) => Promise<void>;
  takeSnapshot: () => void;
  undo: () => void;
  redo: () => void;
}

export const useStore = create<AppState>()(
  devtools((set, get) => ({
    nodes: [],
    edges: [],
    isDraggingEvidence: false,
    past: [],
    future: [],
    setIsDraggingEvidence: (isDragging) => set({ isDraggingEvidence: isDragging }),

    getCanvasData: async () => {
      try {
        const [outcomes, opportunities, solutions] = await api.getCanvasData();
        const newNodes: Node<NodeData>[] = [];
        const newEdges: Edge[] = [];

        outcomes.forEach((o) =>
          newNodes.push({
            id: o.id,
            type: 'default',
            position: { x: o.x_position, y: o.y_position },
            data: { ...o, label: o.name, type: 'outcome' },
          })
        );
        opportunities.forEach((o) => {
          newNodes.push({
            id: o.id,
            type: 'default',
            position: { x: o.x_position, y: o.y_position },
            data: { ...o, label: o.name, type: 'opportunity' } as TypedOpportunity,
          });
          if (o.parentId)
            newEdges.push({
              id: `e-${o.parentId}-${o.id}`,
              source: o.parentId,
              target: o.id,
              animated: true,
            });
          else if (o.outcomeId)
            newEdges.push({
              id: `e-${o.outcomeId}-${o.id}`,
              source: o.outcomeId,
              target: o.id,
              animated: true,
            });
        });
        solutions.forEach((s) => {
          newNodes.push({
            id: s.id,
            type: 'default',
            position: { x: s.x_position, y: s.y_position },
            data: { ...s, label: s.name, type: 'solution' } as TypedSolution,
          });
          if (s.opportunityId) {
            newEdges.push({
              id: `e-${s.opportunityId}-${s.id}`,
              source: s.opportunityId,
              target: s.id,
              animated: true,
              style: { stroke: '#1DB954', strokeWidth: 2 },
            });
          }
        });

        set({ nodes: newNodes, edges: newEdges, past: [], future: [] });
      } catch (error) {
        toast.error('Failed to load canvas data.');
        console.error('Error fetching canvas data:', error);
      }
    },

    onNodesChange: (changes: NodeChange[]) =>
      set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

    onEdgesChange: (changes: EdgeChange[]) =>
      set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

    onConnect: async (connection) => {
      get().takeSnapshot(); // Correctly call the function
      const { source, target } = connection;
      if (!source || !target) return;

      const { nodes } = get();
      const sourceNode = nodes.find((n) => n.id === source);
      const targetNode = nodes.find((n) => n.id === target);
      if (!sourceNode || !targetNode) return;

      const targetType = targetNode.data.type;
      let updateData: Partial<Opportunity | Solution> = {};

      if (targetType === 'opportunity') {
        updateData = {
          outcomeId:
            sourceNode.data.type === 'outcome'
              ? source
              : (sourceNode.data as Opportunity).outcomeId,
          parentId: sourceNode.data.type === 'opportunity' ? source : null,
        };
      } else if (targetType === 'solution') {
        updateData = { opportunityId: source };
      }

      const updatedNode = await toast.promise(
        api.updateNode(targetType, target, updateData),
        {
          loading: 'Connecting nodes...',
          success: 'Nodes connected!',
          error: 'Failed to connect nodes.',
        }
      );

      if (updatedNode) {
        set((state) => ({
          edges: applyEdgeChanges(
            [{ type: 'add', item: { id: `e-${source}-${target}`, source, target, animated: true } }],
            state.edges
          ),
          nodes: state.nodes.map((n) => {
            if (n.id === target) {
              const mergedData = {
                ...n.data,
                ...updatedNode,
                label: updatedNode.name || n.data.label,
              };
              if (
                n.data.type === 'opportunity' &&
                !('evidences' in updatedNode)
              ) {
                (mergedData as TypedOpportunity).evidences = n.data.evidences;
              }
              return { ...n, data: mergedData as NodeData };
            }
            return n;
          }),
        }));
      }
    },

    updateNodePosition: (id, type, position) => {
      // Snapshot is handled by onNodeDragStop in the canvas component
      set((state) => ({
        nodes: state.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
      }));
      const apiCall = api.updateNode(type, id, {
        x_position: position.x,
        y_position: position.y,
      });
      toast.promise(apiCall, {
        loading: 'Saving position...',
        success: 'Position saved!',
        error: (err) => {
          console.error('Failed to save position:', err);
          get().getCanvasData();
          return 'Failed to save position.';
        },
      });
    },

  addNode: async (type, parentNode) => {
    get().takeSnapshot();
    const { nodes } = get();
    let position = { x: 100, y: 100 };

    if (parentNode) {
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

    const newNodeData: NodeData = {
      // Use a more specific type that covers all possibilities
      ...(createdNode as Outcome | Opportunity | Solution),
      label: createdNode.name,
      type: type,
      // Ensure opportunity nodes have an empty evidences array on creation
      ...(type === 'opportunity' && { evidences: [] }),
    } as NodeData; // Assert the final object matches the NodeData type


    const newNode: Node<NodeData> = {
        id: createdNode.id,
        type: 'default',
        position,
        data: newNodeData,
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
    get().takeSnapshot();
    if (data.name) {
      set(state => ({
          nodes: state.nodes.map(n => {
              if (n.id === id) {
                  return { ...n, data: { ...n.data, label: data.name as string } };
              }
              return n;
          })
      }));
    }

    try {
      const updatedNodeFromServer = await api.updateNode(type, id, data as Partial<NodeData>);
      
      set(state => ({
        nodes: state.nodes.map(n => {
          if (n.id === id) {
            const mergedData = { 
              ...n.data, 
              ...updatedNodeFromServer, 
              label: updatedNodeFromServer.name || n.data.label 
            };
            return { ...n, data: mergedData };
          }
          return n;
        })
      }));
    } catch (error) {
        toast.error(`Failed to save ${type}.`);
        get().getCanvasData();
    }
  },

  onNodesDelete: (deletedNodes) => {
    get().takeSnapshot();
    for (const node of deletedNodes) {
        api.deleteNode(node.data.type, node.id)
            .then(() => toast.success(`${node.data.type} deleted.`))
            .catch(() => toast.error(`Failed to delete ${node.data.type}.`));
    }
  },

  promoteIdeaToSolution: async (candidate, opportunity) => {
    get().takeSnapshot();
    const apiCall = api.promoteIdeaToSolution(candidate, opportunity);
    toast.promise(apiCall, {
        loading: 'Promoting idea to solution...',
        success: 'Solution created on canvas!',
        error: 'Failed to create solution.',
    });

    const newSolution = await apiCall;
    if (!newSolution) return;

    const newNode: Node<TypedSolution> = {
      id: newSolution.id,
      type: 'default',
      position: { x: newSolution.x_position, y: newSolution.y_position },
      data: { ...(newSolution as Solution), label: newSolution.name, type: 'solution', assumptions: [] },
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
    get().takeSnapshot();
    const { nodes } = get();
    const opportunityNode = nodes.find(n => n.id === opportunityId);
    if (!opportunityNode || opportunityNode.data.type !== 'opportunity') return;

    const currentEvidences = opportunityNode.data.evidences || [];
    const currentEvidenceIds = currentEvidences.map((e) => e.id);
    if (currentEvidenceIds.includes(evidenceId)) return;

    const newEvidenceIds = [...currentEvidenceIds, evidenceId];

    const updatePayload: Partial<TypedOpportunity> = { evidenceIds: newEvidenceIds };

    await toast.promise(api.updateNode('opportunity', opportunityId, updatePayload), {
        loading: 'Linking evidence...',
        success: 'Evidence linked!',
        error: 'Failed to link evidence.',
    });

    await get().getCanvasData();
  },

  createOpportunityOnDrop: async (sourceNode, position) => {
    get().takeSnapshot();
    const { nodes } = get();
    const children = nodes.filter(n => {
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
      outcomeId: sourceNode.data.type === 'outcome' ? sourceNode.id : (sourceNode.data as TypedOpportunity).outcomeId,
      parentId: sourceNode.data.type === 'opportunity' ? sourceNode.id : null,
    };

    const createdNode = await toast.promise(api.addNode('opportunity', newNodeData), {
        loading: 'Creating new opportunity...',
        success: 'New opportunity created!',
        error: 'Failed to create opportunity.',
    });

    if (!createdNode) return;

    const finalNodeData: TypedOpportunity = {
      ...(createdNode as Opportunity),
      type: 'opportunity',
      label: createdNode.name,
      evidences: [],
      _count: { solutions: 0 } // <-- FIX: Initialize _count property
  };

    const newNode: Node<NodeData> = {
        id: createdNode.id,
        type: 'default',
        position,
        data: finalNodeData,
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

  takeSnapshot: () => {
    set((state) => ({
      past: [...state.past, { nodes: state.nodes, edges: state.edges }],
      future: [], // Clear future when a new action is taken
    }));
  },

  undo: () => {
    const { past, nodes, edges, future } = get();
    if (past.length === 0) return;

    const previousState = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      past: newPast,
      nodes: previousState.nodes,
      edges: previousState.edges,
      future: [{ nodes, edges }, ...future],
    });
  },

  redo: () => {
    const { future, nodes, edges, past } = get();
    if (future.length === 0) return;

    const nextState = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, { nodes, edges }],
      nodes: nextState.nodes,
      edges: nextState.edges,
      future: newFuture,
    });
  },

}))
);
'use client';

import React from 'react';
import ElementDetails from './ElementDetails';
import type { Opportunity, Solution, Outcome } from '@prisma/client';
import { useStore, NodeData } from '@/lib/store';
import { X } from 'lucide-react'; // <-- Import the X icon


export type PanelState =
  | { isOpen: false }
  | { isOpen: true; mode: 'edit'; nodeId: string };

interface SidePanelProps {
  panelState: PanelState;
  onClose: () => void;
  onFocusOpportunity: (opportunity: Opportunity) => void;
  onFocusSolution: (solution: Solution) => void;
  onFocusOutcome: (outcome: Outcome) => void;
}

export default function SidePanel({ panelState, onClose, onFocusOpportunity, onFocusSolution, onFocusOutcome }: SidePanelProps) {
  const nodes = useStore((state) => state.nodes); 
  if (!panelState.isOpen) return null;

  const node = nodes.find((n) => n.id === (panelState as { nodeId: string }).nodeId);
  const nodeData = node?.data;

  const getTitle = () => {
    if (panelState.mode === 'edit' && nodeData) {
      return `Details for ${nodeData.label}`;
    }
    return 'Details';
  };
  const shouldRenderDetails = panelState.mode === 'edit' && nodeData;
  const getFocusHandler = () => {
    if (!shouldRenderDetails) return () => {};
    switch (nodeData.type) {
      case 'opportunity': return (node: NodeData) => onFocusOpportunity(node as Opportunity);
      case 'solution': return (node: NodeData) => onFocusSolution(node as Solution);
      case 'outcome': return (node: NodeData) => onFocusOutcome(node as Outcome);
      default: return () => {};
    }
  };
  return (
    <aside className={`flex-shrink-0 bg-white border-l border-gray-200 transition-all duration-300 ease-in-out h-full overflow-hidden ${panelState.isOpen ? 'w-full md:w-1/3 min-w-[400px]' : 'w-0 border-l-0'}`}>
      <div className={`flex flex-col h-full ${!panelState.isOpen ? 'invisible' : ''}`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold truncate pr-4">{getTitle()}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-grow">
          {shouldRenderDetails && (
            <ElementDetails nodeData={nodeData} onFocus={getFocusHandler()} isFocusMode={false} />
          )}
        </div>
      </div>
    </aside>
  );
}
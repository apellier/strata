'use client';

import React from 'react';
import ElementDetails from './ElementDetails';
import type { Opportunity, Solution, Outcome } from '@prisma/client';

export type PanelState =
  | { isOpen: false }
  | { isOpen: true; mode: 'edit'; nodeData: any };

interface SidePanelProps {
  panelState: PanelState;
  onClose: () => void;
  onFocusOpportunity: (opportunity: Opportunity) => void;
  onFocusSolution: (solution: Solution) => void;
  onFocusOutcome: (outcome: Outcome) => void;
}

export default function SidePanel({ panelState, onClose, onFocusOpportunity, onFocusSolution, onFocusOutcome }: SidePanelProps) {
  if (!panelState.isOpen) return null;
  const getTitle = () => {
    if (panelState.mode === 'edit' && panelState.nodeData) {
      return `Details for ${panelState.nodeData.label}`;
    }
    return 'Details';
  };
  const shouldRenderDetails = panelState.mode === 'edit' && panelState.nodeData;
  const getFocusHandler = () => {
    if (!shouldRenderDetails) return () => {};
    switch (panelState.nodeData.type) {
      case 'opportunity': return onFocusOpportunity;
      case 'solution': return onFocusSolution;
      case 'outcome': return onFocusOutcome;
      default: return () => {};
    }
  };
  return (
    <aside className={`flex-shrink-0 bg-white border-l border-gray-200 transition-all duration-300 ease-in-out h-full overflow-hidden ${panelState.isOpen ? 'w-full md:w-1/3 min-w-[400px]' : 'w-0 border-l-0'}`}>
      <div className={`flex flex-col h-full ${!panelState.isOpen ? 'invisible' : ''}`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold truncate pr-4">{getTitle()}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-200">{/* ... svg ... */}</button>
        </div>
        <div className="p-4 overflow-y-auto flex-grow">
          {shouldRenderDetails && (
            <ElementDetails nodeData={panelState.nodeData} onFocus={getFocusHandler()} isFocusMode={false} />
          )}
        </div>
      </div>
    </aside>
  );
}
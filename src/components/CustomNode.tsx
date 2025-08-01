// src/components/CustomNode.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useStore, NodeData, TypedOpportunity, TypedSolution, TypedOutcome } from '@/lib/store';
import { BookText, Target, Lightbulb, FlaskConical, X, CheckCircle } from 'lucide-react';
import type { Evidence, Interview, Assumption } from '@prisma/client';

const EvidencePopover = ({ evidences, opportunityId, onClose }: { evidences: (Evidence & { interview: Interview })[], opportunityId: string, onClose: () => void }) => {
  const { updateNodeData } = useStore();

  const handleUnlink = (evidenceIdToUnlink: string) => {
    const linkedEvidenceIds = evidences.map(e => e.id);
    const newEvidenceIds = linkedEvidenceIds.filter(id => id !== evidenceIdToUnlink);
    updateNodeData(opportunityId, 'opportunity', { evidenceIds: newEvidenceIds });
  };
  const evidenceColors: { [key: string]: string } = {
        VERBATIM: 'border-blue-400',
        PAIN_POINT: 'border-red-400',
        DESIRE: 'border-green-400',
        INSIGHT: 'border-purple-400',
    };

    return (
      <div className="absolute bottom-full mb-2 w-80 bg-white border border-[var(--border)] rounded-[var(--radius)] shadow-lg z-20 p-3 max-h-64 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold">Linked Evidence</h4>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
          </div>
          <div className="space-y-2">
              {evidences.length > 0 ? evidences.map(evidence => (
                  <div key={evidence.id} className={`p-2 rounded-md border-l-4 group relative ${evidenceColors[evidence.type]}`}>
                      <p className="text-sm italic">"{evidence.content}"</p>
                      <p className="text-xs text-gray-500 mt-1 text-right">From: {evidence.interview.interviewee}</p>
                      <button
                          onClick={() => handleUnlink(evidence.id)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-gray-200 text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                          title="Unlink Evidence"
                      >
                          <X size={12} />
                      </button>
                  </div>
              )) : (
                  <p className="text-sm text-gray-400 text-center">No evidence linked.</p>
              )}
          </div>
      </div>
  );
};

const getStatusStyles = (status?: string) => {
  switch (status) {
      case 'DISCOVERY': return { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' };
      case 'IN_PROGRESS': return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' };
      case 'DONE': return { bg: 'bg-gray-200', text: 'text-gray-600', dot: 'bg-gray-500' };
      case 'BLOCKED': return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
      case 'BACKLOG':
      default: return { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' };
  }
};

const getOutcomeStatusStyles = (status?: string) => {
  switch (status) {
      case 'AT_RISK': return { dot: 'bg-amber-500' };
      case 'ACHIEVED': return { dot: 'bg-blue-500' };
      case 'ARCHIVED': return { dot: 'bg-gray-400' };
      case 'ON_TRACK':
      default: return { dot: 'bg-green-500' };
  }
};

export default function CustomNode({ id, data, selected }: NodeProps<NodeData>) {
  const { label, type, status } = data;
  const [isEditing, setIsEditing] = useState(false);
  const [nodeLabel, setNodeLabel] = useState(label);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { updateNodeData, linkEvidenceToOpportunity, isDraggingEvidence } = useStore();

  useEffect(() => { setNodeLabel(label); }, [label]);

  const handleDoubleClick = () => setIsEditing(true);

  const handleUpdate = () => {
    setIsEditing(false);
    if (label !== nodeLabel.trim() && nodeLabel.trim() !== '') {
      updateNodeData(id, type, { name: nodeLabel.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleUpdate();
    else if (e.key === 'Escape') {
      setNodeLabel(label);
      setIsEditing(false);
    }
  };
  
  const handleEvidenceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPopoverOpen(!isPopoverOpen);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (data.type === 'opportunity' && isDraggingEvidence) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if(type === 'opportunity') {
        const evData = e.dataTransfer.getData('application/json');
        if (evData) {
          const evidence = JSON.parse(evData);
          linkEvidenceToOpportunity(evidence.id, id);
        }
    }
  };

  const typeStyles = {
    outcome: { border: 'border-t-blue-500', icon: <Target size={16} className="text-blue-500" /> },
    opportunity: { border: 'border-t-yellow-500', icon: <Lightbulb size={16} className="text-yellow-500" /> },
    solution: { border: 'border-t-green-500', icon: <FlaskConical size={16} className="text-green-500" /> },
  };


  const nodeStyle = typeStyles[type];
  const workflowStatusStyles = getStatusStyles(status);
  const outcomeStatusStyles = getOutcomeStatusStyles(data.status);
  const selectedStyle = selected ? 'ring-2 ring-blue-500' : 'shadow-md';
  const dragOverStyle = isDragOver ? 'ring-2 ring-green-500 ring-offset-2' : '';
  
  const validatedAssumptions = type === 'solution' ? (data as TypedSolution).assumptions?.filter((a: Assumption) => a.isValidated).length : 0;
  const totalAssumptions = type === 'solution' ? (data as TypedSolution).assumptions?.length : 0;
  const solutionCount = type === 'opportunity' ? (data as TypedOpportunity)._count?.solutions ?? 0 : 0;
  const evidences = type === 'opportunity' ? (data as TypedOpportunity).evidences : [];

  return (
    <div
    className={`bg-white rounded-[var(--radius)] border-t-4 w-64 transition-all duration-200 group relative ${nodeStyle.border} ${selectedStyle} ${dragOverStyle}`}
    onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isPopoverOpen && <EvidencePopover evidences={evidences} opportunityId={id} onClose={() => setIsPopoverOpen(false)} />}
      
      {data.type !== 'outcome' && (
        <Handle type="target" position={Position.Top} className="!bg-gray-300 !w-3 !h-3" />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {type === 'outcome' && <span className={`w-3 h-3 rounded-full ${outcomeStatusStyles.dot} mt-1 flex-shrink-0`}></span>}
              {nodeStyle.icon}
              {isEditing ? (
                  <input type="text" value={nodeLabel} onChange={(e) => setNodeLabel(e.target.value)} onBlur={handleUpdate} onKeyDown={handleKeyDown} className="text-base font-semibold w-full bg-blue-50 border-blue-300 rounded p-1" autoFocus />
              ) : (
                  <div className="font-semibold text-gray-800 break-words">{label}</div>
              )}
            </div>
            {status && type !== 'outcome' && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${workflowStatusStyles.bg} ${workflowStatusStyles.text}`}>
                {status.replace('_', ' ')}
              </span>
            )}
        </div>
        
        <div className="space-y-2 pt-2 border-t border-gray-100">
          {type === 'outcome' && (data as TypedOutcome).targetMetric && (
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-500">
                <span>Progress</span>
                <span>{(data as TypedOutcome).currentValue || 0} / {(data as TypedOutcome).targetMetric}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(((data as TypedOutcome).currentValue || 0) / (parseFloat((data as TypedOutcome).targetMetric!) || 1)) * 100}%` }}></div>
              </div>
            </div>
          )}

          {type === 'opportunity' && (data as TypedOpportunity).riceScore !== null && (data as TypedOpportunity).riceScore !== undefined && (
            <div className="text-sm text-gray-600">
              RICE Score: <span className="font-bold text-blue-600">{Math.round((data as TypedOpportunity).riceScore! * 10) / 10}</span>
            </div>
          )}

          {type === 'solution' && totalAssumptions > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle size={16} className="text-green-500" />
              <span>{validatedAssumptions} / {totalAssumptions} Assumptions Validated</span>
            </div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-gray-300 !w-3 !h-3" />
      
      {type === 'opportunity' && solutionCount > 0 && (
        <div className="absolute -bottom-3 -left-3 bg-white border-2 border-gray-300 rounded-full h-7 w-7 flex items-center justify-center text-xs font-semibold text-gray-600" title={`${solutionCount} solution(s)`}>
          <FlaskConical size={14} />
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{solutionCount}</span>
        </div>
      )}

      {evidences && evidences.length > 0 && (
        <button onClick={handleEvidenceClick} className="absolute -top-3 -right-3 bg-white border-2 border-gray-300 rounded-full h-7 w-7 flex items-center justify-center text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:border-blue-500" title={`${evidences.length} piece(s) of evidence linked`}>
          <BookText size={14} />
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{evidences.length}</span>
        </button>
      )}
    </div>
  );
}
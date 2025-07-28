'use client';

import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useStore } from '@/lib/store';
import { BookText, Target, Lightbulb, FlaskConical, X } from 'lucide-react'; // Import X icon
import type { Evidence, Interview } from '@prisma/client';

const EvidencePopover = ({ evidences, opportunityId, onClose }: { evidences: (Evidence & { interview: Interview })[], opportunityId: string, onClose: () => void }) => {
  const { updateNodeData } = useStore();
  const linkedEvidenceIds = evidences.map(e => e.id);

  const handleUnlink = (evidenceIdToUnlink: string) => {
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
                  <div key={evidence.id} className={`p-2 rounded-md border-l-4 group relative`}>
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

export default function CustomNode({ id, data, selected }: NodeProps<any>) {
  const { label, type, evidences = [], priorityScore, confidence } = data;
  const [isEditing, setIsEditing] = useState(false);
  const [nodeLabel, setNodeLabel] = useState(label);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false); // <-- Restore state for visual feedback
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
        const ev = JSON.parse(e.dataTransfer.getData('application/json'));
        linkEvidenceToOpportunity(ev.id, id);
    }
  };

  const typeStyles = {
    outcome: { border: 'border-t-blue-500', icon: <Target size={16} className="text-blue-500" /> },
    opportunity: { border: 'border-t-yellow-500', icon: <Lightbulb size={16} className="text-yellow-500" /> },
    solution: { border: 'border-t-green-500', icon: <FlaskConical size={16} className="text-green-500" /> },
  };

  const nodeStyle = typeStyles[type as keyof typeof typeStyles] || { border: 'border-t-gray-400', icon: null };
  const selectedStyle = selected ? 'ring-2 ring-blue-500' : 'shadow-md';
  const dragOverStyle = isDragOver ? 'ring-2 ring-green-500 ring-offset-2' : '';

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
          <div className="flex items-center gap-2 mb-2">
              {nodeStyle.icon}
              {isEditing ? (
                  <input type="text" value={nodeLabel} onChange={(e) => setNodeLabel(e.target.value)} onBlur={handleUpdate} onKeyDown={handleKeyDown} className="text-base font-semibold w-full bg-blue-50 border-blue-300 rounded p-1" autoFocus />
              ) : (
                  <div className="font-semibold text-gray-800 break-words">{label}</div>
              )}
          </div>
          {type === 'opportunity' && (priorityScore || confidence) && (
              <div className="text-xs text-gray-500 flex items-center gap-4 pt-2 border-t border-gray-200">
                  {priorityScore && <div>Priority: <span className="font-medium text-gray-700">{priorityScore}</span></div>}
                  {confidence && <div>Confidence: <span className="font-medium text-gray-700">{confidence}%</span></div>}
              </div>
          )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-gray-300 !w-3 !h-3" />
      
      {type === 'opportunity' && evidences.length > 0 && (
        <button onClick={handleEvidenceClick} className="absolute -top-3 -right-3 bg-white border-2 border-gray-300 rounded-full h-7 w-7 flex items-center justify-center text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:border-blue-500" title={`${evidences.length} piece(s) of evidence linked`}>
          <BookText size={14} />
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{evidences.length}</span>
        </button>
      )}
    </div>
  );
}
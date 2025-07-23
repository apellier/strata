'use client';

import React, { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/lib/store';
import { debounce } from 'lodash';
import SolutionCandidatesManager from './SolutionCandidatesManager';
import EvidenceLinker from './EvidenceLinker';

const RichTextEditor = dynamic(() => import('./RichTextEditor').then(mod => mod.RichTextEditor), { ssr: false, loading: () => <div className="p-4 text-center text-gray-400 border rounded-lg min-h-[200px]">Loading Editor...</div> });

const EditablePill = ({ label, value, onUpdate, placeholder }: { label: string, value: string | number, onUpdate: (newValue: any) => void, placeholder: string }) => {
    const [localValue, setLocalValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);
    const handleBlur = () => {
        setIsEditing(false);
        if (value !== localValue) onUpdate(localValue);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleBlur();
        else if (e.key === 'Escape') {
            setLocalValue(value);
            setIsEditing(false);
        }
    };
    if (isEditing) {
        return (
            <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-500">{label}:</span>
                <input type="number" value={localValue || ''} onChange={(e) => setLocalValue(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className="w-20 p-1 rounded bg-gray-100 border-gray-300 border" autoFocus />
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-500">{label}:</span>
            <button onClick={() => setIsEditing(true)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 font-semibold text-gray-800">{value || 'N/A'}</button>
        </div>
    );
};

export default function OpportunityDetails({ nodeData }: { nodeData: any }) {
    const { updateNodeData } = useStore();
    const debouncedUpdate = useCallback(debounce(updateNodeData, 1000), []);
    const handleFieldUpdate = (field: string, value: any) => {
        let finalValue = value;
        if (field === 'priorityScore') finalValue = parseFloat(value) || null;
        else if (field === 'confidence') finalValue = parseInt(value, 10) || null;
        debouncedUpdate(nodeData.id, 'opportunity', { [field]: finalValue });
    };
    const handleDescriptionChange = (newDescription: any) => {
        debouncedUpdate(nodeData.id, 'opportunity', { description: newDescription });
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-6 p-2 bg-gray-50 rounded-lg">
                <EditablePill label="Priority" value={nodeData.priorityScore} onUpdate={(val) => handleFieldUpdate('priorityScore', val)} placeholder="e.g., 8.5" />
                <EditablePill label="Confidence" value={nodeData.confidence} onUpdate={(val) => handleFieldUpdate('confidence', val)} placeholder="0-100" />
            </div>
            <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Notes & Description</h3>
                <RichTextEditor key={nodeData.id} content={nodeData.description} onChange={handleDescriptionChange} />
            </div>
            <SolutionCandidatesManager opportunity={nodeData} />
            <EvidenceLinker opportunity={nodeData} />
        </div>
    );
}
'use client';

import React, { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/lib/store';
import { debounce, update } from 'lodash';
import SolutionCandidatesManager from './SolutionCandidatesManager';
import EvidenceLinker from './EvidenceLinker';
import { updateNode } from '@/lib/api';
import RiceScoreCalculator from './RiceScoreCalculator';
import { PropertyRow } from './ui';


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
    const handleUpdate = useCallback((data: any) => {
        updateNodeData(nodeData.id, 'opportunity', data);
    }, [nodeData.id, updateNodeData]);
    const handleRiceUpdate = useCallback((riceData: any) => {
        updateNodeData(nodeData.id, 'opportunity', riceData);
    }, [nodeData.id, updateNodeData]);

    const debouncedDescriptionUpdate = useCallback(debounce((newDescription: any) => {
        updateNodeData(nodeData.id, 'opportunity', { description: newDescription });
    }, 1000), [nodeData.id, updateNodeData]);

    
    return (
        <div className="space-y-6">
            {/* --- NEW: Status Dropdown --- */}
            <PropertyRow label="Status">
                <select 
                    value={nodeData.status || 'BACKLOG'} 
                    onChange={(e) => handleUpdate({ status: e.target.value })}
                    className="w-full p-1 bg-gray-50 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition"
                >
                    <option value="BACKLOG">Backlog</option>
                    <option value="DISCOVERY">Discovery</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                    <option value="BLOCKED">Blocked</option>
                </select>
            </PropertyRow>

            <RiceScoreCalculator nodeData={nodeData} onUpdate={handleUpdate} />
            
            <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Notes & Description</h3>
                <RichTextEditor key={nodeData.id} content={nodeData.description} onChange={debouncedDescriptionUpdate} />
            </div>
            <SolutionCandidatesManager opportunity={nodeData} />
            <EvidenceLinker opportunity={nodeData} />
        </div>
    );
}
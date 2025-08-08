'use client';

import React, { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useStore, TypedOutcome } from '@/lib/store';
import type { JSONContent } from '@tiptap/core'


const RichTextEditor = dynamic(() => import('./RichTextEditor').then(mod => mod.RichTextEditor), { ssr: false, loading: () => <div className="p-4 text-center text-gray-400 border rounded-lg min-h-[200px]">Loading Editor...</div> });

const EditablePill = ({ label, value, onUpdate, placeholder, type = 'text', options }: { label: string, value: string | number | null, onUpdate: (newValue: string | number) => void, placeholder: string, type?: string, options?: string[] }) => {
    const [localValue, setLocalValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);
    const handleBlur = () => {
        setIsEditing(false);
        if (value !== localValue && localValue !== null) {
            onUpdate(localValue);
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleBlur();
        else if (e.key === 'Escape') {
            setLocalValue(value);
            setIsEditing(false);
        }
    };
    if (isEditing) {
        if (type === 'select') {
            return (
                 <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-500">{label}:</span>
                    <select value={localValue || ''} onChange={(e) => setLocalValue(e.target.value)} onBlur={handleBlur} className="p-1 rounded bg-gray-100 border-gray-300 border" autoFocus>
                        {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            )
        }
        return (
            <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-500">{label}:</span>
                <input type={type} value={localValue || ''} onChange={(e) => setLocalValue(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={placeholder} className="w-24 p-1 rounded bg-gray-100 border-gray-300 border" autoFocus />
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

export default function OutcomeDetails({ 
    nodeData, 
    onFocusOpportunity, 
    onFocusSolution, 
    onFocusOutcome, 
    onFocusInterview, 
    onFocusNode 
}: { 
    nodeData: TypedOutcome;
    onFocusOpportunity?: (opportunity: any) => void;
    onFocusSolution?: (solution: any) => void;
    onFocusOutcome?: (outcome: any) => void;
    onFocusInterview?: (id: string) => void;
    onFocusNode?: (nodeId: string) => void;
}) {
    const { updateNodeData } = useStore();
    const debouncedUpdate = useCallback(updateNodeData, [updateNodeData]);
    
    const handleMentionClick = useCallback(async (mentionId: string, mentionType: string) => {
        try {
            switch (mentionType) {
                case 'interview':
                    if (onFocusInterview) {
                        onFocusInterview(mentionId);
                    }
                    break;
                case 'outcome':
                    if (onFocusOutcome && onFocusNode) {
                        const response = await fetch(`/api/outcomes/${mentionId}`);
                        if (response.ok) {
                            const outcome = await response.json();
                            onFocusOutcome(outcome);
                            onFocusNode(outcome.id);
                        }
                    }
                    break;
                case 'opportunity':
                    if (onFocusOpportunity && onFocusNode) {
                        const response = await fetch(`/api/opportunities/${mentionId}`);
                        if (response.ok) {
                            const opportunity = await response.json();
                            onFocusOpportunity(opportunity);
                            onFocusNode(opportunity.id);
                        }
                    }
                    break;
                case 'solution':
                    if (onFocusSolution && onFocusNode) {
                        const response = await fetch(`/api/solutions/${mentionId}`);
                        if (response.ok) {
                            const solution = await response.json();
                            onFocusSolution(solution);
                            onFocusNode(solution.id);
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error('Error handling mention click:', error);
        }
    }, [onFocusOpportunity, onFocusSolution, onFocusOutcome, onFocusInterview, onFocusNode]);

    const handleFieldUpdate = (field: keyof TypedOutcome, value: string | number) => {
        let finalValue: string | number | null = value;
        if (field === 'currentValue') finalValue = parseFloat(value as string) || null;
        debouncedUpdate(nodeData.id, 'outcome', { [field]: finalValue });
    };
    const handleDescriptionChange = (newDescription: JSONContent) => {
        debouncedUpdate(nodeData.id, 'outcome', { description: newDescription });
    };
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-6 p-2 bg-gray-50 rounded-lg">
                <EditablePill label="Status" value={nodeData.status} onUpdate={(val) => handleFieldUpdate('status', val)} placeholder="Status" type="select" options={['ON_TRACK', 'AT_RISK', 'ACHIEVED', 'ARCHIVED']} />
                <EditablePill label="Target Metric" value={nodeData.targetMetric} onUpdate={(val) => handleFieldUpdate('targetMetric', val)} placeholder="e.g., Conversion" />
                <EditablePill label="Current Value" value={nodeData.currentValue} onUpdate={(val) => handleFieldUpdate('currentValue', val)} placeholder="e.g., 15" type="number" />
            </div>
            <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Notes & Description</h3>
                <RichTextEditor
                    key={nodeData.id}
                    content={nodeData.description && typeof nodeData.description === 'object' && 'type' in nodeData.description ? nodeData.description as JSONContent : { type: 'doc', content: [{ type: 'paragraph' }] }}
                    onChange={handleDescriptionChange}
                    onMentionClick={handleMentionClick}
                />
            </div>
        </div>
    );
}

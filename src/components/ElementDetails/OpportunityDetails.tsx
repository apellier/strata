// src/components/ElementDetails/OpportunityDetails.tsx
'use client';

import React, { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useStore, TypedOpportunity } from '@/lib/store';
import SolutionCandidatesManager from './SolutionCandidatesManager';
import EvidenceLinker from './EvidenceLinker';
import RiceScoreCalculator from './RiceScoreCalculator';
import { PropertyRow, DebouncedInput } from './ui';
import { WorkflowStatus } from '@prisma/client';
import type { JSONContent } from '@tiptap/core'




const RichTextEditor = dynamic(() => import('./RichTextEditor').then(mod => mod.RichTextEditor), { ssr: false, loading: () => <div className="p-4 text-center text-gray-400 border rounded-lg min-h-[200px]">Loading Editor...</div> });

export default function OpportunityDetails({ 
    nodeData, 
    onFocusOpportunity, 
    onFocusSolution, 
    onFocusOutcome, 
    onFocusInterview, 
    onFocusNode 
}: { 
    nodeData: TypedOpportunity;
    onFocusOpportunity?: (opportunity: any) => void;
    onFocusSolution?: (solution: any) => void;
    onFocusOutcome?: (outcome: any) => void;
    onFocusInterview?: (id: string) => void;
    onFocusNode?: (nodeId: string) => void;
}) {
    const { updateNodeData } = useStore();
    const handleUpdate = useCallback((data: Partial<TypedOpportunity>) => {
        updateNodeData(nodeData.id, 'opportunity', data);
    }, [nodeData.id, updateNodeData]);

    const debouncedDescriptionUpdate = useCallback((newDescription: JSONContent) => {
        updateNodeData(nodeData.id, 'opportunity', { description: newDescription });
    }, [nodeData.id, updateNodeData]);

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


    return (
        <div className="space-y-6">
            <PropertyRow label="Status">
                <select
                    value={nodeData.status || 'BACKLOG'}
                    onChange={(e) => handleUpdate({ status: e.target.value as WorkflowStatus})}
                    className="w-full p-1 bg-gray-50 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition"
                >
                    <option value="BACKLOG">Backlog</option>
                    <option value="DISCOVERY">Discovery</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                    <option value="BLOCKED">Blocked</option>
                </select>
            </PropertyRow>

            {nodeData.status === 'BLOCKED' && (
                <PropertyRow label="Blocker">
                    <DebouncedInput
                        type="textarea"
                        value={nodeData.blockerReason}
                        onChange={(val) => handleUpdate({ blockerReason: val })}
                        placeholder="What's blocking this opportunity?"
                    />
                </PropertyRow>
            )}


            <RiceScoreCalculator nodeData={nodeData} onUpdate={handleUpdate} />

            <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Notes & Description</h3>
                <RichTextEditor
                    key={nodeData.id}
                    content={nodeData.description && typeof nodeData.description === 'object' && 'type' in nodeData.description ? nodeData.description as JSONContent : { type: 'doc', content: [{ type: 'paragraph' }] }}
                    onChange={debouncedDescriptionUpdate}
                    onMentionClick={handleMentionClick}
                />
            </div>
            <SolutionCandidatesManager opportunity={nodeData} />
            <EvidenceLinker opportunity={nodeData} />
        </div>
    );
}
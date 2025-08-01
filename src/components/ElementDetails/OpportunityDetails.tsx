// src/components/ElementDetails/OpportunityDetails.tsx
'use client';

import React, { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useStore, TypedOpportunity } from '@/lib/store';
import { debounce } from 'lodash';
import SolutionCandidatesManager from './SolutionCandidatesManager';
import EvidenceLinker from './EvidenceLinker';
import RiceScoreCalculator from './RiceScoreCalculator';
import { PropertyRow, DebouncedInput } from './ui';
import { WorkflowStatus } from '@prisma/client';
import type { JSONContent } from '@tiptap/core'




const RichTextEditor = dynamic(() => import('./RichTextEditor').then(mod => mod.RichTextEditor), { ssr: false, loading: () => <div className="p-4 text-center text-gray-400 border rounded-lg min-h-[200px]">Loading Editor...</div> });

export default function OpportunityDetails({ nodeData }: { nodeData: TypedOpportunity }) {
    const { updateNodeData } = useStore();
    const handleUpdate = useCallback((data: Partial<TypedOpportunity>) => {
        updateNodeData(nodeData.id, 'opportunity', data);
    }, [nodeData.id, updateNodeData]);

    const debouncedDescriptionUpdate = useCallback((newDescription: JSONContent) => {
        updateNodeData(nodeData.id, 'opportunity', { description: newDescription });
    }, [nodeData.id, updateNodeData]);


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
                />
            </div>
            <SolutionCandidatesManager opportunity={nodeData} />
            <EvidenceLinker opportunity={nodeData} />
        </div>
    );
}
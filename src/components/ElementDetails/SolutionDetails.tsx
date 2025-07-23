'use client';

import React, { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/lib/store';
import { debounce } from 'lodash';
import AssumptionManager from './AssumptionManager';

const RichTextEditor = dynamic(() => import('./RichTextEditor').then(mod => mod.RichTextEditor), { ssr: false, loading: () => <div className="p-4 text-center text-gray-400 border rounded-lg min-h-[200px]">Loading Editor...</div> });

export default function SolutionDetails({ nodeData }: { nodeData: any }) {
    const { updateNodeData } = useStore();
    const debouncedUpdate = useCallback(debounce(updateNodeData, 1000), []);
    const handleDescriptionChange = (newDescription: any) => {
        debouncedUpdate(nodeData.id, 'solution', { description: newDescription });
    };
    return (
        <div className="space-y-6">
            <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Notes & Description</h3>
                <RichTextEditor key={nodeData.id} content={nodeData.description} onChange={handleDescriptionChange} />
            </div>
            <AssumptionManager solution={nodeData} />
        </div>
    );
}

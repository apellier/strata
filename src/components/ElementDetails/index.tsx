'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Maximize, Lightbulb, TestTube2, Target } from 'lucide-react';
import * as api from '@/lib/api';
import { DebouncedInput } from './ui';
import OutcomeDetails from './OutcomeDetails';
import OpportunityDetails from './OpportunityDetails';
import SolutionDetails from './SolutionDetails';
import ExperimentDashboard from './ExperimentDashboard';

export default function ElementDetails({ nodeData, onFocus, isFocusMode }: { nodeData: any, onFocus: (node: any) => void, isFocusMode: boolean }) {
    const { getCanvasData, nodes } = useStore();

    const handleDebouncedUpdate = (field: string, value: any) => {
        useStore.getState().updateNodeData(nodeData.id, nodeData.type, { [field]: value });
    };

    const handleDelete = async () => {
        const confirmationText = nodeData.label;
        const userInput = window.prompt(`To delete this ${nodeData.type}, please type its name: "${confirmationText}"`);
        if (userInput === confirmationText) {
            try {
                await api.deleteNode(nodeData.type, nodeData.id);
                getCanvasData();
            } catch (error) {
                alert(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        } else if (userInput !== null) {
            alert("The name you entered did not match. Deletion cancelled.");
        }
    };

    const renderDetails = () => {
        switch (nodeData.type) {
            case 'outcome': return <OutcomeDetails nodeData={nodeData} />;
            case 'opportunity': return <OpportunityDetails nodeData={nodeData} />;
            case 'solution': return <SolutionDetails nodeData={nodeData} />;
            default: return <p>This node type does not have details.</p>;
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-grow">
                     <div className="flex-shrink-0">
                        {nodeData.type === 'outcome' && <Target className="text-blue-500" />}
                        {nodeData.type === 'opportunity' && <Lightbulb className="text-yellow-500" />}
                        {nodeData.type === 'solution' && <TestTube2 className="text-green-500" />}
                     </div>
                    <DebouncedInput
                        value={nodeData.label}
                        onChange={(val) => handleDebouncedUpdate('name', val)}
                        placeholder="Untitled"
                        className="!text-lg !font-bold !p-0"
                    />
                </div>
                {!isFocusMode && (
                    <button onClick={() => onFocus(nodeData)} className="p-2 rounded-md hover:bg-gray-200 text-gray-500" title="Focus Mode">
                        <Maximize size={16} />
                    </button>
                )}
            </div>
            <div className="border-b my-4"></div>
            {nodeData.type === 'opportunity' && (
                <div className="flex border-b mb-4">
                    <button className="px-4 py-2 text-sm font-semibold border-b-2 border-blue-500 text-blue-600">Details</button>
                    <button className="px-4 py-2 text-sm font-semibold text-gray-500">Experiment Dashboard</button>
                </div>
            )}
            <div className="space-y-1">
                {renderDetails()}
                <div className="border-t pt-4 mt-6">
                    <button onClick={handleDelete} className="w-full btn btn-secondary !text-red-600 !border-red-500 hover:!bg-red-50">
                        Delete {nodeData.type}
                    </button>
                </div>
            </div>
        </div>
    );
}

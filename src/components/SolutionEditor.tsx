'use client';

import React from 'react';
import type { Solution } from '@prisma/client';
import { X } from 'lucide-react';
import ElementDetails from './ElementDetails';
import { TypedSolution } from '@/lib/store'; // Import the correct type

export default function SolutionEditor({ solution, onClose }: { solution: Solution, onClose: () => void }) {
    // Create a correctly typed object for the ElementDetails component
    const nodeDataForDetails: TypedSolution = {
        ...solution,
        type: 'solution',
        label: solution.name,
        // The base Solution type might not have assumptions, so we default to an empty array
        assumptions: (solution as TypedSolution).assumptions || [],
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center animate-fade-in">
            <div className="bg-white w-full h-full md:w-[90vw] md:h-[90vh] md:rounded-lg shadow-2xl flex flex-col">
                <div className="flex-shrink-0 p-2 border-b flex justify-between items-center">
                    <div className="text-sm text-gray-500 pl-2">Focus Mode</div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
                </div>
                <div className="flex-grow overflow-y-auto p-6">
                   <ElementDetails nodeData={nodeDataForDetails} onFocus={() => {}} isFocusMode={true} />
                </div>
            </div>
        </div>
    );
}

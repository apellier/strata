'use client';

import React, { useState, useEffect } from 'react';
import type { Evidence, Interview, Opportunity } from '@prisma/client';
import { useStore } from '@/lib/store';
import * as api from '@/lib/api';

export default function EvidenceLinker({ opportunity }: { opportunity: Opportunity & { evidences: (Evidence & { interview: Interview })[] } }) {
    const { updateNodeData } = useStore();
    const [allEvidence, setAllEvidence] = useState<(Evidence & { interview: Interview })[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Fetch all evidence when the user clicks "+ Add"
        if (isAdding) {
            api.getAllEvidence().then(setAllEvidence);
        }
    }, [isAdding]);

    const linkedEvidenceIds = opportunity.evidences?.map((e: Evidence) => e.id) || [];

    // Filter evidence based on the search term
    const filteredEvidence = allEvidence.filter(e =>
        e.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLink = (evidenceId: string) => {
        if (linkedEvidenceIds.includes(evidenceId)) return; // Prevent linking duplicates
        const newEvidenceIds = [...linkedEvidenceIds, evidenceId];
        updateNodeData(opportunity.id, 'opportunity', { evidenceIds: newEvidenceIds });
    };

    const handleUnlink = (evidenceId: string) => {
        const newEvidenceIds = linkedEvidenceIds.filter((id: string) => id !== evidenceId);
        updateNodeData(opportunity.id, 'opportunity', { evidenceIds: newEvidenceIds });
    };

    const evidenceColors: { [key: string]: string } = {
        VERBATIM: 'bg-blue-100 border-blue-300',
        PAIN_POINT: 'bg-red-100 border-red-300',
        DESIRE: 'bg-green-100 border-green-300',
        INSIGHT: 'bg-purple-100 border-purple-300',
    };

    return (
        <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-gray-600 font-semibold">Evidence</h4>
                <button onClick={() => setIsAdding(!isAdding)} className="btn btn-secondary !py-1 !px-2 !text-sm">{isAdding ? 'Cancel' : '+ Add'}</button>
            </div>

            {isAdding && (
                <div className="p-2 bg-gray-50 rounded-md mb-4 border">
                    <input
                        type="text"
                        placeholder="Search all evidence..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 mb-2 border border-gray-300 rounded-md text-sm"
                    />
                    <div className="max-h-48 overflow-y-auto">
                        {filteredEvidence.length > 0 ? filteredEvidence.map(e => (
                            <div 
                                key={e.id} 
                                onClick={() => handleLink(e.id)} 
                                className={`p-2 my-1 border-l-4 rounded-md cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all ${evidenceColors[e.type]} ${linkedEvidenceIds.includes(e.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <p className="text-sm italic">&quot;{e.content}&quot;</p>
                                <p className="text-xs text-gray-500 mt-1">From: {e.interview.interviewee}</p>
                            </div>
                        )) : <p className="text-sm text-gray-400 text-center p-4">No matching evidence found.</p>}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {(opportunity.evidences || []).map((ev) => (
                    <div key={ev.id} className={`p-2 rounded-md border-l-4 group relative ${evidenceColors[ev.type]}`}>
                         <p className="text-sm italic">&quot;{ev.content}&quot;</p>
                         <button onClick={() => handleUnlink(ev.id)} className="absolute top-1 right-1 text-xs text-red-500 opacity-0 group-hover:opacity-100 hover:underline">Unlink</button>
                    </div>
                ))}
                 {linkedEvidenceIds.length === 0 && !isAdding && <p className="text-xs text-gray-400 text-center py-4">No evidence linked yet. Click &quot;+ Add&quot; to link one.</p>}
            </div>
        </div>
    );
};
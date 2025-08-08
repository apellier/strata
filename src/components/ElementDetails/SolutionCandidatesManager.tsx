'use client';

import React, { useState } from 'react';
import { Prisma } from '@prisma/client';
import { useStore, TypedOpportunity } from '@/lib/store';
import { ChevronDown, ChevronRight, ArrowUpRight, Trash2 } from 'lucide-react';

// Define a specific type for a Solution Candidate object
interface SolutionCandidate {
    id: string;
    title: string;
    quickAssumptions: string[];
}

const SolutionCandidateCard = ({ candidate, onUpdate, onRemove, onPromote }: { candidate: SolutionCandidate, onUpdate: (data: SolutionCandidate) => void, onRemove: () => void, onPromote: () => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newAssumption, setNewAssumption] = useState('');

    const handleAddAssumption = () => {
        if (newAssumption.trim()) {
            const updatedAssumptions = [...(candidate.quickAssumptions || []), newAssumption.trim()];
            onUpdate({ ...candidate, quickAssumptions: updatedAssumptions });
            setNewAssumption('');
        }
    };

    const handleRemoveAssumption = (indexToRemove: number) => {
        const updatedAssumptions = (candidate.quickAssumptions || []).filter((_: string, i: number) => i !== indexToRemove);
        onUpdate({ ...candidate, quickAssumptions: updatedAssumptions });
    };

    return (
        <div className="bg-white p-2 border border-gray-200 rounded group">
            <div className="flex items-center justify-between">
                <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center text-left flex-1 p-1">
                    {isExpanded ? <ChevronDown size={16} className="mr-2 flex-shrink-0" /> : <ChevronRight size={16} className="mr-2 flex-shrink-0" />}
                    <span className="font-medium text-gray-800">{candidate.title}</span>
                </button>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={onPromote} 
                        title="Promote to Solution" 
                        className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-medium transition-colors"
                    >
                        <ArrowUpRight size={12} />
                        <span>Promote</span>
                    </button>
                    <button 
                        onClick={onRemove} 
                        title="Remove Candidate" 
                        className="p-1 text-red-500 hover:text-red-600 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="pl-8 pt-2 space-y-2">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Assumptions</h5>
                    {(candidate.quickAssumptions || []).length > 0 ? (
                         (candidate.quickAssumptions || []).map((ass: string, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-1.5 rounded">
                                <span>{ass}</span>
                                <button onClick={() => handleRemoveAssumption(index)} className="text-red-400 hover:text-red-600">×</button>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-500 italic">No assumptions added yet.</p>
                    )}

                    <div className="flex pt-1">
                        <input
                            type="text"
                            value={newAssumption}
                            onChange={(e) => setNewAssumption(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddAssumption()}
                            placeholder="Add a risky assumption..."
                            className="w-full p-1 border-gray-300 border rounded-l-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button onClick={handleAddAssumption} className="bg-gray-200 p-1 px-3 rounded-r-md font-bold hover:bg-gray-300">+</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function SolutionCandidatesManager({ opportunity }: { opportunity: TypedOpportunity }) {
    const { updateNodeData, promoteIdeaToSolution } = useStore();
    const [newCandidateTitle, setNewCandidateTitle] = useState('');
    
    const candidates: SolutionCandidate[] = Array.isArray(opportunity?.solutionCandidates)
        ? (opportunity.solutionCandidates as unknown as SolutionCandidate[])
        : [];

        const handleUpdateCandidates = (updatedCandidates: SolutionCandidate[]) => {
            updateNodeData(opportunity.id, 'opportunity', { solutionCandidates: updatedCandidates as unknown as Prisma.JsonValue });
        };
    

    const handleAddCandidate = () => {
        if (newCandidateTitle.trim()) {
            const newCandidate: SolutionCandidate = { id: `cand_${new Date().getTime()}`, title: newCandidateTitle.trim(), quickAssumptions: [] };
            handleUpdateCandidates([...candidates, newCandidate]);
            setNewCandidateTitle('');
        }
    };

    const handleUpdateCandidate = (index: number, data: SolutionCandidate) => {
        const newCandidates = [...candidates];
        newCandidates[index] = data;
        handleUpdateCandidates(newCandidates);
    };

    const handleRemoveCandidate = (index: number) => {
        handleUpdateCandidates(candidates.filter((_, i) => i !== index));
    };

    const handlePromote = async (candidate: SolutionCandidate, index: number) => {
        const message = `Promote "${candidate.title}" to the canvas?\n\nThis will:\n• Add it as a solution node on the canvas\n• Include any assumptions you've listed\n• Remove it from the candidates list\n\nIn real discovery, you'd run experiments first to validate this idea.`;
        
        if (window.confirm(message)) {
            await promoteIdeaToSolution(candidate, opportunity);
            handleRemoveCandidate(index);
        }
    };

    return (
        <div className="border-t pt-4 mt-6">
            <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Solution Ideas</h3>
                <p className="text-xs text-gray-600">Brainstorm potential solutions, then promote the best ones to test</p>
            </div>
            <div className="space-y-2 p-2 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                    {candidates.map((cand, index) => (
                        <SolutionCandidateCard
                            key={cand.id || index}
                            candidate={cand}
                            onUpdate={(data) => handleUpdateCandidate(index, data)}
                            onRemove={() => handleRemoveCandidate(index)}
                            onPromote={() => handlePromote(cand, index)}
                        />
                    ))}
                </div>
                <div className="flex pt-2">
                    <input
                        type="text"
                        value={newCandidateTitle}
                        onChange={(e) => setNewCandidateTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCandidate()}
                        placeholder="Type a new idea and press Enter..."
                        className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button onClick={handleAddCandidate} className="bg-blue-500 text-white p-2 px-4 rounded-r-md font-bold hover:bg-blue-600">+</button>
                </div>
            </div>
        </div>
    );
};
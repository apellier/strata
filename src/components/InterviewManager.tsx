'use client';

import React, { useState, useEffect } from 'react';
import type { Interview, Evidence } from '@prisma/client';
import { ChevronDown, ChevronRight, Inbox, SquarePen, Trash2, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const EvidenceCard = ({ evidence }: { evidence: Evidence }) => {
    const evidenceColors: { [key: string]: string } = {
        VERBATIM: 'border-blue-400 bg-blue-50',
        PAIN_POINT: 'border-red-400 bg-red-50',
        DESIRE: 'border-green-400 bg-green-50',
        INSIGHT: 'border-purple-400 bg-purple-50',
    };
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('application/json', JSON.stringify(evidence));
        e.dataTransfer.effectAllowed = 'move';
    };
    return (
        <div draggable onDragStart={handleDragStart} className={`p-2 rounded-md border-l-4 shadow-sm cursor-grab active:cursor-grabbing ${evidenceColors[evidence.type]}`}>
            <p className="italic text-sm text-gray-700">"{evidence.content}"</p>
        </div>
    );
};

const InterviewItem = ({ interview, isExpanded, onToggle, onFocus, onDelete }: { interview: Interview & { evidences: Evidence[] }, isExpanded: boolean, onToggle: () => void, onFocus: () => void, onDelete: () => void }) => {
    return (
        <div className="border-b border-[var(--border)]">
            <div className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-100 group">
                <button onClick={onToggle} className="flex-1 flex items-center text-left">
                    {isExpanded ? <ChevronDown size={18} className="mr-2" /> : <ChevronRight size={18} className="mr-2" />}
                    <div className="flex-1">
                        <div className="font-semibold">{interview.interviewee}</div>
                        <div className="text-xs text-gray-500">{formatDate(interview.date)}</div>
                    </div>
                </button>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onFocus} title="Open in Editor" className="p-1 hover:text-blue-600"><SquarePen size={16} /></button>
                    <button onClick={onDelete} title="Delete Interview" className="p-1 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
            </div>
            {isExpanded && (
                <div className="p-3 bg-white space-y-2">
                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-1">Evidence</h4>
                    {interview.evidences.length > 0 ? (
                        interview.evidences.map(evidence => <EvidenceCard key={evidence.id} evidence={evidence} />)
                    ) : (
                        <p className="text-xs text-gray-500 italic text-center py-2">No evidence created yet. Open the editor to start highlighting notes.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default function InterviewManager({ interviews, onFocusInterview, onNewInterview, onDeleteInterview }: { interviews: (Interview & { evidences: Evidence[] })[], onFocusInterview: (id: string) => void, onNewInterview: () => void, onDeleteInterview: (id: string) => void }) {
    const [expandedInterviewId, setExpandedInterviewId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const filteredInterviews = (interviews || []).filter(interview => interview.interviewee.toLowerCase().includes(searchTerm.toLowerCase()));
    useEffect(() => {
        if (!expandedInterviewId && filteredInterviews.length > 0) {
            setExpandedInterviewId(filteredInterviews[0].id);
        }
    }, [filteredInterviews, expandedInterviewId]);
    const handleToggle = (id: string) => {
        setExpandedInterviewId(currentId => (currentId === id ? null : id));
    };
    return (
        <div className="h-full bg-[var(--background)] flex flex-col">
            <div className="p-4 border-b border-[var(--border)] space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800"><Inbox size={20} />Research Hub</h2>
                    <button onClick={onNewInterview} className="btn btn-primary !py-1 !px-3 !text-sm">New Interview</button>
                </div>
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)] pointer-events-none" />
                    <input type="text" placeholder="Filter by interviewee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[var(--background-alt)] border border-[var(--border)] rounded-md p-2 pl-10 text-sm focus:bg-white focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-blue-200" />
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {filteredInterviews.length > 0 ? (
                    filteredInterviews.map(interview => (
                        <InterviewItem key={interview.id} interview={interview} isExpanded={expandedInterviewId === interview.id} onToggle={() => handleToggle(interview.id)} onFocus={() => onFocusInterview(interview.id)} onDelete={() => onDeleteInterview(interview.id)} />
                    ))
                ) : (
                    <p className="p-4 text-sm text-gray-500">No interviews match your search.</p>
                )}
            </div>
        </div>
    );
}
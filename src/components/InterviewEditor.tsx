'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Interview, Evidence } from '@prisma/client';
import { X } from 'lucide-react';
import { debounce } from 'lodash';

type EvidenceType = 'VERBATIM' | 'PAIN_POINT' | 'DESIRE' | 'INSIGHT';

// A pop-up menu that appears when you highlight text
const ContextualMenu = ({ top, left, onSelect }: { top: number, left: number, onSelect: (type: EvidenceType) => void }) => {
    const evidenceTypes: { type: EvidenceType, label: string, color: string }[] = [
        { type: 'PAIN_POINT', label: 'Pain Point', color: 'bg-red-500' },
        { type: 'DESIRE', label: 'Desire', color: 'bg-green-500' },
        { type: 'VERBATIM', label: 'Verbatim', color: 'bg-blue-500' },
        { type: 'INSIGHT', label: 'Insight', color: 'bg-purple-500' },
    ];
    return (
        <div className="absolute z-50 bg-white rounded-lg shadow-lg border flex p-1 space-x-1" style={{ top, left }}>
            {evidenceTypes.map(({ type, label, color }) => (
                <button key={type} onClick={() => onSelect(type)} title={label} className={`w-6 h-6 rounded-full ${color} hover:ring-2 hover:ring-offset-1 ring-black`}></button>
            ))}
        </div>
    );
};

// The main workspace for editing notes and viewing evidence
const InterviewWorkspace = ({
    interview,
    onUpdate,
    onAddEvidence,
    onDeleteEvidence
}: {
    interview: Interview & { evidences: Evidence[] },
    onUpdate: (id: string, data: Partial<Interview>) => void,
    onAddEvidence: (type: EvidenceType, content: string, updatedNotes: string) => void,
    onDeleteEvidence: (id: string) => void
}) => {
    const [interviewee, setInterviewee] = useState(interview.interviewee);
    const [menu, setMenu] = useState<{ top: number, left: number, content: string, range: Range } | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInterviewee(interview.interviewee);
    }, [interview.interviewee]);

    // Set the initial content of the editor when the interview changes
    useEffect(() => {
        if (editorRef.current) {
            // The notes are stored as a JSON object, so we access the 'content' property
            editorRef.current.innerHTML = (interview.notes as { content: string })?.content || '';
        }
    }, [interview.id, interview.notes]);

    // Debounce the update function to prevent excessive API calls while typing
    const debouncedUpdate = useCallback(debounce(onUpdate, 1200), [onUpdate]);

    const handleIntervieweeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setInterviewee(newName);
        debouncedUpdate(interview.id, { interviewee: newName });
    };

    const handleNotesInput = () => {
        if (editorRef.current) {
            debouncedUpdate(interview.id, { notes: { content: editorRef.current.innerHTML } });
        }
    };

    // When the user clicks away, save immediately
    const handleNotesBlur = () => {
        if (editorRef.current) {
            debouncedUpdate.cancel(); // Cancel any pending debounced call
            onUpdate(interview.id, { notes: { content: editorRef.current.innerHTML } });
        }
    };

    // This handler detects when text is selected and shows the contextual menu
    const handleMouseUp = () => {
        setTimeout(() => {
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
                const range = selection.getRangeAt(0);
                if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
                    const rect = range.getBoundingClientRect();
                    setMenu({
                        top: rect.top - 40, // Position the menu above the selection
                        left: rect.left,
                        content: selection.toString().trim(),
                        range: range,
                    });
                }
            } else {
                setMenu(null);
            }
        }, 10);
    };

    const handleCreateEvidence = (type: EvidenceType) => {
        if (menu && editorRef.current) {
            const newMark = document.createElement('mark');
            newMark.className = {
                PAIN_POINT: 'bg-red-200/70',
                DESIRE: 'bg-green-200/70',
                VERBATIM: 'bg-blue-200/70',
                INSIGHT: 'bg-purple-200/70',
            }[type];

            // Wrap the selected text in the new <mark> tag
            menu.range.surroundContents(newMark);

            const newNotesContent = editorRef.current.innerHTML;
            window.getSelection()?.removeAllRanges(); // Clear the selection
            setMenu(null); // Close the menu
            onAddEvidence(type, menu.content, newNotesContent);
        }
    };

    const evidenceColors: { [key: string]: string } = {
        VERBATIM: 'border-blue-400',
        PAIN_POINT: 'border-red-400',
        DESIRE: 'border-green-400',
        INSIGHT: 'border-purple-400',
    };

    return (
        <div className="relative grid grid-cols-3 h-full bg-white" onMouseUp={handleMouseUp}>
            {menu && <ContextualMenu top={menu.top} left={menu.left} onSelect={handleCreateEvidence} />}
            <div className="col-span-2 p-8 overflow-y-auto">
                <input
                    value={interviewee}
                    onChange={handleIntervieweeChange}
                    onBlur={() => onUpdate(interview.id, { interviewee })}
                    className="text-3xl font-bold w-full p-1 -ml-1 mb-4 rounded hover:bg-gray-100 focus:bg-gray-100 outline-none"
                />
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleNotesInput}
                    onBlur={handleNotesBlur}
                    dir="ltr"
                    className="prose max-w-none text-lg leading-relaxed h-full outline-none"
                />
            </div>
            <div className="col-span-1 border-l bg-gray-50 p-4 overflow-y-auto space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Evidence</h3>
                {interview.evidences.length > 0 ? interview.evidences.map(evidence => (
                    <div key={evidence.id} className={`p-3 bg-white rounded-lg border-l-4 shadow-sm group relative ${evidenceColors[evidence.type]}`}>
                        <p className="italic text-gray-700">"{evidence.content}"</p>
                        <button onClick={() => onDeleteEvidence(evidence.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 text-lg font-bold">×</button>
                    </div>
                )) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">Highlight text in your notes to create evidence.</p>
                )}
            </div>
        </div>
    );
};

// Define a clear interface for the component's props
interface InterviewEditorProps {
    interview: Interview & { evidences: Evidence[] };
    onClose: () => void;
    onUpdate: (id: string, data: Partial<Interview>) => void;
    onAddEvidence: (type: EvidenceType, content: string, updatedNotes: string) => void;
    onDeleteEvidence: (id: string) => void;
}

// The full-screen modal component that wraps the workspace
export default function InterviewEditor({
    interview,
    onClose,
    onUpdate,
    onAddEvidence,
    onDeleteEvidence
}: InterviewEditorProps) {
    return (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center animate-fade-in">
            <div className="bg-white w-full h-full md:w-[90vw] md:h-[90vh] md:rounded-lg shadow-2xl flex flex-col">
                <div className="flex-shrink-0 p-2 border-b flex justify-end">
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-grow overflow-hidden">
                    <InterviewWorkspace
                        key={interview.id} // Use key to force re-render when interview changes
                        interview={interview}
                        onUpdate={onUpdate}
                        onAddEvidence={onAddEvidence}
                        onDeleteEvidence={onDeleteEvidence}
                    />
                </div>
            </div>
        </div>
    );
}
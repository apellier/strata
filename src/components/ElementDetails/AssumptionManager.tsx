// src/components/ElementDetails/AssumptionManager.tsx
'use client';

import React, { useState } from 'react';
import type { Assumption, Experiment } from '@prisma/client';
import { useStore, TypedSolution } from '@/lib/store';
import * as api from '@/lib/api';
import { DebouncedInput, PropertyRow } from './ui';

const ExperimentTracker = ({ experiment }: { experiment: Experiment }) => {
    const { getCanvasData } = useStore();
    const handleUpdate = async (data: Partial<Experiment>) => {
        await api.updateExperiment(experiment.id, data);
        getCanvasData();
    };
    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this experiment?")) {
            await api.deleteExperiment(experiment.id);
            getCanvasData();
        }
    };
    return (
        <div className="p-3 bg-white border-2 border-gray-200 rounded-lg space-y-3 mt-2">
            <div className="flex justify-between items-center">
                <h5 className="font-bold text-sm">Experiment</h5>
                <button onClick={handleDelete} className="text-xs text-red-500 hover:underline">Delete Test</button>
            </div>
            <DebouncedInput value={experiment.hypothesis} onChange={val => handleUpdate({ hypothesis: val })} type="textarea" placeholder="Hypothesis..." />
            <PropertyRow label="Test Method"><DebouncedInput value={experiment.testMethod} onChange={val => handleUpdate({ testMethod: val })} placeholder="e.g., A/B Test" /></PropertyRow>
            <PropertyRow label="Success Criteria"><DebouncedInput value={experiment.successCriteria} onChange={val => handleUpdate({ successCriteria: val })} type="textarea" placeholder="e.g., 15% sign-up rate." /></PropertyRow>
            <div className="border-t pt-3 mt-3">
                <h6 className="font-semibold text-xs text-gray-600 mb-2">After the Test</h6>
                <PropertyRow label="Results"><DebouncedInput value={experiment.results} onChange={val => handleUpdate({ results: val })} type="textarea" placeholder="What happened?" /></PropertyRow>
                <PropertyRow label="Learnings"><DebouncedInput value={experiment.learnings} onChange={val => handleUpdate({ learnings: val })} type="textarea" placeholder="What did we learn?" /></PropertyRow>
            </div>
        </div>
    );
};

const AssumptionMatrix = ({ assumptions }: { assumptions: Assumption[] }) => {
    if (!Array.isArray(assumptions)) return null;
    return (
        <div className="relative w-full aspect-square bg-gray-50 border-2 border-gray-300 grid grid-cols-2 grid-rows-2">
            <div className="absolute top-1 left-2 text-xs text-gray-400">High Importance</div>
            <div className="absolute bottom-1 left-2 text-xs text-gray-400">Low Importance</div>
            <div className="absolute bottom-1 right-2 text-xs text-gray-400 text-right">Strong Evidence</div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-gray-400">Weak Evidence</div>
            <div className="absolute w-full h-[2px] bg-gray-300 top-1/2 -translate-y-1/2"></div>
            <div className="absolute h-full w-[2px] bg-gray-300 left-1/2 -translate-x-1/2"></div>
            <div className="col-start-1 row-start-1 bg-red-500/10" title="Unknown & Important"></div>
            {assumptions.map(a => (
                <div key={a.id} className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md cursor-pointer group" style={{ bottom: `calc(${(a.importance / 10) * 100}% - 6px)`, left: `calc(${(a.evidence / 10) * 100}% - 6px)` }} title={a.description}>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{a.description}</div>
                </div>
            ))}
        </div>
    );
};

export default function AssumptionManager({ solution }: { solution: TypedSolution }) {
    const { getCanvasData } = useStore();
    const [view, setView] = useState<'list' | 'matrix'>('list');
    const assumptions = solution.assumptions || [];
    const handleApiCall = (apiCall: Promise<unknown>) => {
        apiCall
            .then(() => {
                getCanvasData();
            })
            .catch((error) => {
                const message = error instanceof Error ? error.message : "An unknown error occurred.";
                alert(`An error occurred: ${message}`);
            });
    };

    return (
        <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-gray-600 font-semibold">Assumptions</h4>
                <div className="flex items-center space-x-2">
                    <div className="flex rounded-md border-2 p-0.5 bg-gray-200">
                        <button onClick={() => setView('list')} className={`px-2 py-0.5 text-sm rounded ${view === 'list' ? 'bg-white shadow' : 'hover:bg-gray-100'}`}>List</button>
                        <button onClick={() => setView('matrix')} className={`px-2 py-0.5 text-sm rounded ${view === 'matrix' ? 'bg-white shadow' : 'hover:bg-gray-100'}`}>Matrix</button>
                    </div>
                    <button onClick={() => handleApiCall(api.addAssumption({ description: 'New Assumption', solutionId: solution.id }))} className="btn btn-secondary !py-1 !px-2 !text-sm">+</button>
                </div>
            </div>
            {view === 'list' ? (
                <div className="space-y-3">
                    {assumptions.map((a) => (
                        <div key={a.id} className="p-3 bg-gray-100 rounded-lg space-y-2 group">
                            <DebouncedInput value={a.description} onChange={val => handleApiCall(api.updateAssumption(a.id, { description: val }))} type="textarea" />
                            <div className="flex items-center space-x-4">
                            <select value={a.type} onChange={e => handleApiCall(api.updateAssumption(a.id, { type: e.target.value as Assumption['type'] }))} className="text-xs p-1 rounded border-gray-300 bg-white">
                                    <option>DESIRABILITY</option><option>VIABILITY</option><option>FEASIBILITY</option><option>USABILITY</option><option>ETHICAL</option>
                                </select>
                                <div className="flex-grow" />
                                <label className="text-xs flex items-center gap-1">Imp: <DebouncedInput type="number" value={a.importance} onChange={(val: string) => handleApiCall(api.updateAssumption(a.id, { importance: parseInt(val, 10) }))} className="!w-12 !p-1" /></label>
                                <label className="text-xs flex items-center gap-1">Evi: <DebouncedInput type="number" value={a.evidence} onChange={(val: string) => handleApiCall(api.updateAssumption(a.id, { evidence: parseInt(val, 10) }))} className="!w-12 !p-1" /></label>
                                <button onClick={() => handleApiCall(api.deleteAssumption(a.id))} className="text-red-500 opacity-0 group-hover:opacity-100">×</button>
                            </div>

                            <div className="pt-2 border-t border-gray-200">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!a.isValidated}
                                        onChange={(e) => handleApiCall(api.updateAssumption(a.id, { isValidated: e.target.checked }))}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Is this assumption validated?
                                </label>
                            </div>

                            <div className="pt-2 space-y-2">
                                {(a.experiments || []).map(exp => <ExperimentTracker key={exp.id} experiment={exp} />)}
                                <button onClick={() => handleApiCall(api.addExperiment({ hypothesis: 'We believe that...', assumptionId: a.id }))} className="btn btn-secondary !text-xs !py-1 !px-2 w-full mt-2">+ Design Test for this Assumption</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <AssumptionMatrix assumptions={assumptions} />
            )}
        </div>
    );
};
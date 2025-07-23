'use client';

import React from 'react';
import type { Opportunity, Solution, Assumption, Experiment } from '@prisma/client';

export default function ExperimentDashboard({ opportunity }: { opportunity: Opportunity & { solutions: (Solution & { assumptions: (Assumption & { experiments: Experiment[] })[] })[] } }) {
    const allExperiments = opportunity.solutions?.flatMap(sol => 
        sol.assumptions?.flatMap(ass => 
            ass.experiments?.map(exp => ({ ...exp, solutionName: sol.name }))
        )
    ) || [];

    if (allExperiments.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg">
                <p className="font-semibold">No Experiments Found</p>
                <p className="mt-1">
                    To see experiments here, create a Solution, add an Assumption, and then design an Experiment for it.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 p-1">
            {allExperiments.map(exp => (
                <div key={exp.id} className="p-3 bg-gray-50 rounded-lg border">
                    <p className="font-semibold text-sm">{exp.hypothesis}</p>
                    <div className="text-xs text-gray-500 mt-1">
                        <span>For Solution: <span className="font-medium text-gray-700">{exp.solutionName}</span></span>
                    </div>
                    {exp.learnings && (
                        <div className="mt-2 pt-2 border-t text-sm">
                            <span className="font-semibold">Learnings: </span>{exp.learnings}
                        </div>
                    )}
                     {!exp.learnings && !exp.results && (
                        <div className="mt-2 pt-2 border-t text-xs text-center text-gray-400 italic">
                            Experiment in progress...
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Opportunity, Outcome } from '@prisma/client';
import { ArrowUpDown } from 'lucide-react';
import { debounce } from 'lodash';

type OpportunityWithDetails = Opportunity & {
    evidenceCount: number;
    outcomeName: string;
};

const SortableHeader = ({ children, column, sortConfig, onSort }: { children: React.ReactNode, column: string, sortConfig: any, onSort: any }) => {
    const isSorted = sortConfig.key === column;
    const direction = isSorted ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : '';
    return (
        <th className="p-3 text-left">
            <button onClick={() => onSort(column)} className="flex items-center gap-2 font-semibold text-gray-600 hover:text-gray-900">
                {children} <ArrowUpDown size={14} className="text-gray-400" /> <span className="text-blue-500">{direction}</span>
            </button>
        </th>
    );
};

const EditableCell = ({ value, onUpdate }: { value: number | null, onUpdate: (newValue: number) => void }) => {
    const [localValue, setLocalValue] = useState(value || '');
    const debouncedUpdate = useCallback(debounce(onUpdate, 800), [onUpdate]);
    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
        debouncedUpdate(parseFloat(e.target.value));
    };
    return (
        <input
            type="number"
            value={localValue}
            onChange={handleChange}
            className="w-20 text-center p-1 rounded bg-transparent hover:bg-gray-100 hover:border-gray-300 border border-transparent"
        />
    );
};

export default function OpportunityListView({ onFocusNode, viewMode }: { onFocusNode: (nodeId: string) => void, viewMode: 'canvas' | 'list' }) {
    const [opportunities, setOpportunities] = useState<OpportunityWithDetails[]>([]);
    const [outcomes, setOutcomes] = useState<Outcome[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ key: 'priorityScore', direction: 'descending' });
    const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
    const [error, setError] = useState<string | null>(null);
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [oppRes, outRes] = await Promise.all([
                fetch('/api/opportunities/list'),
                fetch('/api/outcomes')
            ]);
            const oppData = await oppRes.json();
            const outData = await outRes.json();
            setOpportunities(oppData);
            setOutcomes(outData);
        } catch (error) {
            console.error("Failed to fetch data for list view:", error);
            setError("Could not load opportunities. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Refetch data whenever this view becomes active
        if (viewMode === 'list') {
            fetchData();
        }
    }, [viewMode]);

    const handleSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleInlineUpdate = async (id: string, field: 'priorityScore' | 'confidence', value: number) => {
        setOpportunities(prev => prev.map(opp => opp.id === id ? { ...opp, [field]: value } : opp));
        await fetch('/api/opportunities/inline-update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, field, value }),
        });
    };

    const sortedAndFilteredOpportunities = useMemo(() => {
        let items = [...opportunities];
        if (outcomeFilter !== 'all') {
            items = items.filter(opp => opp.outcomeId === outcomeFilter);
        }
        items.sort((a, b) => {
            const aValue = (a as any)[sortConfig.key] ?? -Infinity;
            const bValue = (b as any)[sortConfig.key] ?? -Infinity;
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return items;
    }, [opportunities, sortConfig, outcomeFilter]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading opportunities...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-6 h-full flex flex-col bg-white">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">All Opportunities</h2>
                <div className="flex items-center gap-2">
                    <label htmlFor="outcomeFilter" className="text-sm font-medium text-gray-600">Filter by Outcome:</label>
                    <select id="outcomeFilter" value={outcomeFilter} onChange={e => setOutcomeFilter(e.target.value)} className="p-2 border border-[var(--border)] rounded-md text-sm bg-white hover:border-[var(--border-hover)] focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-blue-200">
                        <option value="all">All Outcomes</option>
                        {outcomes.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto border rounded-lg">
                <table className="w-full text-sm table-fixed"> {/* Use table-fixed for better column control */}
                    <thead className="bg-[var(--background-alt)]">
                        <tr className="border-b border-[var(--border)]">
                            <th className="w-2/5 p-3 text-left"><SortableHeader column="name" sortConfig={sortConfig} onSort={handleSort}>Name</SortableHeader></th>
                            <th className="w-1/6 p-3 text-left"><SortableHeader column="priorityScore" sortConfig={sortConfig} onSort={handleSort}>Priority</SortableHeader></th>
                            <th className="w-1/6 p-3 text-left"><SortableHeader column="confidence" sortConfig={sortConfig} onSort={handleSort}>Confidence</SortableHeader></th>
                            <th className="w-1/6 p-3 text-left"><SortableHeader column="evidenceCount" sortConfig={sortConfig} onSort={handleSort}>Evidence</SortableHeader></th>
                            <th className="w-1/5 p-3 text-left"><SortableHeader column="outcomeName" sortConfig={sortConfig} onSort={handleSort}>Outcome</SortableHeader></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {sortedAndFilteredOpportunities.map(opp => (
                            <tr key={opp.id} className="hover:bg-gray-50">
                                <td className="p-3 font-medium truncate"> {/* Add truncate for long names */}
                                    <button onClick={() => onFocusNode(opp.id)} className="text-blue-600 hover:underline text-left">{opp.name}</button>
                                </td>
                                <td className="p-1 text-center"><EditableCell value={opp.priorityScore} onUpdate={(val) => handleInlineUpdate(opp.id, 'priorityScore', val)} /></td>
                                <td className="p-1 text-center"><EditableCell value={opp.confidence} onUpdate={(val) => handleInlineUpdate(opp.id, 'confidence', val)} /></td>
                                <td className="p-3 text-center text-gray-600">{opp.evidenceCount}</td>
                                <td className="p-3 text-gray-600 truncate">{opp.outcomeName}</td> {/* Add truncate here as well */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
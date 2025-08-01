// src/components/OpportunityListView.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Opportunity, Outcome } from '@prisma/client';
import { ArrowUpDown } from 'lucide-react';

type OpportunityWithDetails = Opportunity & {
    evidenceCount: number;
    outcomeName: string;
    riceScore?: number | null;
};

const SortableHeader = ({ children, column, sortConfig, onSort }: { children: React.ReactNode, column: string, sortConfig: { key: string; direction: string; }, onSort: (key: string) => void }) => {
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

export default function OpportunityListView({ onFocusNode, viewMode }: { onFocusNode: (nodeId: string) => void, viewMode: 'canvas' | 'list' }) {
    const [opportunities, setOpportunities] = useState<OpportunityWithDetails[]>([]);
    const [outcomes, setOutcomes] = useState<Outcome[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ key: 'riceScore', direction: 'descending' });
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
        } catch (err) {
            console.error("Failed to fetch data for list view:", err);
            setError("Could not load opportunities. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    const sortedAndFilteredOpportunities = useMemo(() => {
        let items = [...opportunities];
        if (outcomeFilter !== 'all') {
            items = items.filter(opp => opp.outcomeId === outcomeFilter);
        }
    
        // Corrected sort logic without the extra nesting
        items.sort((a, b) => {
            const aValue = a[sortConfig.key as keyof OpportunityWithDetails] ?? -Infinity;
            const bValue = b[sortConfig.key as keyof OpportunityWithDetails] ?? -Infinity;
            
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
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
                <table className="w-full text-sm table-fixed">
                    <thead className="bg-[var(--background-alt)]">
                        <tr className="border-b border-[var(--border)]">
                            <th className="w-2/5 p-3 text-left"><SortableHeader column="name" sortConfig={sortConfig} onSort={handleSort}>Name</SortableHeader></th>
                            <th className="w-1/6 p-3 text-left"><SortableHeader column="riceScore" sortConfig={sortConfig} onSort={handleSort}>RICE Score</SortableHeader></th>
                            <th className="w-1/6 p-3 text-left"><SortableHeader column="evidenceCount" sortConfig={sortConfig} onSort={handleSort}>Evidence</SortableHeader></th>
                            <th className="w-1/5 p-3 text-left"><SortableHeader column="outcomeName" sortConfig={sortConfig} onSort={handleSort}>Outcome</SortableHeader></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {sortedAndFilteredOpportunities.map(opp => (
                            <tr key={opp.id} className="hover:bg-gray-50">
                                <td className="p-3 font-medium truncate">
                                    <button onClick={() => onFocusNode(opp.id)} className="text-blue-600 hover:underline text-left">{opp.name}</button>
                                </td>
                                <td className="p-3 text-center font-semibold text-gray-700">
                                    {opp.riceScore !== null && opp.riceScore !== undefined ? (Math.round(opp.riceScore * 10) / 10) : 'N/A'}
                                </td>
                                <td className="p-3 text-center text-gray-600">{opp.evidenceCount}</td>
                                <td className="p-3 text-gray-600 truncate">{opp.outcomeName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
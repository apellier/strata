// src/components/ElementDetails/RiceScoreCalculator.tsx

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';
import { DebouncedInput, PropertyRow } from './ui';
import { TypedOpportunity } from '@/lib/store';


interface RiceScoreCalculatorProps {
    nodeData: Partial<TypedOpportunity>;
    onUpdate: (data: Partial<TypedOpportunity>) => void;
}

export default function RiceScoreCalculator({ nodeData, onUpdate }: RiceScoreCalculatorProps) {
  const [reach, setReach] = useState(nodeData.riceReach || 0);
  const [impact, setImpact] = useState(nodeData.riceImpact || 0);
  const [confidence, setConfidence] = useState(nodeData.riceConfidence || 0);
  const [effort, setEffort] = useState(nodeData.riceEffort || 0);

  useEffect(() => {
    setReach(nodeData.riceReach || 0);
    setImpact(nodeData.riceImpact || 0);
    setConfidence(nodeData.riceConfidence || 0);
    setEffort(nodeData.riceEffort || 0);
  }, [nodeData]);

  const riceScore = useMemo(() => {
    if (effort === 0) return 0;
    const score = (reach * impact * (confidence / 100)) / effort;
    return Math.round(score * 10) / 10; // Round to one decimal place
  }, [reach, impact, confidence, effort]);

  const debouncedUpdate = useCallback(debounce((updates) => {
    onUpdate(updates);
  }, 1200), [onUpdate]);

  const handleUpdate = (field: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const updates = {
      riceReach: field === 'reach' ? numericValue : reach,
      riceImpact: field === 'impact' ? numericValue : impact,
      riceConfidence: field === 'confidence' ? numericValue : confidence,
      riceEffort: field === 'effort' ? numericValue : effort,
    };
    
    if (field === 'reach') setReach(numericValue);
    if (field === 'impact') setImpact(numericValue);
    if (field === 'confidence') setConfidence(numericValue);
    if (field === 'effort') setEffort(numericValue);

    debouncedUpdate(updates);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">RICE Score</h3>
        <div className="text-2xl font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-md">
          {riceScore}
        </div>
      </div>
      <div className="space-y-2">
        <PropertyRow label="Reach">
          <DebouncedInput type="number" value={reach} onChange={(val) => handleUpdate('reach', val)} placeholder="e.g., 500 users" />
        </PropertyRow>
        <PropertyRow label="Impact">
           <select 
              value={impact} 
              onChange={(e) => handleUpdate('impact', e.target.value)} 
              className="w-full p-1 bg-gray-50 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition"
            >
              <option value={3}>3 (Massive)</option>
              <option value={2}>2 (High)</option>
              <option value={1}>1 (Medium)</option>
              <option value={0.5}>0.5 (Low)</option>
              <option value={0.25}>0.25 (Minimal)</option>
            </select>
        </PropertyRow>
        <PropertyRow label="Confidence">
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="10" 
              value={confidence} 
              onChange={(e) => handleUpdate('confidence', e.target.value)}
              className="w-full"
            />
            <span className="font-semibold w-12 text-right">{confidence}%</span>
          </div>
        </PropertyRow>
        <PropertyRow label="Effort">
          <DebouncedInput type="number" value={effort} onChange={(val) => handleUpdate('effort', val)} placeholder="Person-months" />
        </PropertyRow>
      </div>
    </div>
  );
}
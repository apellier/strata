'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

export const PropertyRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-3 items-start gap-4 text-sm py-2">
        <div className="text-gray-500 col-span-1 pt-1">{label}</div>
        <div className="col-span-2">{children}</div>
    </div>
);

export const DebouncedInput = ({ value, onChange, type = 'text', placeholder = '', className = '' }: { value: any, onChange: (val: any) => void, type?: string, placeholder?: string, className?: string }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const debouncedOnChange = useCallback(debounce(onChange, 800), [onChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        debouncedOnChange(newValue);
    };

    const baseClasses = "w-full p-1 bg-gray-50 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition";
    const finalClassName = `${baseClasses} ${className}`;

    if (type === 'textarea') {
        return <textarea value={localValue || ''} onChange={handleChange} placeholder={placeholder} className={finalClassName} rows={3} />;
    }
    
    if (type === 'select') {
        return (
            <select value={localValue || 'ON_TRACK'} onChange={handleChange} className={finalClassName}>
                <option value="ON_TRACK">On Track</option>
                <option value="AT_RISK">At Risk</option>
                <option value="ACHIEVED">Achieved</option>
                <option value="ARCHIVED">Archived</option>
            </select>
        );
    }
    
    return <input type={type} value={localValue || ''} onChange={handleChange} placeholder={placeholder} className={finalClassName} />;
};
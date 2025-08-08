'use client';

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { SuggestionProps } from '@tiptap/suggestion';
import type { MentionEntity } from '@/app/api/search/mentions/route';

export interface MentionSuggestionsRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

interface MentionSuggestionsProps extends SuggestionProps<MentionEntity> {
  items: MentionEntity[];
}

const MentionSuggestions = forwardRef<MentionSuggestionsRef, MentionSuggestionsProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command({
          id: item.id,
          label: item.title,
          type: item.type,
          data: item.data,
        });
      }
    };

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length);
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ key }: KeyboardEvent) => {
        if (key === 'ArrowUp') {
          upHandler();
          return true;
        }

        if (key === 'ArrowDown') {
          downHandler();
          return true;
        }

        if (key === 'Enter') {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="mention-suggestions">
          <div className="suggestion-item suggestion-item-empty">
            <div className="suggestion-item-icon">🔍</div>
            <div className="suggestion-item-content">
              <div className="suggestion-item-title">No results found</div>
              <div className="suggestion-item-subtitle">Try a different search term</div>
            </div>
          </div>
        </div>
      );
    }

    // Group items by type
    const groupedItems = items.reduce((acc, item, index) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push({ item, originalIndex: index });
      return acc;
    }, {} as Record<string, Array<{ item: MentionEntity; originalIndex: number }>>);

    const typeLabels = {
      interview: 'Interviews',
      evidence: 'Evidence',
      opportunity: 'Opportunities',
      solution: 'Solutions',
      outcome: 'Outcomes',
      assumption: 'Assumptions',
      experiment: 'Experiments',
    };

    const typeOrder = ['interview', 'evidence', 'opportunity', 'solution', 'outcome', 'assumption', 'experiment'];
    const orderedTypes = typeOrder.filter(type => groupedItems[type]?.length > 0);

    return (
      <div className="mention-suggestions">
        {orderedTypes.map(type => (
          <div key={type} className="suggestion-group">
            <div className="suggestion-group-header">
              {typeLabels[type as keyof typeof typeLabels]} ({groupedItems[type].length})
            </div>
            {groupedItems[type].map(({ item, originalIndex }) => (
              <button
                key={item.id}
                className={`suggestion-item ${
                  originalIndex === selectedIndex ? 'suggestion-item-selected' : ''
                }`}
                onClick={() => selectItem(originalIndex)}
                onMouseEnter={() => setSelectedIndex(originalIndex)}
              >
                <div className="suggestion-item-icon">{item.icon}</div>
                <div className="suggestion-item-content">
                  <div className="suggestion-item-title">{item.title}</div>
                  {item.subtitle && (
                    <div className="suggestion-item-subtitle">{item.subtitle}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ))}

        <style jsx>{`
          .mention-suggestions {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            max-height: 300px;
            overflow-y: auto;
            padding: 8px 0;
            z-index: 50;
            min-width: 300px;
            max-width: 400px;
          }

          .suggestion-group {
            margin-bottom: 4px;
          }

          .suggestion-group:last-child {
            margin-bottom: 0;
          }

          .suggestion-group-header {
            padding: 8px 16px 4px 16px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            background: #f9fafb;
            border-bottom: 1px solid #f3f4f6;
            position: sticky;
            top: 0;
            z-index: 1;
          }

          .suggestion-item {
            display: flex;
            align-items: center;
            width: 100%;
            padding: 8px 16px;
            border: none;
            background: none;
            cursor: pointer;
            text-align: left;
            transition: background-color 0.15s ease;
          }

          .suggestion-item:hover,
          .suggestion-item-selected {
            background-color: #f0f9ff;
            border-right: 2px solid #0ea5e9;
          }

          .suggestion-item-empty {
            color: #6b7280;
            padding: 16px;
            cursor: default;
          }
          
          .suggestion-item-empty:hover {
            background-color: transparent;
            border-right: none;
          }
          
          .suggestion-item-empty .suggestion-item-title {
            font-style: italic;
            color: #6b7280;
          }
          
          .suggestion-item-empty .suggestion-item-subtitle {
            color: #9ca3af;
          }

          .suggestion-item-icon {
            font-size: 16px;
            margin-right: 12px;
            flex-shrink: 0;
          }

          .suggestion-item-content {
            min-width: 0;
            flex: 1;
          }

          .suggestion-item-title {
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .suggestion-item-subtitle {
            font-size: 12px;
            color: #6b7280;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .mention-suggestions::-webkit-scrollbar {
            width: 6px;
          }

          .mention-suggestions::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }

          .mention-suggestions::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }

          .mention-suggestions::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </div>
    );
  }
);

MentionSuggestions.displayName = 'MentionSuggestions';

export default MentionSuggestions;
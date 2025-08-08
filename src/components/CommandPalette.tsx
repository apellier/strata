'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, Target, Lightbulb, BookText, FlaskConical, Plus, LayoutGrid, Rows3, PanelLeftOpen, PanelLeftClose, Users, MessageCircle } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import * as api from '@/lib/api';
import { useStore } from '@/lib/store';
import type { Outcome, Opportunity, Solution, Interview, Evidence } from '@prisma/client';

type CommandType = 'search' | 'action';

interface BaseCommand {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  type: CommandType;
  category: string;
}

interface SearchCommand extends BaseCommand {
  type: 'search';
  data: Outcome | Opportunity | Solution | Interview;
  onSelect: () => void;
}

interface ActionCommand extends BaseCommand {
  type: 'action';
  action: () => void;
}

type Command = SearchCommand | ActionCommand;

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusOpportunity: (opportunity: Opportunity) => void;
  onFocusSolution: (solution: Solution) => void;
  onFocusOutcome: (outcome: Outcome) => void;
  onFocusInterview: (id: string) => void;
  onNewInterview: () => void;
  onToggleHub: () => void;
  onToggleViewMode: () => void;
  onOpenFeedback: () => void;
  isHubOpen: boolean;
  viewMode: 'canvas' | 'list';
  onFocusNode: (nodeId: string) => void;
  onOpenWelcome?: () => void;
  onOpenTemplates?: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onFocusOpportunity,
  onFocusSolution,
  onFocusOutcome,
  onFocusInterview,
  onNewInterview,
  onToggleHub,
  onToggleViewMode,
  onOpenFeedback,
  isHubOpen,
  viewMode,
  onFocusNode,
  onOpenWelcome,
  onOpenTemplates,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<{
    outcomes: Outcome[];
    opportunities: (Opportunity & { evidences: (Evidence & { interview: Interview })[] })[];
    solutions: Solution[];
    interviews: (Interview & { evidences: Evidence[] })[];
  }>({ outcomes: [], opportunities: [], solutions: [], interviews: [] });
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { addNode, nodes } = useStore();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Fetch search results when query changes
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchResults = async () => {
      if (query.length < 1) {
        setSearchResults({ outcomes: [], opportunities: [], solutions: [], interviews: [] });
        return;
      }

      setIsLoading(true);
      try {
        const [outcomes, opportunities, solutions, interviews] = await Promise.all([
          api.searchOutcomes(query),
          api.searchOpportunities(query),
          api.searchSolutions(query),
          api.searchInterviews(query),
        ]);
        
        setSearchResults({ outcomes, opportunities, solutions, interviews });
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults({ outcomes: [], opportunities: [], solutions: [], interviews: [] });
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 200);
    return () => clearTimeout(debounceTimer);
  }, [query, isOpen]);

  // Static action commands
  const actionCommands: ActionCommand[] = useMemo(() => [
    {
      id: 'create-outcome',
      title: 'Create New Outcome',
      description: 'Add a new business outcome to the canvas',
      icon: <Target size={16} />,
      type: 'action',
      category: 'Create',
      action: () => {
        addNode('outcome');
        onClose();
      },
    },
    {
      id: 'create-opportunity',
      title: 'Create New Opportunity',
      description: 'Add a new opportunity to the canvas',
      icon: <Lightbulb size={16} />,
      type: 'action',
      category: 'Create',
      action: () => {
        const selectedNodes = nodes.filter(n => n.selected);
        const parentNode = selectedNodes.length === 1 ? selectedNodes[0] : undefined;
        addNode('opportunity', parentNode);
        onClose();
      },
    },
    {
      id: 'create-interview',
      title: 'Create New Interview',
      description: 'Start a new customer interview',
      icon: <Users size={16} />,
      type: 'action',
      category: 'Create',
      action: () => {
        onNewInterview();
        onClose();
      },
    },
    {
      id: 'toggle-hub',
      title: isHubOpen ? 'Close Research Hub' : 'Open Research Hub',
      description: 'Toggle the research hub panel',
      icon: isHubOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />,
      type: 'action',
      category: 'View',
      action: () => {
        onToggleHub();
        onClose();
      },
    },
    {
      id: 'toggle-view',
      title: `Switch to ${viewMode === 'canvas' ? 'List' : 'Canvas'} View`,
      description: `Change view mode to ${viewMode === 'canvas' ? 'list' : 'canvas'}`,
      icon: viewMode === 'canvas' ? <Rows3 size={16} /> : <LayoutGrid size={16} />,
      type: 'action',
      category: 'View',
      action: () => {
        onToggleViewMode();
        onClose();
      },
    },
    {
      id: 'send-feedback',
      title: 'Send Feedback',
      description: 'Share feedback, report bugs, or request features',
      icon: <MessageCircle size={16} />,
      type: 'action',
      category: 'Help',
      action: () => {
        onOpenFeedback();
        onClose();
      },
    },
    ...(onOpenWelcome ? [{
      id: 'open-welcome',
      title: 'Get Started Guide',
      description: 'Restart onboarding and choose your path',
      icon: <BookText size={16} />,
      type: 'action' as const,
      category: 'Help',
      action: () => {
        onOpenWelcome();
        onClose();
      },
    }] : []),
    ...(onOpenTemplates ? [{
      id: 'open-templates',
      title: 'Browse Templates',
      description: 'Start with pre-built opportunity solution trees',
      icon: <FlaskConical size={16} />,
      type: 'action' as const,
      category: 'Help',
      action: () => {
        onOpenTemplates();
        onClose();
      },
    }] : []),
  ], [addNode, nodes, isHubOpen, viewMode, onClose, onNewInterview, onToggleHub, onToggleViewMode, onOpenFeedback, onOpenWelcome, onOpenTemplates]);

  // Generate search commands from results
  const searchCommands: SearchCommand[] = useMemo(() => {
    const commands: SearchCommand[] = [];
    
    searchResults.outcomes.forEach(outcome => {
      commands.push({
        id: `outcome-${outcome.id}`,
        title: outcome.name,
        description: 'Outcome',
        icon: <Target size={16} />,
        type: 'search',
        category: 'Outcomes',
        data: outcome,
        onSelect: () => {
          onFocusOutcome(outcome);
          onFocusNode(outcome.id);
          onClose();
        },
      });
    });

    searchResults.opportunities.forEach(opportunity => {
      commands.push({
        id: `opportunity-${opportunity.id}`,
        title: opportunity.name,
        description: 'Opportunity',
        icon: <Lightbulb size={16} />,
        type: 'search',
        category: 'Opportunities',
        data: opportunity,
        onSelect: () => {
          onFocusOpportunity(opportunity);
          onFocusNode(opportunity.id);
          onClose();
        },
      });
    });

    searchResults.solutions.forEach(solution => {
      commands.push({
        id: `solution-${solution.id}`,
        title: solution.name,
        description: 'Solution',
        icon: <FlaskConical size={16} />,
        type: 'search',
        category: 'Solutions',
        data: solution,
        onSelect: () => {
          onFocusSolution(solution);
          onFocusNode(solution.id);
          onClose();
        },
      });
    });

    searchResults.interviews.forEach(interview => {
      commands.push({
        id: `interview-${interview.id}`,
        title: interview.interviewee,
        description: `Interview from ${new Date(interview.date).toLocaleDateString()}`,
        icon: <BookText size={16} />,
        type: 'search',
        category: 'Interviews',
        data: interview,
        onSelect: () => {
          onFocusInterview(interview.id);
          onClose();
        },
      });
    });

    return commands;
  }, [searchResults, onFocusOutcome, onFocusOpportunity, onFocusSolution, onFocusInterview, onFocusNode, onClose]);

  // Combine all commands
  const allCommands = useMemo(() => {
    if (query.length > 0) {
      return [...searchCommands, ...actionCommands.filter(cmd => 
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        (cmd.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
      )];
    }
    return [...actionCommands, ...searchCommands];
  }, [query, searchCommands, actionCommands]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups = allCommands.reduce((acc, command) => {
      if (!acc[command.category]) {
        acc[command.category] = [];
      }
      acc[command.category].push(command);
      return acc;
    }, {} as Record<string, Command[]>);

    // Sort categories: Create, View, then alphabetical
    const sortedCategories = Object.keys(groups).sort((a, b) => {
      if (a === 'Create') return -1;
      if (b === 'Create') return 1;
      if (a === 'View') return -1;
      if (b === 'View') return 1;
      return a.localeCompare(b);
    });

    return sortedCategories.map(category => ({
      category,
      commands: groups[category],
    }));
  }, [allCommands]);

  // Reset selected index when commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [allCommands]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        const selectedCommand = allCommands[selectedIndex];
        if (selectedCommand) {
          if (selectedCommand.type === 'search') {
            selectedCommand.onSelect();
          } else {
            selectedCommand.action();
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [allCommands, selectedIndex, onClose]);

  // Scroll to selected item
  useEffect(() => {
    if (!listRef.current) return;
    
    const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-32">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-96 flex flex-col">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b">
          <Search size={20} className="text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for anything or run a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 outline-none text-lg"
          />
        </div>

        {/* Results */}
        <div ref={listRef} className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : allCommands.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {query.length > 0 ? 'No results found' : 'Start typing to search...'}
            </div>
          ) : (
            <div className="py-2">
              {groupedCommands.map(({ category, commands }, groupIndex) => (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {category}
                  </div>
                  {commands.map((command, commandIndex) => {
                    const globalIndex = groupedCommands
                      .slice(0, groupIndex)
                      .reduce((acc, group) => acc + group.commands.length, 0) + commandIndex;
                    
                    return (
                      <div
                        key={command.id}
                        data-index={globalIndex}
                        className={`flex items-center px-4 py-3 cursor-pointer ${
                          selectedIndex === globalIndex 
                            ? 'bg-blue-50 border-r-2 border-blue-500' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (command.type === 'search') {
                            command.onSelect();
                          } else {
                            command.action();
                          }
                        }}
                      >
                        <div className="flex-shrink-0 mr-3 text-gray-400">
                          {command.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {command.title}
                          </div>
                          {command.description && (
                            <div className="text-sm text-gray-500 truncate">
                              {command.description}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-xs text-gray-400">
                          {selectedIndex === globalIndex && '⏎'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500 flex justify-between">
          <span>↑↓ to navigate</span>
          <span>⏎ to select</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
}
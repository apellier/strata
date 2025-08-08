'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import DiscoveryCanvas from '@/components/DiscoveryCanvas';
import InterviewManager from '@/components/InterviewManager';
import InterviewEditor from '@/components/InterviewEditor';
import OpportunityEditor from '@/components/OpportunityEditor';
import SolutionEditor from '@/components/SolutionEditor';
import OutcomeEditor from '@/components/OutcomeEditor';
import OpportunityListView from '@/components/OpportunityListView';
import { PanelLeftClose, PanelLeftOpen, LayoutGrid, Rows3, Users, UserCheck } from 'lucide-react';
import * as api from '@/lib/api';
import type { Interview, Evidence, Opportunity, Solution, Outcome } from '@prisma/client';
import { PanelState } from '@/components/SidePanel';
import LandingPage from './landing-page'; // Import the new landing page
import { SignOut } from '@/components/auth-components'; // Import the SignOut button
import CommandPalette from '@/components/CommandPalette';
import FeedbackButton from '@/components/FeedbackButton';
import WelcomeModal from '@/components/WelcomeModal';
import TemplateGallery from '@/components/TemplateGallery';
import GuidedTutorial from '@/components/GuidedTutorial';
import { useHotkeys } from 'react-hotkeys-hook';
import { Template } from '@/lib/templates';
import { useStore } from '@/lib/store';

type ViewMode = 'canvas' | 'list';
type EvidenceType = 'VERBATIM' | 'PAIN_POINT' | 'DESIRE' | 'INSIGHT';

export default function Home() {
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<(Interview & { evidences: Evidence[] })[]>([]);
  const [editingInterview, setEditingInterview] = useState<Interview & { evidences: Evidence[] } | null>(null);
  const [focusedOpportunity, setFocusedOpportunity] = useState<Opportunity | null>(null);
  const [focusedSolution, setFocusedSolution] = useState<Solution | null>(null);
  const [focusedOutcome, setFocusedOutcome] = useState<Outcome | null>(null);
  const [panelState, setPanelState] = useState<PanelState>({ isOpen: false });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const instantiateTemplate = useStore((state) => state.instantiateTemplate);
  const nodes = useStore((state) => state.nodes);

  const fetchData = useCallback(async (idToFocus?: string) => {
    try {
        const data = await api.getInterviews();
        setInterviews(data);
        if (idToFocus) {
            const interviewToEdit = data.find(i => i.id === idToFocus);
            if (interviewToEdit) setEditingInterview(interviewToEdit);
        }
    } catch (error) {
        console.error("Failed to fetch interviews:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check if user is first-time user and show welcome modal
  useEffect(() => {
    if (session && status === 'authenticated') {
      // Simple check: if user has no nodes, they're probably new
      // In a real app, you might want to track this in user preferences
      const hasVisitedBefore = localStorage.getItem('strata_has_visited');
      if (!hasVisitedBefore && nodes.length === 0) {
        setIsFirstTimeUser(true);
        setIsWelcomeModalOpen(true);
        localStorage.setItem('strata_has_visited', 'true');
      }
    }
  }, [session, status, nodes.length]);

  // Command palette hotkey
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    setIsCommandPaletteOpen(true);
  }, { enableOnFormTags: true });

  // Feedback hotkey
  useHotkeys('mod+shift+f', (e) => {
    e.preventDefault();
    setIsFeedbackOpen(true);
  }, { enableOnFormTags: true });

  const handleFocusNode = (nodeId: string) => {
    setViewMode('canvas');
    setFocusedNodeId(nodeId);
    setTimeout(() => setFocusedNodeId(null), 100);
  };

  const handleNewInterview = async () => {
    // Corrected: Pass a Date object directly
    const newInterview = await api.addInterview({ interviewee: 'New Interviewee', date: new Date() });
    await fetchData(newInterview.id);
  };

  const handleFocusInterview = (id: string) => {
    const interviewToEdit = interviews.find(i => i.id === id);
    if (interviewToEdit) setEditingInterview(interviewToEdit);
  };

  const handleCloseEditor = () => setEditingInterview(null);
  const handleCloseOpportunityEditor = () => setFocusedOpportunity(null);
  const handleCloseSolutionEditor = () => setFocusedSolution(null);
  const handleCloseOutcomeEditor = () => setFocusedOutcome(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isFeedbackOpen) {
          setIsFeedbackOpen(false);
          return;
        }
        if (isTemplateGalleryOpen) {
          setIsTemplateGalleryOpen(false);
          return;
        }
        if (isWelcomeModalOpen) {
          setIsWelcomeModalOpen(false);
          return;
        }
        if (focusedOpportunity || focusedSolution || focusedOutcome || editingInterview) {
          handleCloseOpportunityEditor();
          handleCloseSolutionEditor();
          handleCloseOutcomeEditor();
          handleCloseEditor();
          return;
        }
        if (panelState.isOpen) {
          setPanelState({ isOpen: false });
          return;
        }
        if (isHubOpen) {
          setIsHubOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHubOpen, panelState, focusedOpportunity, focusedSolution, focusedOutcome, editingInterview, isCommandPaletteOpen, isFeedbackOpen, isWelcomeModalOpen, isTemplateGalleryOpen]);

  const handleDeleteInterview = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this interview?")) {
        await api.deleteInterview(id);
        fetchData();
    }
  };

  const handleUpdateInterview = async (id: string, data: Partial<Interview>) => {
    await api.updateInterview(id, data);
    fetchData(id);
  };

  const handleAddEvidence = async (interviewId: string, type: EvidenceType, content: string, updatedNotesHTML: string) => {
    // FIX: The notes must be sent in the correct JSON format that Prisma expects.
    // This prevents the interview notes from being wiped out.
    const notesPayload = { content: updatedNotesHTML };
    
    await api.addEvidence({ interviewId, type, content });
    await api.updateInterview(interviewId, { notes: notesPayload });
    fetchData(interviewId);
  };

  const handleDeleteEvidence = async (interviewId: string, evidenceId: string) => {
    await api.deleteEvidence(evidenceId);
    fetchData(interviewId);
  };

  // Onboarding flow handlers
  const handlePathSelect = (path: 'guided' | 'template' | 'explore') => {
    switch (path) {
      case 'guided':
        setIsWelcomeModalOpen(false);
        setIsTutorialActive(true);
        break;
      case 'template':
        setIsTemplateGalleryOpen(true);
        break;
      case 'explore':
        // Close modal and let user explore
        setIsWelcomeModalOpen(false);
        break;
    }
  };

  const handleTemplateSelect = async (template: Template) => {
    setIsTemplateGalleryOpen(false);
    setIsWelcomeModalOpen(false);
    await instantiateTemplate(template);
  };

  const handleBackToWelcome = () => {
    setIsTemplateGalleryOpen(false);
    setIsWelcomeModalOpen(true);
  };

  const handleRestartOnboarding = () => {
    localStorage.removeItem('strata_has_visited');
    setIsFirstTimeUser(true);
    setIsWelcomeModalOpen(true);
  };

  const handleTutorialComplete = () => {
    setIsTutorialActive(false);
    setCurrentTutorialStep(null);
  };

  const handleTutorialExit = () => {
    setIsTutorialActive(false);
    setCurrentTutorialStep(null);
  };

  // Detect when hub is opened during tutorial
  useEffect(() => {
    if (currentTutorialStep === 'research-hub-intro' && isHubOpen) {
      // Hub was opened, mark this step as completed and advance
      setTimeout(() => {
        // This will be handled by the tutorial component
      }, 500);
    }
  }, [currentTutorialStep, isHubOpen]);

    // Show a loading state while session is being determined
    if (status === 'loading') {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }
  
    // If there's no session, show the landing page
    if (!session) {
      return <LandingPage />;
    }

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--background-alt)]">
      <header className="flex-shrink-0 bg-[var(--background)] border-b border-[var(--border)] z-20">
        <div className="p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsHubOpen(!isHubOpen)} 
                  className={`p-2 rounded-md transition-colors ${
                    isHubOpen 
                      ? "bg-blue-100 text-blue-600 hover:bg-blue-200" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                  title={isHubOpen ? "Close Research Hub" : "Open Research Hub"}
                >
                    {isHubOpen ? <UserCheck size={20} /> : <Users size={20} />}
                </button>
                <h1 className="text-lg font-semibold text-gray-800">Strata</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center rounded-md border border-[var(--border)] p-0.5 bg-gray-100">
                  <button onClick={() => setViewMode('canvas')} title="Canvas View" className={`p-1.5 rounded-md ${viewMode === 'canvas' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>
                      <LayoutGrid size={18} />
                  </button>
                  <button onClick={() => setViewMode('list')} title="List View" className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>
                      <Rows3 size={18} />
                  </button>
              </div>
              <SignOut />
            </div>
        </div>
      </header>
      <main className="flex-grow flex relative overflow-hidden">
        <div className={`transition-all duration-300 ease-in-out bg-[var(--background)] border-r border-[var(--border)] ${isHubOpen ? 'w-1/3 min-w-[400px]' : 'w-0'}`}>
            <div className={`h-full overflow-hidden ${isHubOpen ? 'opacity-100' : 'opacity-0'}`}>
                <InterviewManager
                    interviews={interviews}
                    onFocusInterview={handleFocusInterview}
                    onNewInterview={handleNewInterview}
                    onDeleteInterview={handleDeleteInterview}
                />
            </div>
        </div>
        <div className="flex-1 h-full flex">
            {viewMode === 'canvas'
              ? <DiscoveryCanvas
                  focusedNodeId={focusedNodeId}
                  onFocusOpportunity={setFocusedOpportunity}
                  onFocusSolution={setFocusedSolution}
                  onFocusOutcome={setFocusedOutcome}
                  onFocusInterview={handleFocusInterview}
                  onFocusNode={handleFocusNode}
                  panelState={panelState}
                  setPanelState={setPanelState}
                  onOpenTemplates={() => setIsTemplateGalleryOpen(true)}
                  onStartTutorial={() => setIsWelcomeModalOpen(true)}
                />
                : <OpportunityListView onFocusNode={handleFocusNode} viewMode={viewMode} />
              }
        </div>
      </main>
      {editingInterview && (
          <InterviewEditor
            interview={editingInterview}
            onClose={handleCloseEditor}
            onUpdate={handleUpdateInterview}
            // Corrected: Explicitly type the parameters
            onAddEvidence={(type, content, notes) => handleAddEvidence(editingInterview.id, type, content, notes)}
            onDeleteEvidence={(id) => handleDeleteEvidence(editingInterview.id, id)}
          />
      )}
      {focusedOpportunity && ( <OpportunityEditor opportunity={focusedOpportunity} onClose={handleCloseOpportunityEditor} /> )}
      {focusedSolution && ( <SolutionEditor solution={focusedSolution} onClose={handleCloseSolutionEditor} /> )}
      {focusedOutcome && ( <OutcomeEditor outcome={focusedOutcome} onClose={handleCloseOutcomeEditor} /> )}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onFocusOpportunity={setFocusedOpportunity}
        onFocusSolution={setFocusedSolution}
        onFocusOutcome={setFocusedOutcome}
        onFocusInterview={handleFocusInterview}
        onNewInterview={handleNewInterview}
        onToggleHub={() => setIsHubOpen(!isHubOpen)}
        onToggleViewMode={() => setViewMode(viewMode === 'canvas' ? 'list' : 'canvas')}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        isHubOpen={isHubOpen}
        viewMode={viewMode}
        onFocusNode={handleFocusNode}
        onOpenWelcome={handleRestartOnboarding}
        onOpenTemplates={() => setIsTemplateGalleryOpen(true)}
      />
      <FeedbackButton 
        isOpen={isFeedbackOpen}
        onOpenChange={setIsFeedbackOpen}
      />
      
      {/* Onboarding Modals */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onPathSelect={handlePathSelect}
      />
      
      <TemplateGallery
        isOpen={isTemplateGalleryOpen}
        onClose={() => setIsTemplateGalleryOpen(false)}
        onTemplateSelect={handleTemplateSelect}
        onBack={handleBackToWelcome}
      />
      
      <GuidedTutorial
        isActive={isTutorialActive}
        onComplete={handleTutorialComplete}
        onExit={handleTutorialExit}
        onStepChange={setCurrentTutorialStep}
        isHubOpen={isHubOpen}
        interviews={interviews}
        isPanelOpen={panelState.isOpen}
      />
    </div>
  );
}
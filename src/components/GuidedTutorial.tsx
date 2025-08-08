'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Target, Lightbulb, FlaskConical, Users, BookOpen, Eye, Zap } from 'lucide-react';
import { useStore } from '@/lib/store';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  instruction: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'create-outcome' | 'create-opportunity' | 'create-solution' | 'open-hub' | 'add-interview' | 'connect-nodes' | 'complete';
  triggerNext?: 'auto' | 'manual' | 'action';
  completedWhen?: () => boolean;
  concept?: {
    title: string;
    description: string;
    icon: React.ReactNode;
    quote?: string;
  };
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Product Discovery',
    content: 'Hi! I\'m your guide to Teresa Torres\' opportunity solution tree methodology. This powerful framework helps product teams make better decisions by connecting customer problems to business outcomes.',
    instruction: 'Let\'s start by understanding what we\'re building together.',
    position: 'center',
    triggerNext: 'manual',
    concept: {
      title: 'Opportunity Solution Trees',
      description: 'A visual framework that helps product teams discover what to build next by mapping the path from business outcomes through customer opportunities to potential solutions.',
      icon: <Target size={20} />,
      quote: '"The opportunity solution tree keeps us focused on outcomes, not outputs." - Teresa Torres'
    }
  },
  {
    id: 'business-outcome',
    title: 'Start with Business Outcomes',
    content: 'Every great product starts with a clear business outcome. This is the measurable result you want to achieve - like increasing customer retention, reducing churn, or growing revenue.',
    instruction: 'Click the "+ New Outcome" button to create your first business outcome.',
    targetElement: '[data-testid="add-outcome-button"], .btn.btn-primary',
    position: 'bottom',
    action: 'create-outcome',
    triggerNext: 'action',
    completedWhen: () => true, // Will be handled by useEffect
    concept: {
      title: 'Business Outcomes',
      description: 'Specific, measurable results that drive business value. They should be outcome-focused, not output-focused.',
      icon: <Target size={20} />,
      quote: '"Start with the business outcome you want to drive, then work backwards." - Teresa Torres'
    }
  },
  {
    id: 'edit-outcome',
    title: 'Define Your Outcome',
    content: 'Great! Now let\'s define what success looks like. A good business outcome is specific, measurable, and time-bound. For example: "Increase trial-to-paid conversion by 15% in Q2".',
    instruction: 'Click on your outcome node to edit it. Give it a clear, measurable description.',
    targetElement: '[data-node-type="outcome"]',
    position: 'top',
    triggerNext: 'manual'
  },
  {
    id: 'customer-opportunities',
    title: 'Discover Customer Opportunities',
    content: 'Now we need to find customer opportunities that could drive this outcome. Opportunities are unmet customer needs, pain points, or desires that represent chances to create value.',
    instruction: 'Select your outcome node (click on it) then press "O" or click "+ New Opportunity" to add an opportunity.',
    targetElement: '[data-testid="add-opportunity-button"], .btn.btn-secondary',
    position: 'bottom',
    action: 'create-opportunity',
    triggerNext: 'action',
    completedWhen: () => true, // Will be handled by useEffect
    concept: {
      title: 'Customer Opportunities',
      description: 'Unmet customer needs, pain points, or desires. They represent the "why" behind what customers are trying to accomplish.',
      icon: <Lightbulb size={20} />,
      quote: '"Opportunities are customer needs, pain points, or desires." - Teresa Torres'
    }
  },
  {
    id: 'opportunity-tree',
    title: 'Build Your Opportunity Tree',
    content: 'Excellent! Notice how your opportunity is connected to your outcome. This visual connection shows how solving customer problems drives business results. You can add multiple opportunities under each outcome.',
    instruction: 'Create 2-3 more opportunities to build out your tree. Remember: each opportunity should be a distinct customer need.',
    triggerNext: 'manual'
  },
  {
    id: 'research-hub-intro',
    title: 'Time for Customer Research',
    content: 'Before we create solutions, we need to validate these opportunities with real customers. The Research Hub helps you organize customer interviews and evidence.',
    instruction: 'Click the Research Hub button (👥) in the top-left to open customer research.',
    targetElement: '[title*="Research Hub"], [title*="Open Research Hub"]',
    position: 'right',
    action: 'open-hub',
    triggerNext: 'action',
    concept: {
      title: 'Customer Research',
      description: 'The foundation of good product decisions. Regular customer interviews help validate opportunities and guide solution development.',
      icon: <Users size={20} />,
      quote: '"Talk to customers every week." - Teresa Torres'
    }
  },
  {
    id: 'create-interview',
    title: 'Add Your First Interview',
    content: 'Perfect! The Research Hub is where you\'ll capture insights from customer conversations. These interviews provide the evidence that validates or invalidates your opportunities.',
    instruction: 'Click "Add Interview" to create your first customer interview record.',
    targetElement: '[data-testid="add-interview-button"]',
    position: 'left',
    action: 'add-interview',
    triggerNext: 'action'
  },
  {
    id: 'interview-insights',
    title: 'Capture Customer Evidence',
    content: 'When you conduct interviews, you\'ll capture different types of evidence: verbatim quotes, pain points, desires, and insights. This evidence validates which opportunities are worth pursuing.',
    instruction: 'Click on your interview to explore how you can add evidence and connect it to your opportunities.',
    triggerNext: 'manual',
    concept: {
      title: 'Evidence Types',
      description: 'Verbatim quotes, pain points, desires, and insights from customer interviews that validate or invalidate your opportunities.',
      icon: <Eye size={20} />
    }
  },
  {
    id: 'solution-ideation',
    title: 'Brainstorm Solution Ideas',
    content: 'Now that you understand customer opportunities, it\'s time to generate solution ideas. Teresa Torres recommends starting with broad ideation before committing to building anything.',
    instruction: 'Click on one of your opportunity nodes to open its details panel, then add multiple solution ideas in the "Solution Candidates" section.',
    targetElement: '[data-node-type="opportunity"]',
    position: 'top',
    action: 'create-solution',
    triggerNext: 'manual',
    concept: {
      title: 'Solution Ideation',
      description: 'Generate many potential solution ideas before choosing what to build. Ideas should be lightweight and testable.',
      icon: <Lightbulb size={20} />,
      quote: '"Generate many solution ideas, then run small experiments to test which ones work." - Teresa Torres'
    }
  },
  {
    id: 'solution-promotion',
    title: 'Promote Ideas to Solutions',
    content: 'Excellent ideation! Now select your most promising solution idea and promote it to the canvas. In real discovery, you\'d run experiments to validate ideas before promoting them.',
    instruction: 'In the Solution Candidates section, click the promote button (↑) on one of your ideas to add it to the canvas as a solution.',
    triggerNext: 'action',
    action: 'create-solution',
    completedWhen: () => true,
    concept: {
      title: 'Solution Selection',
      description: 'Choose the most promising ideas to build and test. Move from ideation to experimentation.',
      icon: <FlaskConical size={20} />,
      quote: '"Don\'t fall in love with your ideas. Fall in love with your problems." - Teresa Torres'
    }
  },
  {
    id: 'continuous-discovery',
    title: 'The Discovery Mindset',
    content: 'You\'ve built your first opportunity solution tree! But this is just the beginning. Continuous discovery means regularly interviewing customers, updating your tree, and running experiments.',
    instruction: 'Remember: this tree is a living document that evolves as you learn more about your customers.',
    position: 'center',
    triggerNext: 'manual',
    concept: {
      title: 'Continuous Discovery',
      description: 'An ongoing practice of customer research, opportunity identification, and solution experimentation.',
      icon: <Zap size={20} />,
      quote: '"Discovery is not a phase, it\'s a continuous practice." - Teresa Torres'
    }
  },
  {
    id: 'completion',
    title: 'Congratulations! 🎉',
    content: 'You\'ve learned the fundamentals of opportunity solution trees! You now know how to start with business outcomes, discover customer opportunities through research, and generate solution ideas.',
    instruction: 'Continue exploring Strata to build more sophisticated trees and connect deeper insights.',
    position: 'center',
    action: 'complete',
    triggerNext: 'manual'
  }
];

interface GuidedTutorialProps {
  isActive: boolean;
  onComplete: () => void;
  onExit: () => void;
  onStepChange?: (stepId: string) => void;
  isHubOpen?: boolean;
  interviews?: any[];
  isPanelOpen?: boolean;
}

export default function GuidedTutorial({ isActive, onComplete, onExit, onStepChange, isHubOpen, interviews, isPanelOpen }: GuidedTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isHighlighting, setIsHighlighting] = useState(false);
  const highlightRef = useRef<HTMLDivElement>(null);
  const nodes = useStore(state => state.nodes);

  const currentStep = tutorialSteps[currentStepIndex];

  useEffect(() => {
    onStepChange?.(currentStep.id);
  }, [currentStep.id, onStepChange]);

  useEffect(() => {
    if (!isActive || !currentStep.targetElement) return;

    const highlightElement = () => {
      const target = document.querySelector(currentStep.targetElement!) as HTMLElement;
      if (!target || !highlightRef.current) return;

      const rect = target.getBoundingClientRect();
      const highlight = highlightRef.current;
      
      highlight.style.display = 'block';
      highlight.style.left = `${rect.left - 4}px`;
      highlight.style.top = `${rect.top - 4}px`;
      highlight.style.width = `${rect.width + 8}px`;
      highlight.style.height = `${rect.height + 8}px`;
      
      setIsHighlighting(true);
    };

    const timer = setTimeout(highlightElement, 100);
    return () => clearTimeout(timer);
  }, [currentStep.targetElement, isActive, currentStepIndex]);

  // Check if step is completed based on node counts and actions
  useEffect(() => {
    let completed = false;
    
    switch (currentStep.action) {
      case 'create-outcome':
        completed = nodes.filter(n => n.data.type === 'outcome').length > 0;
        break;
      case 'create-opportunity':
        completed = nodes.filter(n => n.data.type === 'opportunity').length > 0;
        break;
      case 'create-solution':
        completed = nodes.filter(n => n.data.type === 'solution').length > 0;
        break;
      case 'open-hub':
        completed = isHubOpen === true;
        break;
      case 'add-interview':
        completed = (interviews && interviews.length > 0) || false;
        break;
      default:
        completed = currentStep.completedWhen ? currentStep.completedWhen() : false;
    }
    
    if (completed && !completedSteps.has(currentStep.id)) {
      setCompletedSteps(prev => new Set([...prev, currentStep.id]));
      
      if (currentStep.triggerNext === 'action') {
        setTimeout(() => nextStep(), 1500);
      }
    }
  }, [nodes, currentStep, completedSteps, isHubOpen, interviews]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setIsHighlighting(false);
    } else {
      completeTutorial();
    }
  }, [currentStepIndex]);

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setIsHighlighting(false);
    }
  };

  const completeTutorial = useCallback(() => {
    setIsHighlighting(false);
    onComplete();
  }, [onComplete]);

  // Determine tutorial card position based on panel states and current step
  const getTutorialCardPosition = () => {
    // For solution ideation steps, when panel is likely open, position on left
    if (currentStep.id === 'solution-ideation' || currentStep.id === 'solution-promotion') {
      return 'bottom-6 left-6 max-w-80';
    }
    
    // For research hub steps, when hub is open, position in center
    if (isHubOpen && (currentStep.id === 'create-interview' || currentStep.id === 'interview-insights')) {
      return 'bottom-6 left-1/2 transform -translate-x-1/2 max-w-80';
    }
    
    // Default position - avoid panels but ensure visibility
    if (isPanelOpen) {
      return 'bottom-6 left-6 max-w-80';
    }
    
    return 'bottom-6 right-6 max-w-80';
  };

  if (!isActive) return null;

  return (
    <>
      {/* Highlight overlay */}
      {isHighlighting && (
        <div
          ref={highlightRef}
          className="fixed z-[60] border-4 border-blue-500 rounded-lg pointer-events-none transition-all duration-300"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            display: 'none'
          }}
        />
      )}

      {/* Tutorial card */}
      <div className={`fixed ${getTutorialCardPosition()} z-[70] w-96 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-50">
          <div className="flex items-center space-x-2">
            <BookOpen size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Discovery Guide</h3>
            {(currentStep.id === 'solution-ideation' || currentStep.id === 'solution-promotion') && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Moved to avoid panel</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {currentStepIndex + 1} / {tutorialSteps.length}
            </span>
            <button
              onClick={onExit}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {currentStep.title}
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {currentStep.content}
            </p>
            
            {currentStep.instruction && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-3">
                <p className="text-blue-900 text-sm font-medium">
                  📋 {currentStep.instruction}
                </p>
              </div>
            )}

            {currentStep.concept && (
              <div className="p-3 bg-gray-50 rounded-lg border mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-purple-600">
                    {currentStep.concept.icon}
                  </div>
                  <h5 className="font-semibold text-gray-900">
                    {currentStep.concept.title}
                  </h5>
                </div>
                <p className="text-gray-700 text-sm mb-2">
                  {currentStep.concept.description}
                </p>
                {currentStep.concept.quote && (
                  <blockquote className="text-xs italic text-gray-600 border-l-2 border-purple-300 pl-2">
                    {currentStep.concept.quote}
                  </blockquote>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              {completedSteps.has(currentStep.id) && (
                <CheckCircle size={16} className="text-green-600" />
              )}
              
              {currentStep.triggerNext === 'manual' || currentStep.action === 'complete' ? (
                <button
                  onClick={currentStep.action === 'complete' ? completeTutorial : nextStep}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  <span>{currentStep.action === 'complete' ? 'Finish' : 'Next'}</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <div className="text-sm text-gray-500 px-4 py-2">
                  Complete the action above to continue
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
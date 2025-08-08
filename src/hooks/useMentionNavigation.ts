import { useCallback } from 'react';
import type { Opportunity, Solution, Outcome, Interview, Evidence, Assumption, Experiment } from '@prisma/client';

interface MentionNavigationHandlers {
  onFocusOpportunity?: (opportunity: Opportunity) => void;
  onFocusSolution?: (solution: Solution) => void;
  onFocusOutcome?: (outcome: Outcome) => void;
  onFocusInterview?: (id: string) => void;
  onFocusNode?: (nodeId: string) => void;
}

export const useMentionNavigation = (handlers: MentionNavigationHandlers = {}) => {
  const handleMentionClick = useCallback(async (mentionId: string, mentionType: string) => {
    try {
      switch (mentionType) {
        case 'interview':
          if (handlers.onFocusInterview) {
            handlers.onFocusInterview(mentionId);
          }
          break;
          
        case 'evidence':
          // For evidence, we could show a tooltip or navigate to the interview
          console.log('Evidence clicked:', mentionId);
          break;
          
        case 'outcome':
          if (handlers.onFocusOutcome && handlers.onFocusNode) {
            // Fetch the outcome data and navigate
            const response = await fetch(`/api/outcomes/${mentionId}`);
            if (response.ok) {
              const outcome = await response.json();
              handlers.onFocusOutcome(outcome);
              handlers.onFocusNode(outcome.id);
            }
          }
          break;
          
        case 'opportunity':
          if (handlers.onFocusOpportunity && handlers.onFocusNode) {
            // Fetch the opportunity data and navigate
            const response = await fetch(`/api/opportunities/${mentionId}`);
            if (response.ok) {
              const opportunity = await response.json();
              handlers.onFocusOpportunity(opportunity);
              handlers.onFocusNode(opportunity.id);
            }
          }
          break;
          
        case 'solution':
          if (handlers.onFocusSolution && handlers.onFocusNode) {
            // Fetch the solution data and navigate
            const response = await fetch(`/api/solutions/${mentionId}`);
            if (response.ok) {
              const solution = await response.json();
              handlers.onFocusSolution(solution);
              handlers.onFocusNode(solution.id);
            }
          }
          break;
          
        case 'assumption':
        case 'experiment':
          // For assumptions and experiments, we could show details in a modal
          console.log(`${mentionType} clicked:`, mentionId);
          break;
          
        default:
          console.log('Unknown mention type:', mentionType, mentionId);
      }
    } catch (error) {
      console.error('Error handling mention click:', error);
    }
  }, [handlers]);

  return { handleMentionClick };
};
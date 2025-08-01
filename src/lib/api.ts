import type { Outcome, Opportunity, Solution, Evidence, Interview, Assumption, Experiment } from '@prisma/client';
import { TypedOpportunity, TypedSolution } from './store'; // <-- ADD THIS IMPORT


type NodeType = 'outcome' | 'opportunity' | 'solution';
type NodeData = Outcome | Opportunity | Solution;

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorMessage;
    } catch (e: unknown) { /* ignore */ }
    throw new Error(errorMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }

  return response.json();
}

export const getCanvasData = async () => {
  return Promise.all([
    apiRequest<Outcome[]>('/api/outcomes', { method: 'GET' }),
    apiRequest<TypedOpportunity[]>('/api/opportunities', { method: 'GET' }),
    apiRequest<TypedSolution[]>('/api/solutions', { method: 'GET' }),
  ]);
};

export const addNode = <T extends NodeData>(type: NodeType, data: Partial<T>): Promise<T> => {
  const path = {
    outcome: '/api/outcomes',
    opportunity: '/api/opportunities',
    solution: '/api/solutions',
  }[type];
  return apiRequest<T>(path, { method: 'POST', body: JSON.stringify(data) });
};

export const updateNode = <T extends NodeData>(type: NodeType, id: string, data: Partial<T>): Promise<T> => {
  const path = {
    outcome: '/api/outcomes',
    opportunity: '/api/opportunities',
    solution: '/api/solutions',
  }[type];
  return apiRequest<T>(path, { method: 'PUT', body: JSON.stringify({ id, ...data }) });
};

export const deleteNode = (type: NodeType, id: string) => {
  const path = {
    outcome: `/api/outcomes/${id}`,
    opportunity: `/api/opportunities/${id}`,
    solution: `/api/solutions/${id}`,
  }[type];
  return apiRequest<null>(path, { method: 'DELETE' });
};

interface SolutionCandidateForApi {
  title: string;
  quickAssumptions: string[];
}

export const promoteIdeaToSolution = (candidate: SolutionCandidateForApi, opportunity: Opportunity) => {
  const newSolutionData = {
      name: candidate.title,
      opportunityId: opportunity.id,
      x_position: opportunity.x_position,
      y_position: opportunity.y_position + 150,
      assumptions: candidate.quickAssumptions || [],
  };
  return apiRequest<Solution>('/api/solutions', { method: 'POST', body: JSON.stringify(newSolutionData) });
};

export const getInterviews = () => apiRequest<(Interview & { evidences: Evidence[] })[]>('/api/interviews');
export const addInterview = (data: Partial<Interview>) => apiRequest<Interview>('/api/interviews', { method: 'POST', body: JSON.stringify(data) });
export const updateInterview = (id: string, data: Partial<Interview>) => apiRequest<Interview>('/api/interviews', { method: 'PUT', body: JSON.stringify({ id, ...data }) });
export const deleteInterview = (id: string) => apiRequest<null>(`/api/interviews/${id}`, { method: 'DELETE' });
export const addEvidence = (data: { type: string; content: string; interviewId: string }) => apiRequest<Evidence>('/api/evidences', { method: 'POST', body: JSON.stringify(data) });
export const deleteEvidence = (id: string) => apiRequest<null>(`/api/evidences/${id}`, { method: 'DELETE' });
export const getAllEvidence = () => apiRequest<(Evidence & { interview: Interview })[]>('/api/evidences');
export const addAssumption = (data: Partial<Assumption>) => apiRequest<Assumption>('/api/assumptions', { method: 'POST', body: JSON.stringify(data) });
export const updateAssumption = (id: string, data: Partial<Assumption>) => apiRequest<Assumption>('/api/assumptions', { method: 'PUT', body: JSON.stringify({ id, ...data }) });
export const deleteAssumption = (id: string) => apiRequest<null>(`/api/assumptions/${id}`, { method: 'DELETE' });
export const addExperiment = (data: Partial<Experiment>) => apiRequest<Experiment>('/api/experiments', { method: 'POST', body: JSON.stringify(data) });
export const updateExperiment = (id: string, data: Partial<Experiment>) => apiRequest<Experiment>('/api/experiments', { method: 'PUT', body: JSON.stringify({ id, ...data }) });
export const deleteExperiment = (id: string) => apiRequest<null>(`/api/experiments/${id}`, { method: 'DELETE' });


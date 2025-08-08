import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';
import type { Outcome, Opportunity, Solution, Interview, Evidence, Assumption, Experiment } from '@prisma/client';

export interface MentionEntity {
  id: string;
  title: string;
  subtitle?: string;
  type: 'outcome' | 'opportunity' | 'solution' | 'interview' | 'evidence' | 'assumption' | 'experiment';
  icon: string;
  data: any; // Raw entity data for navigation
}

export async function GET(req: Request) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    
    if (query.length < 1) {
      return NextResponse.json([]);
    }

    const searchTerm = query.toLowerCase();
    const results: MentionEntity[] = [];

    // Search Interviews
    const interviews = await prisma.interview.findMany({
      where: {
        userId: user.id,
        interviewee: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      orderBy: { date: 'desc' },
      take: 5,
    });

    interviews.forEach(interview => {
      results.push({
        id: interview.id,
        title: interview.interviewee,
        subtitle: `Interview from ${new Date(interview.date).toLocaleDateString()}`,
        type: 'interview',
        icon: '🎙️',
        data: interview,
      });
    });

    // Search Evidence
    const evidence = await prisma.evidence.findMany({
      where: {
        userId: user.id,
        content: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      include: {
        interview: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    evidence.forEach(ev => {
      const typeIcons = {
        VERBATIM: '💬',
        PAIN_POINT: '😣',
        DESIRE: '✨',
        INSIGHT: '💡',
      };

      results.push({
        id: ev.id,
        title: `"${ev.content.length > 50 ? ev.content.substring(0, 50) + '...' : ev.content}"`,
        subtitle: `${ev.type.toLowerCase().replace('_', ' ')} from ${ev.interview.interviewee}`,
        type: 'evidence',
        icon: typeIcons[ev.type as keyof typeof typeIcons] || '📝',
        data: ev,
      });
    });

    // Search Outcomes
    const outcomes = await prisma.outcome.findMany({
      where: {
        userId: user.id,
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    outcomes.forEach(outcome => {
      results.push({
        id: outcome.id,
        title: outcome.name,
        subtitle: `Outcome - ${outcome.status.toLowerCase().replace('_', ' ')}`,
        type: 'outcome',
        icon: '🎯',
        data: outcome,
      });
    });

    // Search Opportunities
    const opportunities = await prisma.opportunity.findMany({
      where: {
        userId: user.id,
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      include: {
        evidences: {
          include: {
            interview: true,
          },
        },
        _count: {
          select: {
            solutions: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    opportunities.forEach(opportunity => {
      results.push({
        id: opportunity.id,
        title: opportunity.name,
        subtitle: `Opportunity - ${opportunity.status?.toLowerCase().replace('_', ' ') || 'backlog'}`,
        type: 'opportunity',
        icon: '💡',
        data: opportunity,
      });
    });

    // Search Solutions
    const solutions = await prisma.solution.findMany({
      where: {
        userId: user.id,
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      include: {
        assumptions: {
          include: {
            experiments: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    solutions.forEach(solution => {
      results.push({
        id: solution.id,
        title: solution.name,
        subtitle: `Solution - ${solution.status?.toLowerCase().replace('_', ' ') || 'backlog'}`,
        type: 'solution',
        icon: '🛠️',
        data: solution,
      });
    });

    // Search Assumptions
    const assumptions = await prisma.assumption.findMany({
      where: {
        userId: user.id,
        description: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      include: {
        solution: true,
        experiments: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    });

    assumptions.forEach(assumption => {
      results.push({
        id: assumption.id,
        title: assumption.description.length > 50 
          ? assumption.description.substring(0, 50) + '...'
          : assumption.description,
        subtitle: `Assumption for ${assumption.solution.name}`,
        type: 'assumption',
        icon: '🤔',
        data: assumption,
      });
    });

    // Search Experiments
    const experiments = await prisma.experiment.findMany({
      where: {
        userId: user.id,
        OR: [
          {
            hypothesis: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            testMethod: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        assumption: {
          include: {
            solution: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    });

    experiments.forEach(experiment => {
      results.push({
        id: experiment.id,
        title: experiment.hypothesis.length > 50 
          ? experiment.hypothesis.substring(0, 50) + '...'
          : experiment.hypothesis,
        subtitle: `Experiment for ${experiment.assumption.solution.name}`,
        type: 'experiment',
        icon: '🧪',
        data: experiment,
      });
    });

    // Sort results by relevance (exact matches first, then by type priority)
    const typePriority = {
      interview: 1,
      evidence: 2,
      opportunity: 3,
      solution: 4,
      outcome: 5,
      assumption: 6,
      experiment: 7,
    };

    results.sort((a, b) => {
      // Exact title matches first
      const aExact = a.title.toLowerCase().includes(searchTerm);
      const bExact = b.title.toLowerCase().includes(searchTerm);
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then by type priority
      return typePriority[a.type] - typePriority[b.type];
    });

    return NextResponse.json(results.slice(0, 10)); // Limit to top 10 results
  } catch (error) {
    console.error('Error in mention search:', error);
    return new NextResponse(JSON.stringify({ message: 'Search failed' }), { status: 500 });
  }
}
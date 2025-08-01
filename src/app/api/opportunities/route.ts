// src/app/api/opportunities/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { protectApiRoute } from '@/lib/auth';

const createOpportunitySchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty." }),
  x_position: z.number(),
  y_position: z.number(),
  outcomeId: z.string().cuid().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
});

const updateOpportunitySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.any().optional(),
  riceReach: z.number().optional().nullable(),
  riceImpact: z.number().optional().nullable(),
  riceConfidence: z.number().optional().nullable(),
  riceEffort: z.number().optional().nullable(),
  status: z.enum(['BACKLOG', 'DISCOVERY', 'IN_PROGRESS', 'DONE', 'BLOCKED']).optional(),
  solutionCandidates: z.any().optional(),
  evidenceIds: z.array(z.string().cuid()).optional(),
  outcomeId: z.string().cuid().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  x_position: z.number().optional(),
  y_position: z.number().optional(),
});

export async function GET() {
    const { user, error } = await protectApiRoute();
    if (error) return error;

    try {
      const opportunities = await prisma.opportunity.findMany({
        where: { userId: user.id },
        include: {
            evidences: { include: { interview: true } },
            _count: {
                select: {
                    solutions: true
                }
            }
        }
    });
      return NextResponse.json(opportunities);
  } catch (error) {
      console.error("Error fetching opportunities:", error);
      return new NextResponse(JSON.stringify({ message: 'Failed to fetch opportunities' }), { status: 500 });
  }
}

export async function POST(req: Request) {
    const { user, error } = await protectApiRoute();
    if (error) return error;

    try {
        const body = await req.json();
        const validatedData = createOpportunitySchema.parse(body);

        // FIX: Initialize RICE score fields to prevent a score of 0 on creation.
        const reach = 0;
        const impact = 0.25;
        const confidence = 80;
        const effort = 1;
        const riceScore = (reach * impact * (confidence / 100)) / effort;

        const newOpportunity = await prisma.opportunity.create({
          data: {
            ...validatedData,
            userId: user.id,
            description: { type: 'doc', content: [{ type: 'paragraph' }] },
            riceReach: reach,
            riceImpact: impact,
            riceConfidence: confidence,
            riceEffort: effort,
            riceScore: riceScore,
          },
        });
        return NextResponse.json(newOpportunity, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
          return new NextResponse(JSON.stringify({ message: 'Invalid input data', errors: error.issues }), { status: 400 });
        }
        console.error("Error creating opportunity:", error);
        return new NextResponse(JSON.stringify({ message: 'Failed to create opportunity' }), { status: 500 });
    }
}

export async function PUT(req: Request) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const { id, ...data } = await req.json();
    if (!id) {
        return new NextResponse(JSON.stringify({ message: 'Opportunity ID is required' }), { status: 400 });
    }

    const opportunity = await prisma.opportunity.findFirst({
      where: { id, userId: user.id }
    });
    if (!opportunity) {
      return new NextResponse(JSON.stringify({ message: 'Opportunity not found or unauthorized' }), { status: 404 });
    }

    const validatedData = updateOpportunitySchema.parse(data);
    
    // Always recalculate RICE score if any of its components are present in the update
    if (
      validatedData.riceReach !== undefined ||
      validatedData.riceImpact !== undefined ||
      validatedData.riceConfidence !== undefined ||
      validatedData.riceEffort !== undefined
    ) {
      const reach = validatedData.riceReach ?? opportunity.riceReach ?? 0;
      const impact = validatedData.riceImpact ?? opportunity.riceImpact ?? 0;
      const confidence = validatedData.riceConfidence ?? opportunity.riceConfidence ?? 0;
      const effort = validatedData.riceEffort ?? opportunity.riceEffort ?? 1;

      if (effort > 0) {
        (validatedData as any).riceScore = (reach * impact * (confidence / 100)) / effort;
      } else {
        (validatedData as any).riceScore = 0;
      }
    }

    if (validatedData.evidenceIds !== undefined) {
        (validatedData as any).evidences = {
            set: validatedData.evidenceIds.map((eid: string) => ({ id: eid }))
        };
        delete validatedData.evidenceIds;
    }
    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: validatedData,
      include: {
        evidences: { include: { interview: true } },
        _count: { select: { solutions: true } }
      }
    });
    return NextResponse.json(updatedOpportunity);
  } catch (error) {
    if (error instanceof z.ZodError) {
        return new NextResponse(JSON.stringify({ message: 'Invalid input data', errors: error.issues }), { status: 400 });
    }
    console.error("Error updating opportunity:", error);
    return new NextResponse(JSON.stringify({ message: 'Failed to update opportunity' }), { status: 500 });
  }
}
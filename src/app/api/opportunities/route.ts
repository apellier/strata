import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

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
  priorityScore: z.number().optional().nullable(),
  confidence: z.number().int().min(0).max(100).optional().nullable(),
  solutionCandidates: z.any().optional(),
  evidenceIds: z.array(z.string().cuid()).optional(),
  outcomeId: z.string().cuid().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
});

export async function GET() {
    try {
        const opportunities = await prisma.opportunity.findMany({
            include: { evidences: { include: { interview: true } } }
        });
        return NextResponse.json(opportunities);
    } catch (error) {
        console.error("Error fetching opportunities:", error);
        return new NextResponse(JSON.stringify({ message: 'Failed to fetch opportunities' }), { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = createOpportunitySchema.parse(body);
        const newOpportunity = await prisma.opportunity.create({
          data: {
            ...validatedData,
            description: { type: 'doc', content: [{ type: 'paragraph' }] },
          },
        });
        return NextResponse.json(newOpportunity, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
          return new NextResponse(JSON.stringify({ message: 'Invalid input data', errors: error.errors }), { status: 400 });
        }
        console.error("Error creating opportunity:", error);
        return new NextResponse(JSON.stringify({ message: 'Failed to create opportunity' }), { status: 500 });
    }
}

export async function PUT(req: Request) {
  try {
    const { id, ...data } = await req.json();
    if (!id) {
        return new NextResponse(JSON.stringify({ message: 'Opportunity ID is required' }), { status: 400 });
    }
    const validatedData = updateOpportunitySchema.parse(data);
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
        evidences: { include: { interview: true } }
      }
    });
    return NextResponse.json(updatedOpportunity);
  } catch (error) {
    if (error instanceof z.ZodError) {
        return new NextResponse(JSON.stringify({ message: 'Invalid input data', errors: error.errors }), { status: 400 });
    }
    console.error("Error updating opportunity:", error);
    return new NextResponse(JSON.stringify({ message: 'Failed to update opportunity' }), { status: 500 });
  }
}

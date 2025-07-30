// src/app/api/assumptions/route.ts
import { NextResponse as NextResponseAssumption } from 'next/server';
import prismaAssumption from '@/lib/db';
import { z as zAssumption } from 'zod';
import { protectApiRoute } from '@/lib/auth';

const assumptionSchema = zAssumption.object({
    description: zAssumption.string().min(1),
    type: zAssumption.enum(['DESIRABILITY', 'VIABILITY', 'FEASIBILITY', 'USABILITY', 'ETHICAL']).optional(),
    importance: zAssumption.number().int().min(1).max(10).optional(),
    evidence: zAssumption.number().int().min(1).max(10).optional(),
    isValidated: zAssumption.boolean().optional(),
    solutionId: zAssumption.string().cuid(),
});

const createAssumptionSchema = zAssumption.object({
  description: zAssumption.string().min(1),
  solutionId: zAssumption.string().cuid(),
});


export async function POST(req: Request) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const body = await req.json();
    // Use the more specific schema for creation
    const validatedData = createAssumptionSchema.parse(body);

    const solution = await prismaAssumption.solution.findFirst({
      where: { id: validatedData.solutionId, userId: user.id }
    });
    if (!solution) {
      return new NextResponseAssumption(JSON.stringify({ message: 'Solution not found or unauthorized' }), { status: 404 });
    }

    // FIX: The validatedData now correctly ensures `description` is a string.
    const newAssumption = await prismaAssumption.assumption.create({
      data: {
        description: validatedData.description,
        solutionId: validatedData.solutionId,
        userId: user.id
      }
    });
    return NextResponseAssumption.json(newAssumption, { status: 201 });
  } catch (error) {
    if (error instanceof zAssumption.ZodError) {
        return new NextResponseAssumption(JSON.stringify({ message: 'Invalid input data', errors: error.errors }), { status: 400 });
    }
    console.error("Error creating assumption:", error);
    return new NextResponseAssumption(JSON.stringify({ message: 'Error creating assumption' }), { status: 500 });
  }
}

export async function PUT(req: Request) {
    const { user, error } = await protectApiRoute();
    if (error) return error;

    try {
        const { id, ...data } = await req.json();
        if (!id) return new NextResponseAssumption(JSON.stringify({ message: 'Assumption ID is required' }), { status: 400 });

        const assumption = await prismaAssumption.assumption.findFirst({
          where: { id, userId: user.id }
        });
        if (!assumption) {
          return new NextResponseAssumption(JSON.stringify({ message: 'Assumption not found or unauthorized' }), { status: 404 });
        }

        // Use the full schema for partial updates
        const validatedData = assumptionSchema.partial().parse(data);
        const updatedAssumption = await prismaAssumption.assumption.update({
            where: { id },
            data: validatedData,
        });
        return NextResponseAssumption.json(updatedAssumption);
    } catch (error) {
        if (error instanceof zAssumption.ZodError) {
            return new NextResponseAssumption(JSON.stringify({ message: 'Invalid input data', errors: error.errors }), { status: 400 });
        }
        console.error("Error updating assumption:", error);
        return new NextResponseAssumption(JSON.stringify({ message: 'Error updating assumption' }), { status: 500 });
    }
}
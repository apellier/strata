// src/app/api/solutions/route.ts

import { NextResponse as NextResponseSolution } from 'next/server';
import prismaSolution from '@/lib/db';
import { z as zSolution } from 'zod';

// Base schema for creating a solution
const createSolutionSchema = zSolution.object({
  name: zSolution.string().min(1, { message: "Name cannot be empty." }),
  opportunityId: zSolution.string().cuid(),
  x_position: zSolution.number(),
  y_position: zSolution.number(),
  assumptions: zSolution.array(zSolution.string()).optional(),
});

// Schema for updating a solution
const updateSolutionSchema = zSolution.object({
  name: zSolution.string().min(1).optional(),
  description: zSolution.any().optional(),
  x_position: zSolution.number().optional(),
  y_position: zSolution.number().optional(),
});


export async function GET() {
  try {
    const solutions = await prismaSolution.solution.findMany({
      include: { assumptions: { include: { experiments: true } } }
    });
    return NextResponseSolution.json(solutions);
  } catch (error) {
    console.error("Error fetching solutions:", error);
    return new NextResponseSolution(JSON.stringify({ message: 'Failed to fetch solutions' }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Use the dedicated creation schema
    const validatedData = createSolutionSchema.parse(body);
    
    const { assumptions, ...solutionData } = validatedData;

    const newSolution = await prismaSolution.solution.create({ 
        data: {
            ...solutionData,
            description: { type: 'doc', content: [{ type: 'paragraph' }] },
        }
    });

    if (assumptions && assumptions.length > 0) {
        await prismaSolution.assumption.createMany({
            data: assumptions.map(desc => ({
                description: desc,
                solutionId: newSolution.id,
            })),
        });
    }

    const finalSolution = await prismaSolution.solution.findUnique({
        where: { id: newSolution.id },
        include: { assumptions: { include: { experiments: true } } }
    });

    return NextResponseSolution.json(finalSolution, { status: 201 });
  } catch (error) {
    if (error instanceof zSolution.ZodError) {
        // Return detailed Zod errors for easier debugging
        return new NextResponseSolution(JSON.stringify({ message: 'Invalid input data', errors: error.errors }), { status: 400 });
    }
    console.error("Error creating solution:", error);
    return new NextResponseSolution(JSON.stringify({ message: 'Failed to create solution' }), { status: 500 });
  }
}

export async function PUT(req: Request) {
    try {
        const { id, ...data } = await req.json();
        if (!id) return new NextResponseSolution(JSON.stringify({ message: 'Solution ID is required' }), { status: 400 });
        // Use the dedicated update schema
        const validatedData = updateSolutionSchema.partial().parse(data);
        const updatedSolution = await prismaSolution.solution.update({
            where: { id },
            data: validatedData,
            include: { assumptions: { include: { experiments: true } } }
        });
        return NextResponseSolution.json(updatedSolution);
    } catch (error) {
        if (error instanceof zSolution.ZodError) {
            return new NextResponseSolution(JSON.stringify({ message: 'Invalid input data', errors: error.errors }), { status: 400 });
        }
        console.error("Error updating solution:", error);
        return new NextResponseSolution(JSON.stringify({ message: 'Failed to update solution' }), { status: 500 });
    }
}
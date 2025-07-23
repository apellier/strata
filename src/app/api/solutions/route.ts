import { NextResponse as NextResponseSolution } from 'next/server';
import prismaSolution from '@/lib/db';
import { z as zSolution } from 'zod';

const solutionSchema = zSolution.object({
  name: zSolution.string().min(1, { message: "Name cannot be empty." }),
  description: zSolution.any().optional(),
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
    const validatedData = solutionSchema.extend({ opportunityId: zSolution.string().cuid() }).parse(body);
    const newSolution = await prismaSolution.solution.create({ 
        data: {
            ...validatedData,
            description: { type: 'doc', content: [{ type: 'paragraph' }] },
        }
    });
    return NextResponseSolution.json(newSolution, { status: 201 });
  } catch (error) {
    if (error instanceof zSolution.ZodError) {
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
        const validatedData = solutionSchema.partial().parse(data);
        const updatedSolution = await prismaSolution.solution.update({
            where: { id },
            data: validatedData,
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
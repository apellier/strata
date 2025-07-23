import { NextResponse as NextResponseAssumption } from 'next/server';
import prismaAssumption from '@/lib/db';
import { z as zAssumption } from 'zod';

const assumptionSchema = zAssumption.object({
    description: zAssumption.string().min(1),
    type: zAssumption.enum(['DESIRABILITY', 'VIABILITY', 'FEASIBILITY', 'USABILITY', 'ETHICAL']).optional(),
    importance: zAssumption.number().int().min(1).max(10).optional(),
    evidence: zAssumption.number().int().min(1).max(10).optional(),
    solutionId: zAssumption.string().cuid(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = assumptionSchema.pick({ description: true, solutionId: true }).parse(body);
    const newAssumption = await prismaAssumption.assumption.create({ data: validatedData });
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
    try {
        const { id, ...data } = await req.json();
        if (!id) return new NextResponseAssumption(JSON.stringify({ message: 'Assumption ID is required' }), { status: 400 });
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

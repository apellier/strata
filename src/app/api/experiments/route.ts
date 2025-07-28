
import { NextResponse as NextResponseExperiment } from 'next/server';
import prismaExperiment from '@/lib/db';
import { z as zExperiment } from 'zod';
import { protectApiRoute } from '@/lib/auth';

const experimentSchema = zExperiment.object({
    hypothesis: zExperiment.string().min(1),
    testMethod: zExperiment.string().optional().nullable(),
    successCriteria: zExperiment.string().optional().nullable(),
    results: zExperiment.string().optional().nullable(),
    learnings: zExperiment.string().optional().nullable(),
    assumptionId: zExperiment.string().cuid(),
});

export async function POST(req: Request) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const body = await req.json();
    const validatedData = experimentSchema.pick({ hypothesis: true, assumptionId: true }).parse(body);

    const assumption = await prismaExperiment.assumption.findFirst({
      where: { id: validatedData.assumptionId, userId: user.id }
    });
    if (!assumption) {
      return new NextResponseExperiment(JSON.stringify({ message: 'Assumption not found or unauthorized' }), { status: 404 });
    }

    const newExperiment = await prismaExperiment.experiment.create({ 
      data: { ...validatedData, userId: user.id } 
    });
    return NextResponseExperiment.json(newExperiment, { status: 201 });
  } catch (error) {
    if (error instanceof zExperiment.ZodError) {
        return new NextResponseExperiment(JSON.stringify({ message: 'Invalid input data', errors: error.errors }), { status: 400 });
    }
    console.error("Error creating experiment:", error);
    return new NextResponseExperiment(JSON.stringify({ message: 'Error creating experiment' }), { status: 500 });
  }
}

export async function PUT(req: Request) {
    const { user, error } = await protectApiRoute();
    if (error) return error;

    try {
        const { id, ...data } = await req.json();
        if (!id) return new NextResponseExperiment(JSON.stringify({ message: 'Experiment ID is required' }), { status: 400 });
        
        const experiment = await prismaExperiment.experiment.findFirst({
          where: { id, userId: user.id }
        });
        if (!experiment) {
          return new NextResponseExperiment(JSON.stringify({ message: 'Experiment not found or unauthorized' }), { status: 404 });
        }

        const validatedData = experimentSchema.partial().parse(data);
        const updatedExperiment = await prismaExperiment.experiment.update({
            where: { id },
            data: validatedData,
        });
        return NextResponseExperiment.json(updatedExperiment);
    } catch (error) {
        if (error instanceof zExperiment.ZodError) {
            return new NextResponseExperiment(JSON.stringify({ message: 'Invalid input data', errors: error.errors }), { status: 400 });
        }
        console.error("Error updating experiment:", error);
        return new NextResponseExperiment(JSON.stringify({ message: 'Error updating experiment' }), { status: 500 });
    }
}
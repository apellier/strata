import { NextResponse as NextResponseOutcome } from 'next/server';
import prismaOutcome from '@/lib/db';
import { z as zOutcome } from 'zod';
import { protectApiRoute } from '@/lib/auth';

const outcomeSchema = zOutcome.object({
  name: zOutcome.string().min(1, { message: "Name cannot be empty." }),
  description: zOutcome.any().optional(),
  status: zOutcome.enum(['ON_TRACK', 'AT_RISK', 'ACHIEVED', 'ARCHIVED']).optional(),
  targetMetric: zOutcome.string().optional().nullable(),
  currentValue: zOutcome.number().optional().nullable(),
  x_position: zOutcome.number().optional(),
  y_position: zOutcome.number().optional(),
});

export async function GET() {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const outcomes = await prismaOutcome.outcome.findMany({
      where: { userId: user.id },
    });
    return NextResponseOutcome.json(outcomes);
  } catch (error) {
    console.error("Error fetching outcomes:", error);
    return new NextResponseOutcome(JSON.stringify({ message: 'Failed to fetch outcomes' }), { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const body = await req.json();
    const validatedData = outcomeSchema.parse(body);
    const newOutcome = await prismaOutcome.outcome.create({ 
        data: {
            ...validatedData,
            userId: user.id,
            description: { type: 'doc', content: [{ type: 'paragraph' }] },
        }
    });
    return NextResponseOutcome.json(newOutcome, { status: 201 });
  } catch (error) {
    if (error instanceof zOutcome.ZodError) {
        return new NextResponseOutcome(JSON.stringify({ message: 'Invalid input data', errors: error.issues }), { status: 400 });
    }
    console.error("Error creating outcome:", error);
    return new NextResponseOutcome(JSON.stringify({ message: 'Failed to create outcome' }), { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const { id, ...data } = await req.json();
    if (!id) return new NextResponseOutcome(JSON.stringify({ message: 'Outcome ID is required' }), { status: 400 });

    const outcome = await prismaOutcome.outcome.findFirst({
        where: { id, userId: user.id },
    });

    if (!outcome) {
        return new NextResponseOutcome(JSON.stringify({ message: 'Not Found or Unauthorized' }), { status: 404 });
    }

    const validatedData = outcomeSchema.partial().parse(data);
    const updatedOutcome = await prismaOutcome.outcome.update({
      where: { id },
      data: validatedData,
    });
    return NextResponseOutcome.json(updatedOutcome);
  } catch (error) {
    if (error instanceof zOutcome.ZodError) {
        return new NextResponseOutcome(JSON.stringify({ message: 'Invalid input data', errors: error.issues }), { status: 400 });
    }
    console.error("Error updating outcome:", error);
    return new NextResponseOutcome(JSON.stringify({ message: 'Failed to update outcome' }), { status: 500 });
  }
}
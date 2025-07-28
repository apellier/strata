import { NextResponse as NextResponseEvidence } from 'next/server';
import prismaEvidence from '@/lib/db';
import { z as zEvidence } from 'zod';
import { protectApiRoute } from '@/lib/auth';

const evidenceSchema = zEvidence.object({
    type: zEvidence.enum(['VERBATIM', 'PAIN_POINT', 'DESIRE', 'INSIGHT']),
    content: zEvidence.string().min(1),
    interviewId: zEvidence.string().cuid(),
});

export async function GET() {
  
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const evidences = await prismaEvidence.evidence.findMany({
      where: { userId: user.id },
      include: { interview: true },
    });
    return NextResponseEvidence.json(evidences);
  } catch (error) {
    console.error("Error fetching evidence:", error);
    return new NextResponseEvidence(JSON.stringify({ message: 'Failed to fetch evidence' }), { status: 500 });
  }
}

export async function POST(req: Request) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const body = await req.json();
    const validatedData = evidenceSchema.parse(body);

    const interview = await prismaEvidence.interview.findFirst({
      where: { id: validatedData.interviewId, userId: user.id }
    });
    if (!interview) {
      return new NextResponseEvidence(JSON.stringify({ message: 'Interview not found or unauthorized' }), { status: 404 });
    }

    const newEvidence = await prismaEvidence.evidence.create({
      data: { ...validatedData, userId: user.id },
    });
    return NextResponseEvidence.json(newEvidence, { status: 201 });
  } catch (error) {
    if (error instanceof zEvidence.ZodError) {
        return new NextResponseEvidence(JSON.stringify({ message: 'Invalid input data', errors: error.errors }), { status: 400 });
    }
    console.error("Error creating evidence:", error);
    return new NextResponseEvidence(JSON.stringify({ message: 'Failed to create evidence' }), { status: 500 });
  }
}
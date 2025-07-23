import { NextResponse as NextResponseEvidence } from 'next/server';
import prismaEvidence from '@/lib/db';
import { z as zEvidence } from 'zod';

const evidenceSchema = zEvidence.object({
    type: zEvidence.enum(['VERBATIM', 'PAIN_POINT', 'DESIRE', 'INSIGHT']),
    content: zEvidence.string().min(1),
    interviewId: zEvidence.string().cuid(),
});

export async function GET() {
  try {
    const evidences = await prismaEvidence.evidence.findMany({
      include: { interview: true },
    });
    return NextResponseEvidence.json(evidences);
  } catch (error) {
    console.error("Error fetching evidence:", error);
    return new NextResponseEvidence(JSON.stringify({ message: 'Failed to fetch evidence' }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = evidenceSchema.parse(body);
    const newEvidence = await prismaEvidence.evidence.create({
      data: validatedData,
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
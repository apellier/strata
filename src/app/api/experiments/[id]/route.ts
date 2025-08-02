// src/app/api/experiments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = await params; // await the Promise
  if (!id) {
    return NextResponse.json({ message: 'Missing experiment ID' }, { status: 400 });
  }

  try {
    const experiment = await prisma.experiment.findFirst({
      where: { id, userId: user.id }
    });

    if (!experiment) {
      return NextResponse.json({ message: 'Experiment not found or unauthorized' }, { status: 404 });
    }

    await prisma.experiment.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Error deleting experiment:", err);
    return NextResponse.json({ message: 'Error deleting experiment' }, { status: 500 });
  }
}

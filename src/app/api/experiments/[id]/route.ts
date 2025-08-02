// src/app/api/experiments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prismaExperimentId from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

interface RouteContext {
  params: { id: string };
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = params;
  if (!id) return NextResponse.json({ message: 'Missing experiment ID' }, { status: 400 });

  try {
    const experiment = await prismaExperimentId.experiment.findFirst({
      where: { id, userId: user.id }
    });

    if (!experiment) {
      return NextResponse.json({ message: 'Experiment not found or unauthorized' }, { status: 404 });
    }

    await prismaExperimentId.experiment.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting experiment:", error);
    return NextResponse.json({ message: 'Error deleting experiment' }, { status: 500 });
  }
}
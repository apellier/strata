
import { NextResponse as NextResponseExperimentId } from 'next/server';
import prismaExperimentId from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = params;
  if (!id) return NextResponseExperimentId.json({ message: 'Missing experiment ID' }, { status: 400 });

  try {
    const experiment = await prismaExperimentId.experiment.findFirst({
      where: { id, userId: user.id }
    });

    if (!experiment) {
      return new NextResponseExperimentId(JSON.stringify({ message: 'Experiment not found or unauthorized' }), { status: 404 });
    }

    await prismaExperimentId.experiment.delete({ where: { id } });
    return new NextResponseExperimentId(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting experiment:", error);
    return NextResponseExperimentId.json({ message: 'Error deleting experiment' }, { status: 500 });
  }
}
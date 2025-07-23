import { NextResponse as NextResponseExperimentId } from 'next/server';
import prismaExperimentId from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponseExperimentId.json({ message: 'Missing experiment ID' }, { status: 400 });
  try {
    await prismaExperimentId.experiment.delete({ where: { id } });
    return new NextResponseExperimentId(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting experiment:", error);
    return NextResponseExperimentId.json({ message: 'Error deleting experiment' }, { status: 500 });
  }
}
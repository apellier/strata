import { NextResponse as NextResponseOutcomeId } from 'next/server';
import prismaOutcomeId from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = params;
  if (!id) return NextResponseOutcomeId.json({ message: 'Missing outcome ID' }, { status: 400 });
  
  try {
    const outcome = await prismaOutcomeId.outcome.findFirst({
      where: { id, userId: user.id }
    });
    if (!outcome) {
      return NextResponseOutcomeId.json({ message: 'Outcome not found or unauthorized' }, { status: 404 });
    }

    await prismaOutcomeId.$transaction([
      prismaOutcomeId.opportunity.updateMany({ where: { outcomeId: id }, data: { outcomeId: null } }),
      prismaOutcomeId.outcome.delete({ where: { id } }),
    ]);
    return new NextResponseOutcomeId(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting outcome:", error);
    return NextResponseOutcomeId.json({ message: 'Error deleting outcome' }, { status: 500 });
  }
}
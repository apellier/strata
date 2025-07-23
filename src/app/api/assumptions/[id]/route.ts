import { NextResponse as NextResponseAssumptionId } from 'next/server';
import prismaAssumptionId from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponseAssumptionId.json({ message: 'Missing assumption ID' }, { status: 400 });
  try {
    await prismaAssumptionId.assumption.delete({ where: { id } });
    return new NextResponseAssumptionId(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting assumption:", error);
    return NextResponseAssumptionId.json({ message: 'Error deleting assumption' }, { status: 500 });
  }
}

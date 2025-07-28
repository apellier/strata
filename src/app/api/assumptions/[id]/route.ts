// src/app/api/assumptions/[id]/route.ts

import { NextResponse as NextResponseAssumptionId } from 'next/server';
import prismaAssumptionId from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = params;
  if (!id) return NextResponseAssumptionId.json({ message: 'Missing assumption ID' }, { status: 400 });
  
  try {
    const assumption = await prismaAssumptionId.assumption.findFirst({
      where: { id, userId: user.id }
    });

    if (!assumption) {
      return NextResponseAssumptionId.json({ message: 'Assumption not found or you do not have permission to delete it.' }, { status: 404 });
    }

    await prismaAssumptionId.assumption.delete({ where: { id } });
    return new NextResponseAssumptionId(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting assumption:", error);
    return NextResponseAssumptionId.json({ message: 'Error deleting assumption' }, { status: 500 });
  }
}
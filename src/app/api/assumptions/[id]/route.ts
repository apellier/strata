// src/app/api/assumptions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'; // Corrected import
import prismaAssumptionId from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) { // Corrected type
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = params;
  if (!id) return NextResponse.json({ message: 'Missing assumption ID' }, { status: 400 });
  
  try {
    const assumption = await prismaAssumptionId.assumption.findFirst({
      where: { id, userId: user.id }
    });

    if (!assumption) {
      return NextResponse.json({ message: 'Assumption not found or you do not have permission to delete it.' }, { status: 404 });
    }

    await prismaAssumptionId.assumption.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting assumption:", error);
    return NextResponse.json({ message: 'Error deleting assumption' }, { status: 500 });
  }
}
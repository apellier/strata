// src/app/api/outcomes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prismaOutcomeId from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

interface RouteContext {
  params: { id: string };
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = params;
  if (!id) return NextResponse.json({ message: 'Missing outcome ID' }, { status: 400 });
  
  try {
    const outcome = await prismaOutcomeId.outcome.findFirst({
      where: { id, userId: user.id }
    });
    if (!outcome) {
      return NextResponse.json({ message: 'Outcome not found or unauthorized' }, { status: 404 });
    }

    await prismaOutcomeId.$transaction([
      prismaOutcomeId.opportunity.updateMany({ where: { outcomeId: id }, data: { outcomeId: null } }),
      prismaOutcomeId.outcome.delete({ where: { id } }),
    ]);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting outcome:", error);
    return NextResponse.json({ message: 'Error deleting outcome' }, { status: 500 });
  }
}
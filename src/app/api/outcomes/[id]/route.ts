// src/app/api/outcomes/[id]/route.ts
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
    return NextResponse.json({ message: 'Missing outcome ID' }, { status: 400 });
  }
  
  try {
    const outcome = await prisma.outcome.findFirst({
      where: { id, userId: user.id }
    });
    if (!outcome) {
      return NextResponse.json({ message: 'Outcome not found or unauthorized' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.opportunity.updateMany({ where: { outcomeId: id }, data: { outcomeId: null } }),
      prisma.outcome.delete({ where: { id } }),
    ]);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Error deleting outcome:", err);
    return NextResponse.json({ message: 'Error deleting outcome' }, { status: 500 });
  }
}

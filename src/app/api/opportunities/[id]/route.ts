// src/app/api/opportunities/[id]/route.ts
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
    return NextResponse.json({ message: 'Missing opportunity ID' }, { status: 400 });
  }

  try {
    const opportunity = await prisma.opportunity.findFirst({
      where: { id, userId: user.id }
    });
    if (!opportunity) {
      return NextResponse.json({ message: 'Opportunity not found or unauthorized' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.opportunity.updateMany({ where: { parentId: id }, data: { parentId: null } }),
      prisma.opportunity.delete({ where: { id } })
    ]);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Error deleting opportunity:", err);
    return NextResponse.json({ message: 'Error deleting opportunity' }, { status: 500 });
  }
}

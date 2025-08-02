// src/app/api/assumptions/[id]/route.ts
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
    return NextResponse.json({ message: 'Missing assumption ID' }, { status: 400 });
  }
  
  try {
    const assumption = await prisma.assumption.findFirst({
      where: { id, userId: user.id }
    });

    if (!assumption) {
      return NextResponse.json({ message: 'Assumption not found or you do not have permission to delete it.' }, { status: 404 });
    }

    await prisma.assumption.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Error deleting assumption:", err);
    return NextResponse.json({ message: 'Error deleting assumption' }, { status: 500 });
  }
}

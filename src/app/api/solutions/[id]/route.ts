// src/app/api/solutions/[id]/route.ts
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
    return NextResponse.json({ message: 'Missing solution ID' }, { status: 400 });
  }
  
  try {
    const solution = await prisma.solution.findFirst({
      where: { id, userId: user.id }
    });
    if (!solution) {
      return NextResponse.json({ message: 'Solution not found or unauthorized' }, { status: 404 });
    }

    await prisma.solution.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Error deleting solution:", err);
    return NextResponse.json({ message: 'Error deleting solution' }, { status: 500 });
  }
}

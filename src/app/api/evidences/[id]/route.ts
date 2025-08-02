// src/app/api/evidences/[id]/route.ts
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
    return NextResponse.json({ message: 'Missing evidence ID' }, { status: 400 });
  }

  try {
    const evidence = await prisma.evidence.findFirst({
      where: { id, userId: user.id }
    });

    if (!evidence) {
      return NextResponse.json({ message: 'Evidence not found or unauthorized' }, { status: 404 });
    }

    await prisma.evidence.delete({ where: { id } });
    return NextResponse.json({ message: 'Evidence deleted successfully' });
  } catch (err) {
    console.error("Error deleting evidence:", err);
    return NextResponse.json({ message: 'Error deleting evidence' }, { status: 500 });
  }
}

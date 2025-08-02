// src/app/api/evidences/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prismaEvidenceId from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

interface RouteContext {
  params: { id: string };
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = params;
  if (!id) return NextResponse.json({ message: 'Missing evidence ID' }, { status: 400 });

  try {
    const evidence = await prismaEvidenceId.evidence.findFirst({
      where: { id, userId: user.id }
    });

    if (!evidence) {
      return NextResponse.json({ message: 'Evidence not found or unauthorized' }, { status: 404 });
    }

    await prismaEvidenceId.evidence.delete({ where: { id } });
    return NextResponse.json({ message: 'Evidence deleted successfully' });
  } catch (error) {
    console.error("Error deleting evidence:", error);
    return NextResponse.json({ message: 'Error deleting evidence' }, { status: 500 });
  }
}
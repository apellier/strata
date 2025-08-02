// src/app/api/interviews/[id]/route.ts
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
    return NextResponse.json({ message: 'Missing interview ID' }, { status: 400 });
  }
  
  try {
    const interview = await prisma.interview.findFirst({
      where: { id, userId: user.id }
    });
    if (!interview) {
      return NextResponse.json({ message: 'Interview not found or unauthorized' }, { status: 404 });
    }

    await prisma.interview.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Error deleting interview:", err);
    return NextResponse.json({ message: 'Error deleting interview' }, { status: 500 });
  }
}

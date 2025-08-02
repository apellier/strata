// src/app/api/interviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prismaInterviewId from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

interface RouteContext {
  params: { id: string };
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = params;
  if (!id) return NextResponse.json({ message: 'Missing interview ID' }, { status: 400 });
  
  try {
    const interview = await prismaInterviewId.interview.findFirst({
      where: { id, userId: user.id }
    });
    if (!interview) {
      return NextResponse.json({ message: 'Interview not found or unauthorized' }, { status: 404 });
    }

    await prismaInterviewId.interview.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return NextResponse.json({ message: 'Error deleting interview' }, { status: 500 });
  }
}
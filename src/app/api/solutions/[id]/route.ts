// src/app/api/solutions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prismaSolutionId from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

interface RouteContext {
  params: { id: string };
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = params;
  if (!id) return NextResponse.json({ message: 'Missing solution ID' }, { status: 400 });
  
  try {
    const solution = await prismaSolutionId.solution.findFirst({
      where: { id, userId: user.id }
    });
    if (!solution) {
      return NextResponse.json({ message: 'Solution not found or unauthorized' }, { status: 404 });
    }

    await prismaSolutionId.solution.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting solution:", error);
    return NextResponse.json({ message: 'Error deleting solution' }, { status: 500 });
  }
}
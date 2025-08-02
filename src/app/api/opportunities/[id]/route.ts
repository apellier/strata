// src/app/api/opportunities/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prismaClient from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

interface RouteContext {
  params: { id: string };
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ message: 'Missing opportunity ID' }, { status: 400 });
  }

  try {
    const opportunity = await prismaClient.opportunity.findFirst({
      where: { id, userId: user.id }
    });
    if (!opportunity) {
      return NextResponse.json({ message: 'Opportunity not found or unauthorized' }, { status: 404 });
    }

    await prismaClient.$transaction([
      prismaClient.opportunity.updateMany({ where: { parentId: id }, data: { parentId: null } }),
      prismaClient.opportunity.delete({ where: { id } })
    ]);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting opportunity:", error);
    return NextResponse.json({ message: 'Error deleting opportunity' }, { status: 500 });
  }
}
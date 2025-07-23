import { NextResponse as NextResponseNext } from 'next/server';
import prismaClient from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponseNext.json({ message: 'Missing opportunity ID' }, { status: 400 });
  }
  try {
    await prismaClient.$transaction([
      prismaClient.opportunity.updateMany({ where: { parentId: id }, data: { parentId: null } }),
      prismaClient.opportunity.delete({ where: { id } })
    ]);
    return new NextResponseNext(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting opportunity:", error);
    return NextResponseNext.json({ message: 'Error deleting opportunity' }, { status: 500 });
  }
}
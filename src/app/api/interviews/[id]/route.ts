import { NextResponse as NextResponseInterviewId } from 'next/server';
import prismaInterviewId from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponseInterviewId.json({ message: 'Missing interview ID' }, { status: 400 });
  try {
    await prismaInterviewId.interview.delete({ where: { id } });
    return new NextResponseInterviewId(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return NextResponseInterviewId.json({ message: 'Error deleting interview' }, { status: 500 });
  }
}
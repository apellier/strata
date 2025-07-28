
import { NextResponse as NextResponseInterviewId } from 'next/server';
import prismaInterviewId from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = params;
  if (!id) return NextResponseInterviewId.json({ message: 'Missing interview ID' }, { status: 400 });
  
  try {
    const interview = await prismaInterviewId.interview.findFirst({
      where: { id, userId: user.id }
    });
    if (!interview) {
      return NextResponseInterviewId.json({ message: 'Interview not found or unauthorized' }, { status: 404 });
    }

    await prismaInterviewId.interview.delete({ where: { id } });
    return new NextResponseInterviewId(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return NextResponseInterviewId.json({ message: 'Error deleting interview' }, { status: 500 });
  }
}
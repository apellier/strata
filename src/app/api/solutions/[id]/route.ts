import { NextResponse as NextResponseSolutionId } from 'next/server';
import prismaSolutionId from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = params;
  if (!id) return NextResponseSolutionId.json({ message: 'Missing solution ID' }, { status: 400 });
  
  try {
    const solution = await prismaSolutionId.solution.findFirst({
      where: { id, userId: user.id }
    });
    if (!solution) {
      return NextResponseSolutionId.json({ message: 'Solution not found or unauthorized' }, { status: 404 });
    }

    await prismaSolutionId.solution.delete({ where: { id } });
    return new NextResponseSolutionId(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting solution:", error);
    return NextResponseSolutionId.json({ message: 'Error deleting solution' }, { status: 500 });
  }
}
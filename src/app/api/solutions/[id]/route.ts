import { NextResponse as NextResponseSolutionId } from 'next/server';
import prismaSolutionId from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponseSolutionId.json({ message: 'Missing solution ID' }, { status: 400 });
  try {
    await prismaSolutionId.solution.delete({ where: { id } });
    return new NextResponseSolutionId(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting solution:", error);
    return NextResponseSolutionId.json({ message: 'Error deleting solution' }, { status: 500 });
  }
}

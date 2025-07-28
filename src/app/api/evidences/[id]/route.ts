import { NextResponse as NextResponseEvidenceId } from 'next/server';
import prismaEvidenceId from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  const { id } = params;
  if (!id) return new NextResponseEvidenceId(JSON.stringify({ message: 'Missing evidence ID' }), { status: 400 });

  try {
    const evidence = await prismaEvidenceId.evidence.findFirst({
      where: { id, userId: user.id }
    });

    if (!evidence) {
      return new NextResponseEvidenceId(JSON.stringify({ message: 'Evidence not found or unauthorized' }), { status: 404 });
    }

    await prismaEvidenceId.evidence.delete({ where: { id } });
    return NextResponseEvidenceId.json({ message: 'Evidence deleted successfully' });
  } catch (error) {
    console.error("Error deleting evidence:", error);
    return new NextResponseEvidenceId(JSON.stringify({ message: 'Error deleting evidence' }), { status: 500 });
  }
}
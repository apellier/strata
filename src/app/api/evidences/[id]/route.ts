import { NextResponse as NextResponseEvidenceId } from 'next/server';
import prismaEvidenceId from '@/lib/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return new NextResponseEvidenceId(JSON.stringify({ message: 'Missing evidence ID' }), { status: 400 });
  try {
    await prismaEvidenceId.evidence.delete({ where: { id } });
    return NextResponseEvidenceId.json({ message: 'Evidence deleted successfully' });
  } catch (error) {
    console.error("Error deleting evidence:", error);
    return new NextResponseEvidenceId(JSON.stringify({ message: 'Error deleting evidence' }), { status: 500 });
  }
}
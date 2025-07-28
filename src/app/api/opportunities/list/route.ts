
import { NextResponse as NextResponseList } from 'next/server';
import prismaClientList from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

export async function GET() {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const opportunities = await prismaClientList.opportunity.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { evidences: true },
        },
        outcome: {
          select: { name: true },
        }
      },
      orderBy: {
          createdAt: 'desc'
      }
    });
    const formattedOpportunities = opportunities.map(o => ({
      ...o,
      evidenceCount: o._count.evidences,
      outcomeName: o.outcome?.name || 'N/A',
    }));
    return NextResponseList.json(formattedOpportunities);
  } catch (error) {
    console.error("Error fetching opportunity list:", error);
    return new NextResponseList(JSON.stringify({ message: 'Failed to fetch opportunity list' }), { status: 500 });
  }
}
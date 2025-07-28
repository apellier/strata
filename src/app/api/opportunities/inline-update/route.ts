import { NextResponse as NextResponseInline } from 'next/server';
import prismaClientInline from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

export async function PUT(req: Request) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const { id, field, value } = await req.json();
    if (!id || !field || value === undefined) {
      return NextResponseInline.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const opportunity = await prismaClientInline.opportunity.findFirst({
      where: { id, userId: user.id }
    });
    if (!opportunity) {
      return new NextResponseInline.json({ message: 'Opportunity not found or unauthorized' }, { status: 404 });
    }

    let data: any = {};
    if (field === 'priorityScore') {
        data.priorityScore = parseFloat(value) || null;
    } else if (field === 'confidence') {
        data.confidence = parseInt(value, 10) || null;
    } else {
        return NextResponseInline.json({ message: `Invalid field for update: ${field}` }, { status: 400 });
    }
    const updatedOpportunity = await prismaClientInline.opportunity.update({
      where: { id },
      data,
    });
    return NextResponseInline.json(updatedOpportunity);
  } catch (error) {
    console.error("Error updating opportunity inline:", error);
    return NextResponseInline.json({ message: 'Error updating opportunity' }, { status: 500 });
  }
}
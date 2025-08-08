import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const { id } = await params;
    const feedback = await prisma.feedback.findFirst({
      where: {
        id,
        userId: user.id!,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { message: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { message: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    
    // Verify the feedback belongs to the user
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        id,
        userId: user.id!,
      },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { message: 'Feedback not found' },
        { status: 404 }
      );
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { message: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const { id } = await params;
    
    // Verify the feedback belongs to the user
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        id,
        userId: user.id!,
      },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { message: 'Feedback not found' },
        { status: 404 }
      );
    }

    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { message: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}
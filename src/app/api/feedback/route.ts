import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { protectApiRoute } from '@/lib/auth';
import type { FeedbackType, FeedbackPriority } from '@prisma/client';

export async function POST(req: NextRequest) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const body = await req.json();
    const { type, subject, message } = body;

    // Validate required fields
    if (!type || !message) {
      return NextResponse.json(
        { message: 'Type and message are required' },
        { status: 400 }
      );
    }

    // Get additional context
    const userAgent = req.headers.get('user-agent');
    const referer = req.headers.get('referer');

    const feedback = await prisma.feedback.create({
      data: {
        type: type as FeedbackType,
        subject,
        message,
        userAgent,
        url: referer,
        userId: user.id!,
        priority: 'NORMAL' as FeedbackPriority,
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { message: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { user, error } = await protectApiRoute();
  if (error) return error;

  try {
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit');
    const status = url.searchParams.get('status');

    const whereClause = {
      userId: user.id!,
      ...(status && { status: status as any }),
    };

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      ...(limit && { take: parseInt(limit) }),
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { message: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

import { NextResponse as NextResponseInterview } from 'next/server';
import prismaInterview from '@/lib/db';
import { z as zInterview } from 'zod';
import { protectApiRoute } from '@/lib/auth';

const interviewSchema = zInterview.object({
    interviewee: zInterview.string().min(1, { message: "Interviewee name is required." }),
    date: zInterview.string().datetime(),
    notes: zInterview.any().optional(),
});

export async function GET() {
    const { user, error } = await protectApiRoute();
    if (error) return error;

    try {
        const interviews = await prismaInterview.interview.findMany({
            where: { userId: user.id },
            include: { evidences: true },
            orderBy: { date: 'desc' },
        });
        return NextResponseInterview.json(interviews);
    } catch (error) {
        console.error("Error fetching interviews:", error);
        return new NextResponseInterview(JSON.stringify({ message: 'Failed to fetch interviews' }), { status: 500 });
    }
}

export async function POST(req: Request) {
    const { user, error } = await protectApiRoute();
    if (error) return error;

    try {
        const body = await req.json();
        const validatedData = interviewSchema.pick({ interviewee: true, date: true }).parse(body);
        const newInterview = await prismaInterview.interview.create({
            data: { 
              ...validatedData, 
              userId: user.id,
              notes: { content: "Type your interview notes here..." } 
            },
        });
        return NextResponseInterview.json(newInterview, { status: 201 });
    } catch (error) {
        if (error instanceof zInterview.ZodError) {
            return new NextResponseInterview(JSON.stringify({ message: 'Invalid input data', errors: error.issues }), { status: 400 });
        }
        console.error("Error creating interview:", error);
        return new NextResponseInterview(JSON.stringify({ message: 'Failed to create interview' }), { status: 500 });
    }
}

export async function PUT(req: Request) {
    const { user, error } = await protectApiRoute();
    if (error) return error;

    try {
        const { id, ...data } = await req.json();
        if (!id) return new NextResponseInterview(JSON.stringify({ message: 'Interview ID is required' }), { status: 400 });

        const interview = await prismaInterview.interview.findFirst({
          where: { id, userId: user.id }
        });
        if (!interview) {
          return new NextResponseInterview(JSON.stringify({ message: 'Interview not found or unauthorized' }), { status: 404 });
        }

        const validatedData = interviewSchema.partial().parse(data);
        const updatedInterview = await prismaInterview.interview.update({
            where: { id },
            data: validatedData
        });
        return NextResponseInterview.json(updatedInterview);
    } catch (error) {
        if (error instanceof zInterview.ZodError) {
            return new NextResponseInterview(JSON.stringify({ message: 'Invalid input data', errors: error.issues }), { status: 400 });
        }
        console.error("Error updating interview:", error);
        return new NextResponseInterview(JSON.stringify({ message: 'Failed to update interview' }), { status: 500 });
    }
}
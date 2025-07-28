// src/lib/auth.ts

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Import from the new file
import { NextResponse } from "next/server";
import { User } from "next-auth";

type ProtectedRouteResponse = 
  | { user: User; error: null }
  | { user: null; error: NextResponse };

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function protectApiRoute(): Promise<ProtectedRouteResponse> {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    return { 
      user: null, 
      error: new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 }) 
    };
  }
  return { user, error: null };
}

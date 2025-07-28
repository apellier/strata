// src/lib/auth.ts

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { User } from "next-auth" // Import the User type from next-auth

// Define a clear return type for our function
type ProtectedRouteResponse = 
  | { user: User; error: null }
  | { user: null; error: NextResponse };

// This function gets the current user's session from the server-side.
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

// This function can be used at the start of any API route to protect it.
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

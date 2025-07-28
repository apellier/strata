// src/app/landing-page.tsx

'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { Github } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to Strata</h1>
        <p className="text-xl text-gray-600 mb-8">
          The intelligent canvas for product discovery. Map your opportunities, connect your research, and build with confidence.
        </p>
        <button
          onClick={() => signIn('github', { callbackUrl: '/' })}
          className="btn btn-primary !text-lg !px-8 !py-3 inline-flex items-center gap-2"
        >
          <Github size={20} />
          Sign in with GitHub to Get Started
        </button>
      </div>
    </div>
  );
}

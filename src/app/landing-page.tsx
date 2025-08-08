// src/app/landing-page.tsx

'use client';

import React from 'react';
import { SignInButtons } from '@/components/auth-components';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 max-w-md w-full">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to Strata</h1>
        <p className="text-xl text-gray-600 mb-8">
          The intelligent canvas for product discovery. Map your opportunities, connect your research, and build with confidence.
        </p>
        <div className="mt-8">
          <SignInButtons />
        </div>
      </div>
    </div>
  );
}

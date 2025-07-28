// src/components/auth-components.tsx

'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function SignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
      title="Sign Out"
    >
      <LogOut size={20} />
    </button>
  );
}

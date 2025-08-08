'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

interface FeedbackButtonProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function FeedbackButton({ isOpen, onOpenChange }: FeedbackButtonProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const modalOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const handleOpenChange = onOpenChange || setInternalIsOpen;

  return (
    <>
      <button
        onClick={() => handleOpenChange(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105 z-40"
        title="Send Feedback (Cmd+Shift+F)"
        aria-label="Send Feedback"
      >
        <MessageCircle size={24} />
      </button>

      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => handleOpenChange(false)}
      />
    </>
  );
}
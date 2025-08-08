'use client';

import React, { useState } from 'react';
import { X, Send, Bug, Lightbulb, TrendingUp, HelpCircle, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { FeedbackType } from '@prisma/client';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const feedbackTypes = [
  { value: 'BUG_REPORT', label: 'Bug Report', icon: Bug, color: 'text-red-500' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-500' },
  { value: 'IMPROVEMENT', label: 'Improvement', icon: TrendingUp, color: 'text-blue-500' },
  { value: 'QUESTION', label: 'Question', icon: HelpCircle, color: 'text-purple-500' },
  { value: 'OTHER', label: 'Other', icon: MessageCircle, color: 'text-gray-500' },
];

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>('IMPROVEMENT');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please provide a message');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          subject: subject.trim() || null,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        toast.success('Feedback submitted successfully!');
        setType('IMPROVEMENT');
        setSubject('');
        setMessage('');
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Send Feedback</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type of Feedback
            </label>
            <div className="grid grid-cols-1 gap-2">
              {feedbackTypes.map((feedbackType) => {
                const IconComponent = feedbackType.icon;
                return (
                  <button
                    key={feedbackType.value}
                    type="button"
                    onClick={() => setType(feedbackType.value as FeedbackType)}
                    className={`flex items-center p-3 border rounded-lg text-left transition-colors ${
                      type === feedbackType.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    disabled={isSubmitting}
                  >
                    <IconComponent size={16} className={`mr-2 ${feedbackType.color}`} />
                    <span className="text-sm font-medium">{feedbackType.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject (Optional) */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Brief summary of your feedback"
              disabled={isSubmitting}
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Please provide details about your feedback..."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
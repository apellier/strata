'use client';

import React, { useState } from 'react';
import { Target, BookOpen, Lightbulb, ArrowRight, Play } from 'lucide-react';

interface EnhancedEmptyStateProps {
  onCreateOutcome: () => void;
  onCreateOpportunity: () => void;
  onOpenTemplates: () => void;
  onStartTutorial: () => void;
}

export default function EnhancedEmptyState({ 
  onCreateOutcome, 
  onCreateOpportunity, 
  onOpenTemplates, 
  onStartTutorial 
}: EnhancedEmptyStateProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center max-w-lg px-6 pointer-events-auto">
        {/* Main Empty State */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Target size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Start Your Discovery Journey?</h3>
          <p className="text-gray-600 leading-relaxed">
            Begin by defining your business outcome, then explore the opportunities that could help you achieve it.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 mb-6">
          <button
            onClick={onCreateOutcome}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Target size={20} />
            <span className="font-medium">Create Your First Outcome</span>
            <ArrowRight size={16} />
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onOpenTemplates}
              className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Lightbulb size={16} />
              <span className="text-sm font-medium">Use Template</span>
            </button>
            
            <button
              onClick={onStartTutorial}
              className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Play size={16} />
              <span className="text-sm font-medium">Quick Tutorial</span>
            </button>
          </div>
        </div>

        {/* Help Toggle */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showHelp ? 'Hide help' : 'New to opportunity solution trees?'}
          </button>
        </div>

        {/* Expandable Help */}
        {showHelp && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <BookOpen size={16} className="mr-2" />
              How Opportunity Solution Trees Work
            </h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Outcomes</strong> are the business results you want to achieve
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Opportunities</strong> are customer problems that could drive those outcomes
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Solutions</strong> are ways you might address those opportunities
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-700">
                💡 <strong>Tip:</strong> Start with outcomes, then work your way down the tree to maintain focus on customer value.
              </p>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts */}
        <div className="mt-6 text-xs text-gray-500">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1">
              <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">U</kbd>
              <span>New Outcome</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Cmd+K</kbd>
              <span>Command Palette</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { X, BookOpen, Lightbulb, Play, ArrowRight, Target, Users, Zap } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPathSelect: (path: 'guided' | 'template' | 'explore') => void;
}

interface OnboardingPath {
  id: 'guided' | 'template' | 'explore';
  title: string;
  description: string;
  icon: React.ReactNode;
  timeEstimate: string;
  benefits: string[];
  recommended?: boolean;
}

export default function WelcomeModal({ isOpen, onClose, onPathSelect }: WelcomeModalProps) {
  const [selectedPath, setSelectedPath] = useState<'guided' | 'template' | 'explore' | null>(null);

  const paths: OnboardingPath[] = [
    {
      id: 'guided',
      title: "I'm new to product discovery",
      description: "Learn the fundamentals with an interactive tutorial that walks you through creating your first opportunity solution tree.",
      icon: <BookOpen size={24} />,
      timeEstimate: "5 minutes",
      benefits: [
        "Learn Teresa Torres' methodology",
        "Step-by-step guidance",
        "Interactive examples",
        "Best practices tips"
      ],
      recommended: true
    },
    {
      id: 'template',
      title: "I know opportunity solution trees",
      description: "Jump right in with pre-built templates tailored to common product scenarios and use cases.",
      icon: <Lightbulb size={24} />,
      timeEstimate: "2 minutes",
      benefits: [
        "Industry-specific templates",
        "Pre-populated examples",
        "Quick customization",
        "Proven frameworks"
      ]
    },
    {
      id: 'explore',
      title: "I want to explore on my own",
      description: "Start with a blank canvas and discover Strata's features at your own pace with contextual hints.",
      icon: <Play size={24} />,
      timeEstimate: "Flexible",
      benefits: [
        "Complete freedom",
        "Self-guided exploration",
        "Contextual help",
        "Skip anytime"
      ]
    }
  ];

  const handlePathSelect = (path: 'guided' | 'template' | 'explore') => {
    setSelectedPath(path);
  };

  const handleContinue = () => {
    if (selectedPath) {
      onPathSelect(selectedPath);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Strata! 🎉</h2>
            <p className="text-gray-600 mt-1">Let&apos;s get you started with continuous product discovery</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Choose your path to get started:</h3>
            <p className="text-gray-600 text-sm">Don&apos;t worry, you can always change your approach later.</p>
          </div>

          {/* Path Options */}
          <div className="grid gap-4 mb-6">
            {paths.map((path) => (
              <button
                key={path.id}
                onClick={() => handlePathSelect(path.id)}
                className={`text-left p-4 border-2 rounded-lg transition-all ${
                  selectedPath === path.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                } ${path.recommended ? 'ring-2 ring-blue-200' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    path.recommended 
                      ? 'bg-blue-100 text-blue-600' 
                      : selectedPath === path.id 
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {path.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{path.title}</h4>
                      {path.recommended && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                          Recommended
                        </span>
                      )}
                      <span className="text-xs text-gray-500">• {path.timeEstimate}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {path.description}
                    </p>

                    {/* Benefits */}
                    <div className="grid grid-cols-2 gap-2">
                      {path.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span className="text-xs text-gray-600">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div className="flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedPath === path.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    } flex items-center justify-center`}>
                      {selectedPath === path.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Continue Button - Prominently positioned */}
          {selectedPath && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    Ready to start with &quot;{paths.find(p => p.id === selectedPath)?.title}&quot;?
                  </h4>
                  <p className="text-sm text-blue-700">
                    {paths.find(p => p.id === selectedPath)?.timeEstimate} to get started
                  </p>
                </div>
                <button
                  onClick={handleContinue}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 font-medium transition-colors shadow-sm"
                >
                  <span>Get started</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* User Type Badges */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Popular with:</h4>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                <Target size={14} className="text-blue-600" />
                <span className="text-xs text-gray-700">Product Managers</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                <Users size={14} className="text-purple-600" />
                <span className="text-xs text-gray-700">UX Researchers</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                <Zap size={14} className="text-orange-600" />
                <span className="text-xs text-gray-700">Startup Founders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Always visible */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Skip for now
          </button>
          
          {!selectedPath && (
            <div className="text-sm text-gray-500">
              Select a path above to continue
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
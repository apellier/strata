'use client';

import React, { useState } from 'react';
import { X, ArrowRight, Clock, Star, ChevronLeft } from 'lucide-react';
import { Template, templates, getTemplatesByCategory } from '@/lib/templates';

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (template: Template) => void;
  onBack: () => void;
}

const categoryLabels = {
  saas: 'SaaS Products',
  ecommerce: 'E-commerce',
  mobile: 'Mobile Apps',
  b2b: 'B2B Products'
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

export default function TemplateGallery({ isOpen, onClose, onTemplateSelect, onBack }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : getTemplatesByCategory(selectedCategory as Template['category']);

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'saas', label: 'SaaS' },
    { id: 'ecommerce', label: 'E-commerce' },
    { id: 'mobile', label: 'Mobile' },
    { id: 'b2b', label: 'B2B' }
  ];

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
              <p className="text-gray-600 mt-1">Start with proven discovery patterns</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 h-96">
          {/* Template List */}
          <div className="w-2/3 p-6 overflow-y-auto">
            {/* Category Filter */}
            <div className="flex space-x-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`text-left p-4 border-2 rounded-lg transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-2xl">
                      {template.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[template.difficulty]}`}>
                            {template.difficulty}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                        {template.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{template.timeToComplete}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star size={12} />
                          <span>{template.nodes.length} nodes</span>
                        </div>
                        <span>{categoryLabels[template.category]}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No templates found for this category.</p>
              </div>
            )}
          </div>

          {/* Template Preview */}
          <div className="w-1/3 border-l bg-gray-50 p-6 overflow-y-auto">
            {selectedTemplate ? (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">{selectedTemplate.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedTemplate.name}</h3>
                    <p className="text-sm text-gray-600">{categoryLabels[selectedTemplate.category]}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    {selectedTemplate.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{selectedTemplate.timeToComplete}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[selectedTemplate.difficulty]}`}>
                      {selectedTemplate.difficulty}
                    </span>
                  </div>
                </div>

                {/* Template Structure Preview */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">What you&apos;ll get:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">
                        {selectedTemplate.nodes.filter(n => n.type === 'outcome').length} outcome
                        {selectedTemplate.nodes.filter(n => n.type === 'outcome').length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">
                        {selectedTemplate.nodes.filter(n => n.type === 'opportunity').length} opportunit
                        {selectedTemplate.nodes.filter(n => n.type === 'opportunity').length !== 1 ? 'ies' : 'y'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">
                        {selectedTemplate.nodes.filter(n => n.type === 'solution').length} solution
                        {selectedTemplate.nodes.filter(n => n.type === 'solution').length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {selectedTemplate.sampleInterview && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-700">Sample interview data</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sample Interview */}
                {selectedTemplate.sampleInterview && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-2">Sample interview:</h4>
                    <div className="bg-white rounded-lg p-3 border text-sm">
                      <div className="font-medium text-gray-900 mb-1">
                        {selectedTemplate.sampleInterview.interviewee}
                      </div>
                      <p className="text-gray-600 text-xs mb-2">
                        {selectedTemplate.sampleInterview.notes}
                      </p>
                      <div className="text-xs text-gray-500">
                        {selectedTemplate.sampleInterview.evidence.length} evidence items
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUseTemplate}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 font-medium transition-colors"
                >
                  <span>Use this template</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Select a template to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
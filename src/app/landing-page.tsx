// src/app/landing-page.tsx

'use client';

import React from 'react';
import { SignInButtons } from '@/components/auth-components';
import { ArrowRight, Users, Target, TrendingUp, CheckCircle2, BookOpen, Lightbulb, BarChart3 } from 'lucide-react';

// Opportunity Solution Tree Visualization Component
function OSTVisualization() {
  return (
    <div className="relative max-w-2xl mx-auto my-12 p-6">
      <div className="text-center mb-8">
        <h3 id="visualization-heading" className="text-lg font-semibold text-[var(--text-primary)] mb-2">Visualize Your Product Strategy</h3>
        <p className="text-[var(--text-secondary)] text-sm">See how Strata helps you map opportunities to solutions</p>
      </div>
      
      {/* Simplified OST Diagram */}
      <div className="space-y-4" role="img" aria-labelledby="visualization-heading" aria-describedby="ost-description">
        {/* Outcome Layer */}
        <div className="flex justify-center">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-6 py-3 text-center max-w-xs">
            <div className="flex items-center justify-center gap-2 text-blue-700 font-medium">
              <Target size={16} />
              <span className="text-sm">Increase User Retention</span>
            </div>
          </div>
        </div>
        
        {/* Connection Lines */}
        <div className="flex justify-center">
          <div className="w-px h-6 bg-gray-300"></div>
        </div>
        
        {/* Opportunity Layer */}
        <div className="flex justify-center space-x-8">
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg px-4 py-2 text-center max-w-32">
            <div className="text-orange-700 font-medium text-xs">Onboarding Issues</div>
          </div>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg px-4 py-2 text-center max-w-32">
            <div className="text-orange-700 font-medium text-xs">Feature Discovery</div>
          </div>
        </div>
        
        {/* Connection Lines */}
        <div className="flex justify-center space-x-8">
          <div className="w-px h-6 bg-gray-300"></div>
          <div className="w-px h-6 bg-gray-300"></div>
        </div>
        
        {/* Solution Layer */}
        <div className="flex justify-center space-x-4">
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1 text-center max-w-24">
            <div className="text-green-700 font-medium text-xs">Tutorial</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1 text-center max-w-24">
            <div className="text-green-700 font-medium text-xs">Tooltips</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1 text-center max-w-24">
            <div className="text-green-700 font-medium text-xs">Search</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1 text-center max-w-24">
            <div className="text-green-700 font-medium text-xs">Dashboard</div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <p id="ost-description" className="text-[var(--text-secondary)] text-sm">Connect research insights to strategic outcomes through a visual hierarchy: outcomes at the top, opportunities in the middle, and solutions at the bottom</p>
      </div>
    </div>
  );
}

// Social Proof Component
function SocialProof() {
  const testimonials = [
    {
      quote: "Strata transformed how our team approaches discovery. We finally have a clear path from customer insights to product decisions.",
      author: "Sarah Chen",
      role: "Senior Product Manager",
      company: "TechCorp"
    },
    {
      quote: "The OST visualization makes it easy to communicate our strategy to stakeholders and keep the team aligned.",
      author: "Marcus Rodriguez",
      role: "UX Research Lead",
      company: "StartupXYZ"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Trusted by Product Teams Worldwide
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Join thousands of product professionals who use Strata to make better decisions
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6">
              <p className="text-[var(--text-primary)] mb-4 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div>
                <div className="font-semibold text-[var(--text-primary)]">{testimonial.author}</div>
                <div className="text-[var(--text-secondary)] text-sm">{testimonial.role}, {testimonial.company}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-[var(--text-secondary)]">
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-green-600" />
              <span className="text-sm">Based on Teresa Torres&apos; methodology</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-blue-600" />
              <span className="text-sm">1000+ active product teams</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// User Personas Section
function UserPersonas() {
  const personas = [
    {
      icon: <Target size={20} />,
      title: "Product Managers",
      description: "Connect customer insights to product strategy with clear opportunity mapping",
      benefits: ["Strategic alignment", "Stakeholder communication", "Decision frameworks"]
    },
    {
      icon: <Users size={20} />,
      title: "UX Researchers",
      description: "Transform research findings into actionable product opportunities",
      benefits: ["Research synthesis", "Impact visualization", "Cross-team collaboration"]
    },
    {
      icon: <TrendingUp size={20} />,
      title: "Startup Founders",
      description: "Make data-driven product decisions while scaling your team",
      benefits: ["Fast iteration", "Resource optimization", "Growth alignment"]
    }
  ];

  return (
    <section className="py-16 bg-[var(--background-alt)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Built for Modern Product Teams
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Whether you&apos;re practicing continuous discovery or just getting started, Strata adapts to your workflow
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {personas.map((persona, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-[var(--accent-blue)]">{persona.icon}</div>
                <h3 className="font-semibold text-[var(--text-primary)]">{persona.title}</h3>
              </div>
              <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
                {persona.description}
              </p>
              <ul className="space-y-2">
                {persona.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-center space-x-2 text-sm">
                    <CheckCircle2 size={14} className="text-green-600" />
                    <span className="text-[var(--text-secondary)]">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Feature Highlights
function FeatureHighlights() {
  const features = [
    {
      icon: <BookOpen size={24} />,
      title: "Research Integration",
      description: "Connect interview insights directly to your opportunity solution tree"
    },
    {
      icon: <Lightbulb size={24} />,
      title: "Smart Canvas",
      description: "Visualize the relationships between outcomes, opportunities, and solutions"
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Impact Tracking",
      description: "Measure and validate your product decisions with built-in experimentation"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Everything You Need for Continuous Discovery
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Comprehensive tools that follow Teresa Torres&apos; proven methodology
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-[var(--accent-blue-light)] rounded-xl text-[var(--accent-blue)]">
                  {feature.icon}
                </div>
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50" role="banner">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Credibility Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-[var(--accent-blue)] px-4 py-2 rounded-full text-sm font-medium mb-8">
              <BookOpen size={16} />
              <span>Based on Teresa Torres&apos; Continuous Discovery Methodology</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
              Turn Customer Insights Into 
              <span className="text-[var(--accent-blue)]"> Product Strategy</span>
            </h1>
            
            <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-3xl mx-auto leading-relaxed">
              Strata is the intelligent canvas for product discovery. Map your opportunities, 
              connect your research, and build with confidence using proven continuous discovery practices.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
              <div className="w-full sm:w-auto max-w-sm">
                <SignInButtons />
              </div>
              <div className="text-[var(--text-secondary)] text-sm">
                Free to start • No credit card required
              </div>
            </div>
            
            {/* Quick Benefits */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-8 text-[var(--text-secondary)] text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-green-600" />
                <span>Structured discovery process</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-green-600" />
                <span>Research-backed decisions</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-green-600" />
                <span>Team alignment</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* OST Visualization */}
      <section className="py-16 bg-white border-t border-[var(--border)]" aria-labelledby="visualization-heading">
        <div className="max-w-6xl mx-auto px-6">
          <OSTVisualization />
        </div>
      </section>

      {/* User Personas */}
      <UserPersonas />

      {/* Feature Highlights */}
      <FeatureHighlights />

      {/* Social Proof */}
      <SocialProof />

      {/* CTA Section */}
      <section className="py-16 bg-[var(--accent-blue)] text-white" aria-labelledby="cta-heading">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 id="cta-heading" className="text-3xl font-bold mb-4">
            Ready to Transform Your Product Discovery?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join product teams who&apos;ve discovered the power of structured, research-driven decision making.
          </p>
          
          <div className="max-w-sm mx-auto">
            <div className="bg-white p-1 rounded-lg">
              <SignInButtons />
            </div>
          </div>
          
          <p className="text-blue-200 text-sm mt-6">
            Start mapping your opportunities in minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400" role="contentinfo">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-4">
            <h3 className="text-white font-semibold text-lg">Strata</h3>
            <p className="text-sm">Continuous Product Discovery Made Simple</p>
          </div>
          <div className="text-xs">
            Built with ❤️ for product teams practicing continuous discovery
          </div>
        </div>
      </footer>
    </div>
  );
}

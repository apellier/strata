// Template system for onboarding new users

export interface TemplateNode {
  id: string;
  type: 'outcome' | 'opportunity' | 'solution';
  label: string;
  description?: string;
  x_position: number;
  y_position: number;
  parentId?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'saas' | 'ecommerce' | 'mobile' | 'b2b';
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToComplete: string;
  nodes: TemplateNode[];
  sampleInterview?: {
    interviewee: string;
    notes: string;
    evidence: Array<{
      type: 'VERBATIM' | 'PAIN_POINT' | 'DESIRE' | 'INSIGHT';
      content: string;
    }>;
  };
}

export const templates: Template[] = [
  {
    id: 'saas-user-retention',
    name: 'SaaS User Retention',
    description: 'Improve user retention for your SaaS product with proven discovery patterns.',
    category: 'saas',
    icon: '🔄',
    difficulty: 'beginner',
    timeToComplete: '10 minutes',
    nodes: [
      {
        id: 'outcome-1',
        type: 'outcome',
        label: 'Increase User Retention by 15%',
        description: 'Reduce churn and increase monthly active users',
        x_position: 400,
        y_position: 100
      },
      {
        id: 'opp-1',
        type: 'opportunity',
        label: 'Onboarding Confusion',
        description: 'Users struggle to understand value during first use',
        x_position: 200,
        y_position: 300,
        parentId: 'outcome-1'
      },
      {
        id: 'opp-2',
        type: 'opportunity',
        label: 'Feature Discovery Issues',
        description: 'Users don\'t discover key features that drive retention',
        x_position: 600,
        y_position: 300,
        parentId: 'outcome-1'
      },
      {
        id: 'sol-1',
        type: 'solution',
        label: 'Interactive Tutorial',
        x_position: 100,
        y_position: 500,
        parentId: 'opp-1'
      },
      {
        id: 'sol-2',
        type: 'solution',
        label: 'Progress Indicators',
        x_position: 300,
        y_position: 500,
        parentId: 'opp-1'
      },
      {
        id: 'sol-3',
        type: 'solution',
        label: 'Feature Highlights',
        x_position: 500,
        y_position: 500,
        parentId: 'opp-2'
      },
      {
        id: 'sol-4',
        type: 'solution',
        label: 'Usage Analytics Dashboard',
        x_position: 700,
        y_position: 500,
        parentId: 'opp-2'
      }
    ],
    sampleInterview: {
      interviewee: 'Sarah Chen, Marketing Manager',
      notes: 'Discussion about user onboarding experience and feature adoption challenges.',
      evidence: [
        {
          type: 'PAIN_POINT',
          content: 'I signed up but couldn\'t figure out how to get started. The interface was overwhelming.'
        },
        {
          type: 'INSIGHT',
          content: 'Users want to see immediate value, not just a list of features.'
        },
        {
          type: 'DESIRE',
          content: 'I wish there was a way to see what other successful users are doing.'
        }
      ]
    }
  },
  {
    id: 'ecommerce-conversion',
    name: 'E-commerce Conversion',
    description: 'Optimize your e-commerce funnel and increase conversion rates.',
    category: 'ecommerce',
    icon: '🛒',
    difficulty: 'intermediate',
    timeToComplete: '12 minutes',
    nodes: [
      {
        id: 'outcome-2',
        type: 'outcome',
        label: 'Increase Conversion Rate by 25%',
        description: 'Improve checkout completion and reduce cart abandonment',
        x_position: 400,
        y_position: 100
      },
      {
        id: 'opp-3',
        type: 'opportunity',
        label: 'Cart Abandonment',
        description: 'High percentage of users leave during checkout',
        x_position: 200,
        y_position: 300,
        parentId: 'outcome-2'
      },
      {
        id: 'opp-4',
        type: 'opportunity',
        label: 'Product Discovery',
        description: 'Users can\'t find the products they\'re looking for',
        x_position: 600,
        y_position: 300,
        parentId: 'outcome-2'
      },
      {
        id: 'sol-5',
        type: 'solution',
        label: 'Simplified Checkout',
        x_position: 100,
        y_position: 500,
        parentId: 'opp-3'
      },
      {
        id: 'sol-6',
        type: 'solution',
        label: 'Guest Checkout Option',
        x_position: 300,
        y_position: 500,
        parentId: 'opp-3'
      },
      {
        id: 'sol-7',
        type: 'solution',
        label: 'Enhanced Search',
        x_position: 500,
        y_position: 500,
        parentId: 'opp-4'
      },
      {
        id: 'sol-8',
        type: 'solution',
        label: 'Smart Recommendations',
        x_position: 700,
        y_position: 500,
        parentId: 'opp-4'
      }
    ],
    sampleInterview: {
      interviewee: 'Mike Rodriguez, Online Shopper',
      notes: 'Interview about e-commerce shopping experience and pain points.',
      evidence: [
        {
          type: 'PAIN_POINT',
          content: 'The checkout process has too many steps. I often give up halfway through.'
        },
        {
          type: 'VERBATIM',
          content: 'Why do I need to create an account just to buy something?'
        },
        {
          type: 'DESIRE',
          content: 'I want to find products similar to what I\'m looking at without scrolling forever.'
        }
      ]
    }
  },
  {
    id: 'mobile-app-engagement',
    name: 'Mobile App Engagement',
    description: 'Drive user engagement and increase session length in your mobile app.',
    category: 'mobile',
    icon: '📱',
    difficulty: 'beginner',
    timeToComplete: '8 minutes',
    nodes: [
      {
        id: 'outcome-3',
        type: 'outcome',
        label: 'Increase Daily Active Users by 30%',
        description: 'More users engaging with the app daily',
        x_position: 400,
        y_position: 100
      },
      {
        id: 'opp-5',
        type: 'opportunity',
        label: 'Push Notification Fatigue',
        description: 'Users disable notifications due to irrelevant messages',
        x_position: 200,
        y_position: 300,
        parentId: 'outcome-3'
      },
      {
        id: 'opp-6',
        type: 'opportunity',
        label: 'Content Relevance',
        description: 'Users don\'t find content that interests them',
        x_position: 600,
        y_position: 300,
        parentId: 'outcome-3'
      },
      {
        id: 'sol-9',
        type: 'solution',
        label: 'Smart Notifications',
        x_position: 100,
        y_position: 500,
        parentId: 'opp-5'
      },
      {
        id: 'sol-10',
        type: 'solution',
        label: 'Notification Preferences',
        x_position: 300,
        y_position: 500,
        parentId: 'opp-5'
      },
      {
        id: 'sol-11',
        type: 'solution',
        label: 'Personalized Feed',
        x_position: 500,
        y_position: 500,
        parentId: 'opp-6'
      },
      {
        id: 'sol-12',
        type: 'solution',
        label: 'User Interest Tags',
        x_position: 700,
        y_position: 500,
        parentId: 'opp-6'
      }
    ],
    sampleInterview: {
      interviewee: 'Jessica Park, App User',
      notes: 'Discussion about mobile app usage patterns and engagement.',
      evidence: [
        {
          type: 'PAIN_POINT',
          content: 'I get too many notifications that aren\'t relevant to me, so I turned them all off.'
        },
        {
          type: 'INSIGHT',
          content: 'Users want control over what they receive and when.'
        },
        {
          type: 'DESIRE',
          content: 'I want the app to learn what I like and show me more of that.'
        }
      ]
    }
  }
];

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: Template['category']): Template[] => {
  return templates.filter(template => template.category === category);
};

export const getTemplatesByDifficulty = (difficulty: Template['difficulty']): Template[] => {
  return templates.filter(template => template.difficulty === difficulty);
};
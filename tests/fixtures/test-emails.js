/**
 * Test corpus for scope creep detection validation
 * 10 scope creep emails + 10 normal emails
 */

export const SCOPE_CREEP_EMAILS = [
  {
    id: 'sc1',
    sender: 'client@example.com',
    text: 'Hi! The login page looks great. Also, can you add social media login options? It would be really convenient for users.',
    expectedTrigger: 'also + action',
    expectedWeight: 9
  },
  {
    id: 'sc2',
    sender: 'project.manager@company.com',
    text: 'Good progress on the dashboard. Additionally, we need real-time data updates. Please implement WebSocket connections.',
    expectedTrigger: 'also + action',
    expectedWeight: 9
  },
  {
    id: 'sc3',
    sender: 'ceo@startup.com',
    text: 'The app is coming along nicely. One more thing - can you add a notification system? Push notifications would be ideal.',
    expectedTrigger: 'one more thing',
    expectedWeight: 8
  },
  {
    id: 'sc4',
    sender: 'marketing@brand.com',
    text: 'Love the new design! While you\'re at it, could you update our email templates to match?',
    expectedTrigger: 'while you\'re at it',
    expectedWeight: 7
  },
  {
    id: 'sc5',
    sender: 'founder@tech.io',
    text: 'The checkout process works well. By the way, can we add support for cryptocurrency payments?',
    expectedTrigger: 'by the way',
    expectedWeight: 6
  },
  {
    id: 'sc6',
    sender: 'product@app.com',
    text: 'Everything looks good so far. I forgot to mention we need multi-language support. Can you add i18n?',
    expectedTrigger: 'forgot to mention',
    expectedWeight: 5
  },
  {
    id: 'sc7',
    sender: 'client@agency.net',
    text: 'Quick favor - can you adjust the color scheme to match our new branding guidelines?',
    expectedTrigger: 'quick favor',
    expectedWeight: 5
  },
  {
    id: 'sc8',
    sender: 'manager@corp.com',
    text: 'Actually, let\'s redesign the homepage completely instead of just updating it.',
    expectedTrigger: 'actually/instead',
    expectedWeight: 6
  },
  {
    id: 'sc9',
    sender: 'owner@shop.com',
    text: 'The cart functionality is perfect. Oh and could you add a wishlist feature too?',
    expectedTrigger: 'oh and',
    expectedWeight: 5
  },
  {
    id: 'sc10',
    sender: 'director@firm.com',
    text: 'Great work on the reporting module. Another thing - we need PDF export functionality for all reports.',
    expectedTrigger: 'another thing',
    expectedWeight: 6
  }
];

export const NORMAL_EMAILS = [
  {
    id: 'n1',
    sender: 'client@example.com',
    text: 'Also, thank you so much for your patience with all our requests. The team really appreciates your work.',
    shouldMatch: false
  },
  {
    id: 'n2',
    sender: 'manager@company.com',
    text: 'Additionally, I wanted to let you know that everyone is impressed with your progress.',
    shouldMatch: false
  },
  {
    id: 'n3',
    sender: 'ceo@startup.com',
    text: 'By the way, when do you think we can schedule the demo for investors?',
    shouldMatch: false
  },
  {
    id: 'n4',
    sender: 'designer@agency.com',
    text: 'One more thing - great job on implementing the design exactly as specified!',
    shouldMatch: false
  },
  {
    id: 'n5',
    sender: 'product@tech.com',
    text: 'While you\'re at it, keep up the excellent work. The client loves what they\'re seeing.',
    shouldMatch: false
  },
  {
    id: 'n6',
    sender: 'founder@app.io',
    text: 'I forgot to mention earlier that the board approved your invoice. Payment coming soon.',
    shouldMatch: false
  },
  {
    id: 'n7',
    sender: 'client@brand.net',
    text: 'Actually, I think the current design is perfect. Let\'s not change anything.',
    shouldMatch: false
  },
  {
    id: 'n8',
    sender: 'pm@corp.com',
    text: 'Thanks for the update. Also, the timeline you proposed works perfectly for us.',
    shouldMatch: false
  },
  {
    id: 'n9',
    sender: 'owner@shop.com',
    text: 'Quick question - are we still on track for the Friday deadline?',
    shouldMatch: false
  },
  {
    id: 'n10',
    sender: 'director@firm.com',
    text: 'Everything is looking fantastic. By the way, the stakeholders are very pleased with the progress.',
    shouldMatch: false
  }
];

/**
 * Mixed conversation threads for integration testing
 */
export const CONVERSATION_THREADS = [
  {
    id: 'thread1',
    messages: [
      {
        sender: 'client@example.com',
        text: 'Hi! Just reviewed the latest build. The login functionality works great.',
        shouldMatch: false
      },
      {
        sender: 'client@example.com',
        text: 'Also, can you add password reset functionality? Users will definitely need that.',
        shouldMatch: true,
        expectedTrigger: 'also + action'
      },
      {
        sender: 'you@freelance.com',
        text: 'Sure, I can add password reset. That will take about 4 additional hours.',
        shouldMatch: false
      },
      {
        sender: 'client@example.com',
        text: 'Sounds good. Oh and while you\'re at it, add two-factor authentication too.',
        shouldMatch: true,
        expectedTrigger: 'while you\'re at it'
      }
    ]
  },
  {
    id: 'thread2',
    messages: [
      {
        sender: 'manager@company.com',
        text: 'The dashboard looks excellent. Great work on the charts.',
        shouldMatch: false
      },
      {
        sender: 'manager@company.com',
        text: 'By the way, when will the mobile version be ready?',
        shouldMatch: false // Question, not action request
      },
      {
        sender: 'you@freelance.com',
        text: 'Mobile version is scheduled for phase 2, starting next month.',
        shouldMatch: false
      },
      {
        sender: 'manager@company.com',
        text: 'Actually, can we add mobile support to phase 1 instead? It\'s becoming urgent.',
        shouldMatch: true,
        expectedTrigger: 'actually/instead'
      }
    ]
  }
];

/**
 * Edge cases for testing
 */
export const EDGE_CASES = [
  {
    id: 'edge1',
    text: 'ALSO, CAN YOU ADD THIS FEATURE RIGHT NOW???',
    shouldMatch: true,
    description: 'All caps with punctuation'
  },
  {
    id: 'edge2',
    text: 'also\n\n\ncan you add\n\nthis feature',
    shouldMatch: true,
    description: 'Multiple line breaks'
  },
  {
    id: 'edge3',
    text: '> Also, can you add this?\nNo, that was already discussed.',
    shouldMatch: false,
    description: 'Quoted text (email reply)'
  },
  {
    id: 'edge4',
    text: 'Can you add @mentions and #hashtags?',
    shouldMatch: true,
    description: 'Special characters'
  },
  {
    id: 'edge5',
    text: 'También, ¿puedes añadir esto?',
    shouldMatch: false,
    description: 'Non-English (should not match)'
  },
  {
    id: 'edge6',
    text: 'Also can you add this Also one more thing Additionally fix that',
    shouldMatch: true,
    description: 'Multiple triggers in one message'
  }
];
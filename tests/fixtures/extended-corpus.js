/**
 * Extended test corpus for accuracy validation (T030)
 * 50 emails total: 25 scope creep + 25 normal
 */

export const EXTENDED_SCOPE_CREEP = [
  // High confidence patterns
  'Also, can you add password recovery to the login system?',
  'Additionally, please implement OAuth integration with Google.',
  'One more thing - we need email verification for new users.',
  'Forgot to mention, the dashboard needs real-time updates.',
  'I forgot to tell you we need CSV export functionality.',

  // Medium confidence patterns
  'While you\'re at it, could you fix the mobile layout?',
  'By the way, can we add dark mode to the settings?',
  'Quick favor - adjust the font sizes for accessibility.',
  'Actually, let\'s redesign the navigation menu instead.',
  'Oh and please add keyboard shortcuts for power users.',

  // Context-dependent patterns
  'Another thing - we need API rate limiting.',
  'Just realized we need two-factor authentication.',
  'Would be nice to have automatic backups.',
  'Can you also include data encryption?',
  'Please add user activity logging.',

  // Urgent additions
  'Also, we urgently need GDPR compliance features.',
  'Additionally, ASAP add payment processing.',
  'One more thing - need this today: SSO integration.',
  'BTW, immediately add user role management.',
  'Forgot to mention - add analytics tracking right away.',

  // Compound requests
  'Also add search functionality. Additionally, implement filters.',
  'While you\'re at it, fix the bugs and add new features.',
  'By the way, can you add reports? Oh and export to PDF too.',
  'Quick favor - update UI. Actually, redesign everything.',
  'One more thing: notifications. Also, email alerts.'
];

export const EXTENDED_NORMAL = [
  // Gratitude and appreciation
  'Also, thank you for the quick turnaround.',
  'Additionally, I appreciate your attention to detail.',
  'By the way, great work on the latest release.',
  'One more thing - you\'re doing an amazing job!',
  'While you\'re at it, keep being awesome.',

  // Status updates
  'Also, everything is on schedule.',
  'Additionally, the client approved the design.',
  'By the way, the project is progressing well.',
  'Forgot to mention, the payment was processed.',
  'One more thing - the team is happy with progress.',

  // Questions without actions
  'Also, when is the next meeting?',
  'By the way, who is the project manager?',
  'Additionally, what time zone are you in?',
  'One more thing - where are the docs stored?',
  'BTW, how long have you been coding?',

  // Confirmations and acknowledgments
  'Also, I received your invoice.',
  'Additionally, the contract looks good.',
  'By the way, I understand the timeline.',
  'One more thing - I agree with your approach.',
  'Actually, your solution is perfect as is.',

  // General comments
  'Also excited about the launch.',
  'Additionally looking forward to the demo.',
  'By the way, the stakeholders are impressed.',
  'One more thing - the design is exactly right.',
  'Forgot to mention earlier - no changes needed.'
];

/**
 * Edge case emails for robust testing
 */
export const EDGE_CASE_CORPUS = [
  // Mixed signals
  {
    text: 'Thanks for the update. Also, can you add reporting features?',
    shouldMatch: true,
    reason: 'Gratitude followed by scope creep'
  },
  {
    text: 'Also, I think we should add... actually, nevermind.',
    shouldMatch: false,
    reason: 'Request cancelled mid-sentence'
  },
  {
    text: 'Can you check if we need to add more features?',
    shouldMatch: false,
    reason: 'Asking about possibility, not requesting'
  },
  {
    text: 'The client asked: "Can you add social login?"',
    shouldMatch: true,
    reason: 'Quoted request is still a request'
  },
  {
    text: 'Do NOT add any more features. Also, stop the current work.',
    shouldMatch: false,
    reason: 'Negative request'
  }
];

/**
 * Industry-specific test cases
 */
export const DOMAIN_SPECIFIC_CORPUS = {
  ecommerce: [
    'Also, integrate with Stripe for payments.',
    'Additionally, add inventory management.',
    'One more thing - implement wish lists.'
  ],
  saas: [
    'By the way, add multi-tenancy support.',
    'Forgot to mention, we need webhooks.',
    'Quick favor - add API documentation.'
  ],
  mobile: [
    'While you\'re at it, add push notifications.',
    'Also, implement offline mode.',
    'BTW, add biometric authentication.'
  ]
};

/**
 * Calculate corpus statistics
 */
export function getCorpusStats() {
  return {
    scopeCreep: {
      total: EXTENDED_SCOPE_CREEP.length,
      highConfidence: EXTENDED_SCOPE_CREEP.filter(t =>
        /^(also|additionally|one more thing|forgot to mention)/i.test(t)
      ).length,
      mediumConfidence: EXTENDED_SCOPE_CREEP.filter(t =>
        /^(while you|by the way|quick favor|actually|oh and)/i.test(t)
      ).length,
      urgent: EXTENDED_SCOPE_CREEP.filter(t =>
        /\b(urgent|asap|immediately|today|right away)\b/i.test(t)
      ).length
    },
    normal: {
      total: EXTENDED_NORMAL.length,
      gratitude: EXTENDED_NORMAL.filter(t => /thank|appreciat/i.test(t)).length,
      questions: EXTENDED_NORMAL.filter(t => /\?/.test(t)).length,
      status: EXTENDED_NORMAL.filter(t =>
        /(on schedule|approved|progressing|processed)/i.test(t)
      ).length
    }
  };
}
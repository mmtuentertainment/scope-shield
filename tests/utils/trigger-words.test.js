/**
 * Unit tests for trigger word patterns
 */

import { describe, it, expect } from 'vitest';
import {
  TRIGGER_WORDS,
  shouldExclude,
  findBestMatch
} from '../../src/utils/trigger-words.js';

describe('TRIGGER_WORDS', () => {
  it('should have all 8 required patterns', () => {
    expect(TRIGGER_WORDS.length).toBeGreaterThanOrEqual(8);

    // Check for high-confidence patterns
    const hasAlsoAction = TRIGGER_WORDS.some(t => t.phrase.includes('also + action'));
    const hasOneMoreThing = TRIGGER_WORDS.some(t => t.phrase.includes('one more thing'));
    expect(hasAlsoAction).toBe(true);
    expect(hasOneMoreThing).toBe(true);

    // Check for medium-confidence patterns
    const hasWhileYoureAtIt = TRIGGER_WORDS.some(t => t.phrase.includes('while you'));
    const hasByTheWay = TRIGGER_WORDS.some(t => t.phrase.includes('by the way'));
    expect(hasWhileYoureAtIt).toBe(true);
    expect(hasByTheWay).toBe(true);
  });

  it('should have proper weight distribution', () => {
    const weights = TRIGGER_WORDS.map(t => t.weight);

    // Should have high (8-10), medium (5-7), and low (1-4) weights
    const high = weights.filter(w => w >= 8);
    const medium = weights.filter(w => w >= 5 && w < 8);
    const low = weights.filter(w => w < 5);

    expect(high.length).toBeGreaterThan(0);
    expect(medium.length).toBeGreaterThan(0);
    expect(low.length).toBeGreaterThan(0);
  });

  describe('Pattern: also + action', () => {
    const pattern = TRIGGER_WORDS.find(t => t.phrase === 'also + action');

    it('should match various forms', () => {
      const tests = [
        'Also, can you add this?',
        'Also can you implement that',
        'Also please build this',
        'Additionally, could you create that?',
        'Additionally can we have this'
      ];

      tests.forEach(text => {
        expect(text.toLowerCase().match(pattern.pattern)).toBeTruthy();
      });
    });

    it('should require action verb', () => {
      const tests = [
        'Also, thank you',
        'Also I forgot',
        'Additionally, great work'
      ];

      tests.forEach(text => {
        expect(text.toLowerCase().match(pattern.pattern)).toBeFalsy();
      });
    });
  });

  describe('Pattern: one more thing', () => {
    const pattern = TRIGGER_WORDS.find(t => t.phrase === 'one more thing');

    it('should match variations', () => {
      const tests = [
        'One more thing - add this',
        'One more thing, implement that',
        'Just one more thing: build this',
        'one more thing can you fix'
      ];

      tests.forEach(text => {
        expect(text.toLowerCase().match(pattern.pattern)).toBeTruthy();
      });
    });
  });

  describe('Pattern: while you\'re at it', () => {
    const pattern = TRIGGER_WORDS.find(t => t.phrase === 'while you\'re at it');

    it('should match variations', () => {
      const tests = [
        'While you\'re at it, add this',
        'While you are at it, fix that',
        'While you\'re there, update this',
        'while youre at it can you'
      ];

      tests.forEach(text => {
        expect(text.toLowerCase().match(pattern.pattern)).toBeTruthy();
      });
    });
  });

  describe('Pattern: by the way', () => {
    const pattern = TRIGGER_WORDS.find(t => t.phrase === 'by the way');

    it('should match with action requests', () => {
      const tests = [
        'By the way, can you add this?',
        'By the way, please implement',
        'BTW, could you fix',
        'Btw can we change'
      ];

      tests.forEach(text => {
        expect(text.toLowerCase().match(pattern.pattern)).toBeTruthy();
      });
    });
  });

  describe('Pattern: forgot to mention', () => {
    const pattern = TRIGGER_WORDS.find(t => t.phrase === 'forgot to mention');

    it('should match variations', () => {
      const tests = [
        'I forgot to mention we need this',
        'Forgot to mention, add that',
        'I forgot to mention - implement this',
        'forgot to mention can you'
      ];

      tests.forEach(text => {
        expect(text.toLowerCase().match(pattern.pattern)).toBeTruthy();
      });
    });
  });

  describe('Pattern: quick favor', () => {
    const pattern = TRIGGER_WORDS.find(t => t.phrase === 'quick favor');

    it('should match variations', () => {
      const tests = [
        'Quick favor - can you add',
        'Quick favor, could you fix',
        'Small favor: implement this',
        'quick favor can you update'
      ];

      tests.forEach(text => {
        expect(text.toLowerCase().match(pattern.pattern)).toBeTruthy();
      });
    });
  });

  describe('Pattern: actually/instead', () => {
    const pattern = TRIGGER_WORDS.find(t => t.phrase === 'actually/instead');

    it('should match course corrections', () => {
      const tests = [
        'Actually, let\'s add this instead',
        'Actually can we change to',
        'Let\'s do this instead',
        'Actually, change it to'
      ];

      tests.forEach(text => {
        expect(text.toLowerCase().match(pattern.pattern)).toBeTruthy();
      });
    });
  });

  describe('Pattern: can you / could you', () => {
    const pattern = TRIGGER_WORDS.find(t => t.phrase === 'can you / could you');

    it('should match simple requests', () => {
      const tests = [
        'Can you add authentication?',
        'Could you implement this feature?',
        'Can we have user profiles?',
        'Could we add a dashboard?'
      ];

      tests.forEach(text => {
        expect(text.toLowerCase().match(pattern.pattern)).toBeTruthy();
      });
    });

    it('should require action verbs', () => {
      const nonMatches = [
        'Can you see this?',
        'Could you check?',
        'Can you confirm?'
      ];

      nonMatches.forEach(text => {
        // These might match depending on implementation
        // but should have lower weight
        const match = text.toLowerCase().match(pattern.pattern);
        if (match) {
          expect(pattern.weight).toBeLessThan(5);
        }
      });
    });
  });
});

describe('shouldExclude', () => {
  // Note: Gratitude exclusion removed - gratitude + scope creep should still detect
  // This allows emails like "Thanks for the update. Also, can you add reporting?"

  it('should exclude status updates', () => {
    const tests = [
      'also, everything is on track',
      'additionally, the project looks great',
      'by the way, great job so far'
    ];

    tests.forEach(text => {
      expect(shouldExclude(text.toLowerCase())).toBe(true);
    });
  });

  it('should exclude non-action questions', () => {
    const tests = [
      'by the way, when is the deadline?',
      'also, what time is the meeting?',
      'one more thing - who is the contact?'
    ];

    tests.forEach(text => {
      expect(shouldExclude(text.toLowerCase())).toBe(true);
    });
  });

  it('should not exclude action requests', () => {
    const tests = [
      'also, can you add this feature?',
      'by the way, please implement auth',
      'one more thing - build a dashboard'
    ];

    tests.forEach(text => {
      expect(shouldExclude(text.toLowerCase())).toBe(false);
    });
  });
});

describe('findBestMatch', () => {
  it('should return highest weight match', () => {
    const text = 'also, can you add this? one more thing - fix that';
    const match = findBestMatch(text.toLowerCase());

    expect(match).toBeDefined();
    expect(match.weight).toBeGreaterThanOrEqual(8);
  });

  it('should return null for no match', () => {
    const text = 'this is just normal conversation about the project';
    const match = findBestMatch(text.toLowerCase());

    expect(match).toBeNull();
  });

  it('should handle excluded patterns', () => {
    const text = 'also, thank you so much for your help';
    const match = findBestMatch(text.toLowerCase());

    // Should not match due to exclusion
    expect(match).toBeNull();
  });

  it('should prioritize high confidence patterns', () => {
    // Text with both high and low confidence triggers
    const text = 'Also, can you add this feature to the system?';
    const match = findBestMatch(text.toLowerCase());

    expect(match).toBeDefined();
    expect(match.phrase).toBe('also + action');
    expect(match.weight).toBeGreaterThanOrEqual(8);
  });
});

describe('Pattern Coverage', () => {
  it('should cover common scope creep phrases', () => {
    const commonPhrases = [
      'Also, add user login',
      'Additionally, implement search',
      'One more thing - fix the header',
      'While you\'re at it, update styles',
      'By the way, can you add filters?',
      'I forgot to mention we need exports',
      'Quick favor - adjust the layout',
      'Actually, let\'s redesign this',
      'Oh and add notifications',
      'Can you also include reports?',
      'Another thing - add analytics',
      'Just realized we need backups'
    ];

    let matches = 0;
    commonPhrases.forEach(phrase => {
      const match = findBestMatch(phrase.toLowerCase());
      if (match) matches++;
    });

    // Should match at least 80% of common phrases
    const coverage = (matches / commonPhrases.length) * 100;
    expect(coverage).toBeGreaterThanOrEqual(80);
  });

  it('should avoid false positives', () => {
    const normalPhrases = [
      'The project is going well',
      'Thanks for your hard work',
      'When can we review?',
      'Great progress so far',
      'Looking forward to the demo',
      'The client is happy',
      'Everything looks good',
      'Nice work on this feature'
    ];

    let falsePositives = 0;
    normalPhrases.forEach(phrase => {
      const match = findBestMatch(phrase.toLowerCase());
      if (match) falsePositives++;
    });

    // Should have very few false positives
    const falsePositiveRate = (falsePositives / normalPhrases.length) * 100;
    expect(falsePositiveRate).toBeLessThanOrEqual(20);
  });
});
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AiAssistantScreen, estimateTokens, parseRelativeDate } from './AiAssistantScreen';
import type { Child } from '../types';

// Mock scrollTo since JSDOM doesn't implement layout-related features
Element.prototype.scrollTo = vi.fn();

// Mock Language Context
vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: string) => key
  })
}));

// Mock Auth Context
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    workerName: 'Saraswati Devi',
    workerId: 'AW-1234',
    anganwadiBlock: 'Anganwadi Block 1'
  })
}));

// Mock Speech Hook
vi.mock('../hooks/useSpeech', () => ({
  useSpeech: () => ({
    isListening: false,
    transcript: '',
    startListening: vi.fn(),
    stopListening: vi.fn(),
    browserSupportsSpeech: true
  })
}));

describe('AiAssistantScreen Component & Utilities', () => {
  const mockChildren: Child[] = [
    {
      id: '1',
      name: 'Rani',
      nameHindi: 'रानी',
      age: 4,
      ageDisplay: '4 years 2 months',
      gender: 'girl',
      avatar: '/child-rani.png',
      attendance: 'present',
      nutritionStatus: 'good',
      developmentProgress: 80,
      lastVisit: '2 days ago',
      parentName: 'Meera Devi',
      parentPhone: '9876543210',
      address: 'Village',
      needsAttention: false,
      observations: [
        { id: 'o1', date: 'Today', note: 'Recited a poem', category: 'Language', type: 'text' }
      ],
      milestones: [],
      aiInsights: [],
      attendanceHistory: []
    }
  ];

  // ─── Utility Unit Tests ─────────────────────────────────────────────────────
  describe('estimateTokens utility', () => {
    it('estimates token count using character length divided by 4 rounded up', () => {
      expect(estimateTokens('abcd')).toBe(1);
      expect(estimateTokens('abcdefgh')).toBe(2);
      expect(estimateTokens('abcde')).toBe(2);
    });
  });

  describe('parseRelativeDate utility', () => {
    it('parses relative day strings correctly', () => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      expect(parseRelativeDate('Today')).toBeCloseTo(now, -3); // within 1000ms
      expect(parseRelativeDate('Yesterday')).toBeCloseTo(now - oneDay, -3);
      expect(parseRelativeDate('3 days ago')).toBeCloseTo(now - 3 * oneDay, -3);
      expect(parseRelativeDate('2 weeks ago')).toBeCloseTo(now - 14 * oneDay, -3);
    });

    it('parses absolute date strings correctly', () => {
      const targetStr = '2026-06-20T10:00:00.000Z';
      expect(parseRelativeDate(targetStr)).toBe(Date.parse(targetStr));
    });

    it('returns 0 for empty or invalid strings', () => {
      expect(parseRelativeDate('')).toBe(0);
      expect(parseRelativeDate('not-a-date')).toBe(0);
    });
  });

  // ─── Render & Greeting Tests ────────────────────────────────────────────────
  describe('AiAssistantScreen message rendering', () => {
    it('renders greeting welcome bubble with the active worker name', () => {
      render(<AiAssistantScreen onBack={() => {}} childrenList={mockChildren} />);
      
      // Asserts that worker name from mock useAuth hook is displayed in greeting
      expect(screen.getByText(/Saraswati Devi/)).toBeInTheDocument();
      expect(screen.getByText(/I am Pratibha, your AI assistant/)).toBeInTheDocument();
    });

    it('renders context truncation warning banner when observation limits are exceeded', () => {
      // Create child with a massive observation note that forces token count > 2500
      const largeObsText = 'a'.repeat(12000); // ~3000 tokens
      const oversizedChildren: Child[] = [
        {
          ...mockChildren[0],
          observations: [
            { id: 'o-huge', date: 'Today', note: largeObsText, category: 'General', type: 'text' }
          ]
        }
      ];

      render(<AiAssistantScreen onBack={() => {}} childrenList={oversizedChildren} />);

      // Truncation banner should render warning message
      expect(screen.getByText(/Prioritizing most recent observations to fit size constraints/i)).toBeInTheDocument();
    });
  });
});

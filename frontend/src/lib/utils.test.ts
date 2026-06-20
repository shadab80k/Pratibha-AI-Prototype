import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge static class names together', () => {
    const result = cn('bg-red-500', 'text-white', 'p-4');
    expect(result).toBe('bg-red-500 text-white p-4');
  });

  it('should handle conditional class names', () => {
    const isTrue = true;
    const isFalse = false;
    const result = cn(
      'base-class',
      isTrue && 'active-class',
      isFalse && 'inactive-class'
    );
    expect(result).toBe('base-class active-class');
  });

  it('should override conflicting Tailwind CSS classes correctly (last-write wins)', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });
});

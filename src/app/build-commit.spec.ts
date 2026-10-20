import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { BUILD_COMMIT, buildLabel } from './build-commit';

const SHA = '373433c3a46e2283d7e4fd7eeb772f86ec25ff7e';

describe('buildLabel', () => {
  it('shows the short commit and links the full one', () => {
    expect(buildLabel(SHA)).toEqual({
      text: '373433c',
      href: `https://github.com/rgpl-xyz/lotto-number-checker/commit/${SHA}`,
    });
  });

  it('reads anything but a full commit as an unlinked dev build', () => {
    for (const value of ['dev', '', '373433c', SHA.toUpperCase(), `${SHA}0`, 'javascript:alert(1)']) {
      expect(buildLabel(value)).toEqual({ text: 'dev', href: null });
    }
  });
});

describe('BUILD_COMMIT', () => {
  it('is dev when the build names no commit', () => {
    expect(TestBed.inject(BUILD_COMMIT)).toBe('dev');
  });
});

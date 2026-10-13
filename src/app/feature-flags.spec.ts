import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { FEATURE_FLAGS } from './feature-flags';
import { environment as developmentEnvironment } from '../environments/environment.development';

describe('FEATURE_FLAGS', () => {
  it('keeps live results off in the default (production) build', () => {
    expect(TestBed.inject(FEATURE_FLAGS).liveResults).toBe(false);
  });

  it('turns live results on in the development build that ng serve uses', () => {
    expect(developmentEnvironment.liveResults).toBe(true);
  });
});

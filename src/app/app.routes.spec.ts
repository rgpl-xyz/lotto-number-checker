import { describe, it, expect } from 'vitest';
import { routes } from './app.routes';

describe('routes', () => {
  it('titles the page with the app name', () => {
    expect(routes[0].title).toBe('Lotto Number Checker | RGPL');
  });
});

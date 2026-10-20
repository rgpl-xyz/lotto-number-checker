import { TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './app.component';
import { BUILD_COMMIT } from './build-commit';
import { RouterOutlet } from '@angular/router';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterOutlet
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router outlet', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('names the build as dev when the build names no commit', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const footer = (fixture.nativeElement as HTMLElement).querySelector('footer');

    expect(footer?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Lotto Number Checker is a demo app by RGPL · Build dev'
    );
    expect(footer?.querySelector('a')).toBeNull();
  });

  it('links a deployed build to its commit on GitHub', async () => {
    const sha = '373433c3a46e2283d7e4fd7eeb772f86ec25ff7e';
    TestBed.overrideProvider(BUILD_COMMIT, { useValue: sha });
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const link = (fixture.nativeElement as HTMLElement).querySelector('footer a.build');

    expect(link?.textContent?.trim()).toBe('373433c');
    expect(link?.getAttribute('href')).toBe(`https://github.com/rgpl-xyz/lotto-number-checker/commit/${sha}`);
  });
});

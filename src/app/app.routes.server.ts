import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * The checker is the same for everyone until numbers are typed, so the build renders it
 * ahead of time: its text is in the HTML for crawlers that don't run scripts.
 */
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Prerender }];

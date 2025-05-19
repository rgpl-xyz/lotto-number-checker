import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/winning-number/winning-number.component').then(m => m.WinningNumberComponent),
    title: 'Lotto Number Matcher | RGPL'
  }
];

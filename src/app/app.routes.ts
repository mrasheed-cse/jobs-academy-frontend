import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'signup',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/signup/signup').then((m) => m.Signup),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'model-tests',
    loadComponent: () =>
      import('./features/exams/model-test-types/model-test-types').then((m) => m.ModelTestTypes),
  },
  {
    path: 'model-tests/:typeId',
    loadComponent: () =>
      import('./features/exams/model-test-list/model-test-list').then((m) => m.ModelTestList),
  },
  {
    path: 'model-tests/details/:examId',
    loadComponent: () => import('./features/exams/exam-detail/exam-detail').then((m) => m.ExamDetail),
  },
  {
    path: 'model-tests/take/:examId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/exams/exam-take/exam-take').then((m) => m.ExamTake),
  },
  {
    path: 'model-tests/results/:examId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/exams/exam-results/exam-results').then((m) => m.ExamResults),
  },
  {
    path: 'model-tests/leaderboard/:examId',
    loadComponent: () =>
      import('./features/exams/exam-leaderboard/exam-leaderboard').then((m) => m.ExamLeaderboard),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

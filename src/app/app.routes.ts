import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { dictionaryAdminGuard } from './core/guards/dictionary-admin.guard';

export const routes: Routes = [
  // --- Auth ---
  { path: '', loadComponent: () => import('./features/home/home').then((m) => m.Home) },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login').then((m) => m.Login) },
  { path: 'signup', canActivate: [guestGuard], loadComponent: () => import('./features/auth/signup/signup').then((m) => m.Signup) },

  // --- Dashboard & Profile ---
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard) },
  { path: 'user/profile', canActivate: [authGuard], loadComponent: () => import('./features/user/user-profile/user-profile').then((m) => m.UserProfile) },

  // --- Model tests (live exams) ---
  { path: 'model-tests', loadComponent: () => import('./features/exams/model-test-types/model-test-types').then((m) => m.ModelTestTypes) },
  { path: 'model-tests/details/:examId', loadComponent: () => import('./features/exams/exam-detail/exam-detail').then((m) => m.ExamDetail) },
  { path: 'model-tests/take/:examId', canActivate: [authGuard], loadComponent: () => import('./features/exams/exam-take/exam-take').then((m) => m.ExamTake) },
  { path: 'model-tests/results/:examId', canActivate: [authGuard], loadComponent: () => import('./features/exams/exam-results/exam-results').then((m) => m.ExamResults) },
  { path: 'model-tests/leaderboard/:examId', loadComponent: () => import('./features/exams/exam-leaderboard/exam-leaderboard').then((m) => m.ExamLeaderboard) },
  { path: 'model-tests/:typeId', loadComponent: () => import('./features/exams/model-test-list/model-test-list').then((m) => m.ModelTestList) },

  // --- Past exams ---
  { path: 'past-exams', loadComponent: () => import('./features/past-exams/past-exam-types/past-exam-types').then((m) => m.PastExamTypes) },
  { path: 'past-exams/details/:examId', loadComponent: () => import('./features/past-exams/past-exam-detail/past-exam-detail').then((m) => m.PastExamDetail) },
  { path: 'past-exams/take/:examId', canActivate: [authGuard], loadComponent: () => import('./features/past-exams/past-exam-take/past-exam-take').then((m) => m.PastExamTake) },
  { path: 'past-exams/leaderboard/:examId', loadComponent: () => import('./features/exams/exam-leaderboard/exam-leaderboard').then((m) => m.ExamLeaderboard) },
  { path: 'past-exams/:typeId', loadComponent: () => import('./features/past-exams/past-exam-list/past-exam-list').then((m) => m.PastExamList) },

  // --- Jobs & Notices ---
  { path: 'job-circular', loadComponent: () => import('./features/jobs/job-list/job-list').then((m) => m.JobList) },
  { path: 'job-circular/:id', loadComponent: () => import('./features/jobs/job-detail/job-detail').then((m) => m.JobDetail) },
  { path: 'notices', loadComponent: () => import('./features/jobs/notice-list/notice-list').then((m) => m.NoticeList) },
  { path: 'notices/:id/details', loadComponent: () => import('./features/jobs/notice-detail/notice-detail').then((m) => m.NoticeDetail) },

  // --- News ---
  { path: 'news', loadComponent: () => import('./features/news/news-categories/news-categories').then((m) => m.NewsCategories) },
  { path: 'news/details/:id', loadComponent: () => import('./features/news/news-detail/news-detail').then((m) => m.NewsDetail) },
  { path: 'news/:categoryId', loadComponent: () => import('./features/news/news-list/news-list').then((m) => m.NewsList) },

  // --- Admin panel (teacher/admin only) ---
  { path: 'admin', canActivate: [dictionaryAdminGuard], loadComponent: () => import('./features/admin/admin-panel/admin-panel').then((m) => m.AdminPanel) },
  { path: 'admin/news', canActivate: [dictionaryAdminGuard], loadComponent: () => import('./features/admin/news-manage/news-manage').then((m) => m.NewsManage) },
  { path: 'admin/jobs', canActivate: [dictionaryAdminGuard], loadComponent: () => import('./features/admin/job-manage/job-manage').then((m) => m.JobManage) },

  // --- Static pages ---
  { path: 'about-us', loadComponent: () => import('./features/static/about/about').then((m) => m.About) },
  { path: 'contact-us', loadComponent: () => import('./features/static/contact/contact').then((m) => m.Contact) },
  { path: 'privacy-policy', loadComponent: () => import('./features/static/privacy-policy/privacy-policy').then((m) => m.PrivacyPolicy) },

  // --- Written exams ---
  { path: 'written-exams', loadComponent: () => import('./features/written-exams/written-exam-list/written-exam-list').then((m) => m.WrittenExamList) },
  { path: 'written-exams/:id', loadComponent: () => import('./features/written-exams/written-exam-detail/written-exam-detail').then((m) => m.WrittenExamDetail) },

  // --- Word games ---
  { path: 'quiz-games', loadComponent: () => import('./features/games/word-games/word-games').then((m) => m.WordGames) },
  { path: 'quiz-games/spelling', loadComponent: () => import('./features/games/spelling-game/spelling-game').then((m) => m.SpellingGame) },
  { path: 'quiz-games/word-gather', loadComponent: () => import('./features/games/word-gather/word-gather').then((m) => m.WordGather) },
  { path: 'quiz-games/word-mixer', loadComponent: () => import('./features/games/word-mixer/word-mixer').then((m) => m.WordMixer) },

  // --- Language center ---
  { path: 'language', loadComponent: () => import('./features/language/language-home/language-home').then((m) => m.LanguageHome) },
  { path: 'language/manage', canActivate: [dictionaryAdminGuard], loadComponent: () => import('./features/language/dictionary-manage/dictionary-manage').then((m) => m.DictionaryManage) },

  // --- Subscription ---
  { path: 'subscription', loadComponent: () => import('./features/subscription/subscription-plans/subscription-plans').then((m) => m.SubscriptionPlans) },

  // --- User settings & stats ---
  { path: 'user/performance', canActivate: [authGuard], loadComponent: () => import('./features/user/performance-stats/performance-stats').then((m) => m.PerformanceStats) },
  { path: 'user/settings', canActivate: [authGuard], loadComponent: () => import('./features/user/settings/settings').then((m) => m.Settings) },
  { path: 'user/delete-account', canActivate: [authGuard], loadComponent: () => import('./features/user/delete-account/delete-account').then((m) => m.DeleteAccount) },

  { path: '**', redirectTo: '' },
];

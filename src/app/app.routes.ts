import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Expenses } from './components/expenses/expenses';
import { Budget } from './components/budget/budget';
import { Reports } from './components/reports/reports';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'expenses', component: Expenses },
  { path: 'budget', component: Budget },
  { path: 'reports', component: Reports },
  { path: '**', redirectTo: '/dashboard' }
];

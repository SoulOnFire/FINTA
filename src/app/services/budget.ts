import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Budget, BudgetSummary } from '../models/budget.model';
import { ExpenseService } from './expense';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private budgets = new BehaviorSubject<Budget[]>([]);

  constructor(private expenseService: ExpenseService) {
    this.loadMockBudgets();
  }

  getBudgets(): Observable<Budget[]> {
    return this.budgets.asObservable();
  }

  addBudget(budget: Omit<Budget, 'id' | 'spentAmount' | 'createdAt' | 'updatedAt'>): void {
    const newBudget: Budget = {
      ...budget,
      id: this.generateId(),
      spentAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const currentBudgets = this.budgets.value;
    this.budgets.next([...currentBudgets, newBudget]);
  }

  updateBudget(id: string, updates: Partial<Budget>): void {
    const currentBudgets = this.budgets.value;
    const index = currentBudgets.findIndex(b => b.id === id);
    if (index !== -1) {
      currentBudgets[index] = { ...currentBudgets[index], ...updates, updatedAt: new Date() };
      this.budgets.next([...currentBudgets]);
    }
  }

  deleteBudget(id: string): void {
    const currentBudgets = this.budgets.value;
    this.budgets.next(currentBudgets.filter(b => b.id !== id));
  }

  getBudgetSummary(): Observable<BudgetSummary> {
    return combineLatest([
      this.budgets.asObservable(),
      this.expenseService.getExpenses()
    ]).pipe(
      map(([budgets, expenses]) => {
        const activeBudgets = budgets.filter(b => b.isActive);
        const totalBudget = activeBudgets.reduce((sum, b) => sum + b.totalAmount, 0);
        
        // Calculate spent amount for current month
        const currentDate = new Date();
        const currentMonthExpenses = expenses.filter(e => {
          const expenseDate = new Date(e.date);
          return expenseDate.getMonth() === currentDate.getMonth() && 
                 expenseDate.getFullYear() === currentDate.getFullYear();
        });
        
        const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const remainingBudget = totalBudget - totalSpent;
        const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
        
        // Calculate days remaining in current month
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysRemaining = Math.ceil((lastDayOfMonth.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          totalBudget,
          totalSpent,
          remainingBudget,
          percentageUsed,
          isOverBudget: totalSpent > totalBudget,
          daysRemaining
        };
      })
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private loadMockBudgets(): void {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const mockBudgets: Budget[] = [
      {
        id: 'budget1',
        name: 'Orçamento Mensal - Alimentação',
        totalAmount: 300,
        spentAmount: 45.50,
        categoryId: 'food',
        categoryName: 'Alimentação',
        period: 'monthly',
        startDate: startOfMonth,
        endDate: endOfMonth,
        alertThreshold: 80,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'budget2',
        name: 'Orçamento Mensal - Transporte',
        totalAmount: 100,
        spentAmount: 15.20,
        categoryId: 'transport',
        categoryName: 'Transporte',
        period: 'monthly',
        startDate: startOfMonth,
        endDate: endOfMonth,
        alertThreshold: 75,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.budgets.next(mockBudgets);
  }
}

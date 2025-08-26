import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Expense, ExpenseCategory, FamilyMember } from '../models/expense.model';
import { ExpenseFilter } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expenses = new BehaviorSubject<Expense[]>([]);
  private categories = new BehaviorSubject<ExpenseCategory[]>(this.getDefaultCategories());
  private familyMembers = new BehaviorSubject<FamilyMember[]>([]);

  constructor() {
    this.loadMockData();
  }

  // Expenses
  getExpenses(): Observable<Expense[]> {
    return this.expenses.asObservable();
  }

  addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newExpense: Expense = {
      ...expense,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const currentExpenses = this.expenses.value;
    this.expenses.next([...currentExpenses, newExpense]);
  }

  updateExpense(id: string, updates: Partial<Expense>): void {
    const currentExpenses = this.expenses.value;
    const index = currentExpenses.findIndex(e => e.id === id);
    if (index !== -1) {
      currentExpenses[index] = { ...currentExpenses[index], ...updates, updatedAt: new Date() };
      this.expenses.next([...currentExpenses]);
    }
  }

  deleteExpense(id: string): void {
    const currentExpenses = this.expenses.value;
    this.expenses.next(currentExpenses.filter(e => e.id !== id));
  }

  filterExpenses(filter: ExpenseFilter): Observable<Expense[]> {
    return new Observable(observer => {
      this.expenses.subscribe(expenses => {
        let filtered = expenses;

        if (filter.startDate) {
          filtered = filtered.filter(e => e.date >= filter.startDate!);
        }
        if (filter.endDate) {
          filtered = filtered.filter(e => e.date <= filter.endDate!);
        }
        if (filter.categoryIds?.length) {
          filtered = filtered.filter(e => filter.categoryIds!.includes(e.categoryId));
        }
        if (filter.familyMemberIds?.length) {
          filtered = filtered.filter(e => e.familyMemberId && filter.familyMemberIds!.includes(e.familyMemberId));
        }
        if (filter.minAmount !== undefined) {
          filtered = filtered.filter(e => e.amount >= filter.minAmount!);
        }
        if (filter.maxAmount !== undefined) {
          filtered = filtered.filter(e => e.amount <= filter.maxAmount!);
        }
        if (filter.searchText) {
          const searchText = filter.searchText.toLowerCase();
          filtered = filtered.filter(e => 
            e.description.toLowerCase().includes(searchText) ||
            e.notes?.toLowerCase().includes(searchText)
          );
        }

        observer.next(filtered);
      });
    });
  }

  // Categories
  getCategories(): Observable<ExpenseCategory[]> {
    return this.categories.asObservable();
  }

  addCategory(category: Omit<ExpenseCategory, 'id'>): void {
    const newCategory: ExpenseCategory = {
      ...category,
      id: this.generateId()
    };
    const currentCategories = this.categories.value;
    this.categories.next([...currentCategories, newCategory]);
  }

  updateCategory(id: string, updates: Partial<ExpenseCategory>): void {
    const currentCategories = this.categories.value;
    const index = currentCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      currentCategories[index] = { ...currentCategories[index], ...updates };
      this.categories.next([...currentCategories]);
    }
  }

  // Family Members
  getFamilyMembers(): Observable<FamilyMember[]> {
    return this.familyMembers.asObservable();
  }

  addFamilyMember(member: Omit<FamilyMember, 'id'>): void {
    const newMember: FamilyMember = {
      ...member,
      id: this.generateId()
    };
    const currentMembers = this.familyMembers.value;
    this.familyMembers.next([...currentMembers, newMember]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getDefaultCategories(): ExpenseCategory[] {
    return [
      { id: 'food', name: 'Alimentação', color: '#FF6B6B', icon: '🍽️', isDefault: true },
      { id: 'transport', name: 'Transporte', color: '#4ECDC4', icon: '🚗', isDefault: true },
      { id: 'entertainment', name: 'Entretenimento', color: '#45B7D1', icon: '🎬', isDefault: true },
      { id: 'shopping', name: 'Compras', color: '#96CEB4', icon: '🛍️', isDefault: true },
      { id: 'bills', name: 'Contas', color: '#FFEAA7', icon: '📄', isDefault: true },
      { id: 'health', name: 'Saúde', color: '#DDA0DD', icon: '🏥', isDefault: true },
      { id: 'education', name: 'Educação', color: '#98D8C8', icon: '📚', isDefault: true },
      { id: 'other', name: 'Outros', color: '#F7DC6F', icon: '📦', isDefault: true }
    ];
  }

  private loadMockData(): void {
    // Add some sample family members
    this.familyMembers.next([
      { id: 'user1', name: 'Miguel', email: 'miguel@example.com', role: 'admin', isActive: true },
      { id: 'user2', name: 'Família', email: 'familia@example.com', role: 'member', isActive: true }
    ]);

    // Add some sample expenses
    const sampleExpenses: Expense[] = [
      {
        id: 'exp1',
        amount: 45.50,
        description: 'Supermercado Continente',
        categoryId: 'food',
        categoryName: 'Alimentação',
        date: new Date('2025-08-25'),
        familyMemberId: 'user1',
        familyMemberName: 'Miguel',
        isRecurring: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'exp2',
        amount: 15.20,
        description: 'Metro Lisboa',
        categoryId: 'transport',
        categoryName: 'Transporte',
        date: new Date('2025-08-24'),
        familyMemberId: 'user1',
        familyMemberName: 'Miguel',
        isRecurring: true,
        recurringFrequency: 'weekly',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.expenses.next(sampleExpenses);
  }
}

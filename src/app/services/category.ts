import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ExpenseCategory } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories = new BehaviorSubject<ExpenseCategory[]>(this.getDefaultCategories());

  constructor() { }

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

  deleteCategory(id: string): void {
    const currentCategories = this.categories.value;
    const nonDefaultCategories = currentCategories.filter(c => c.id !== id || !c.isDefault);
    this.categories.next(nonDefaultCategories);
  }

  getCategoryById(id: string): ExpenseCategory | undefined {
    return this.categories.value.find(c => c.id === id);
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
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  categoryName?: string;
  date: Date;
  familyMemberId?: string;
  familyMemberName?: string;
  notes?: string;
  receiptUrl?: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  budgetLimit?: number;
  description?: string;
  isDefault: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  avatar?: string;
  isActive: boolean;
}

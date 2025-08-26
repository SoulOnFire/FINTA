export interface Budget {
  id: string;
  name: string;
  totalAmount: number;
  spentAmount: number;
  categoryId?: string;
  categoryName?: string;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  alertThreshold: number; // percentage (e.g., 80 for 80%)
  isActive: boolean;
  familyMemberIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageUsed: number;
  isOverBudget: boolean;
  daysRemaining: number;
}

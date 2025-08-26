export interface MonthlyReport {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  expensesByCategory: CategoryExpense[];
  expensesByMember: MemberExpense[];
  budgetComparison: BudgetComparison[];
  dailyExpenses: DailyExpense[];
}

export interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MemberExpense {
  memberId: string;
  memberName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface BudgetComparison {
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  variance: number;
  percentageUsed: number;
}

export interface DailyExpense {
  date: Date;
  amount: number;
  transactionCount: number;
}

export interface ExpenseFilter {
  startDate?: Date;
  endDate?: Date;
  categoryIds?: string[];
  familyMemberIds?: string[];
  minAmount?: number;
  maxAmount?: number;
  searchText?: string;
  tags?: string[];
}

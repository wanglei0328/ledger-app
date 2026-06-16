// ==================== 核心类型定义 ====================

export interface Bill {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  categoryKey: string;
  note: string;
  date: string; // "2026-06-15"
}

export interface Category {
  key: string;
  name: string;
  emoji: string;
}

export interface AppData {
  bills: Bill[];
  budget: number; // 月度预算，0 表示未设置
  recurringBills: RecurringBill[]; // 周期账单
}

// ==================== 周期账单 ====================

export type CycleType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringBill {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  categoryKey: string;
  note: string;
  cycle: CycleType;
  cycleDay: number;     // 月:1-31 | 周:0-6(周日=0) | 年:月日如615=6月15日 | 天:不用
  startDate: string;    // "2026-06-01"
  endDate?: string;     // 可选截止日期
  isActive: boolean;
  lastGenerated?: string;
  nextDueDate: string;
}

export interface MonthlyStats {
  month: string;
  totalExpense: number;
  totalIncome: number;
  netSavings: number; // 结余 = totalIncome - totalExpense
  billCount: number;
  expenseCount: number;
  incomeCount: number;
  avgPerDay: number;
  daysInMonth: number;
  categoryBreakdown: CategoryStat[];
  incomeCategoryBreakdown: CategoryStat[];
  dailyExpenses: DailyExpense[];
  topExpense: Bill | null;
  topIncome: Bill | null;
}

export interface CategoryStat {
  categoryKey: string;
  categoryName: string;
  emoji: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface DailyExpense {
  date: string;
  amount: number;
}

export interface AnalysisItem {
  type: 'warning' | 'info' | 'good' | 'tip' | 'positive';
  icon: string;
  text: string;
}

export interface BudgetStatus {
  month: string;
  budget: number;
  spent: number;
  income: number;
  remaining: number;
  netPosition: number; // 净头寸 = income - spent
  percentage: number;
  daysElapsed: number;
  daysInMonth: number;
  projectedTotal: number;
  projectedOverspend: number;
}

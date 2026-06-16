import { useMemo } from 'react';
import type { Bill, MonthlyStats, CategoryStat, DailyExpense, AnalysisItem, BudgetStatus } from '../types';
import { getCategory } from '../data/categories';
import dayjs from 'dayjs';

function getDaysInMonth(year: number, month: number): number {
  return dayjs(`${year}-${String(month).padStart(2, '0')}-01`).daysInMonth();
}

function buildCategoryBreakdown(bills: Bill[], total: number, type: 'expense' | 'income'): CategoryStat[] {
  if (total === 0) return [];
  const categoryMap = new Map<string, { amount: number; count: number }>();
  bills.forEach(b => {
    const existing = categoryMap.get(b.categoryKey) || { amount: 0, count: 0 };
    existing.amount += b.amount;
    existing.count += 1;
    categoryMap.set(b.categoryKey, existing);
  });

  return Array.from(categoryMap.entries())
    .map(([key, val]) => {
      const cat = getCategory(key, type);
      return {
        categoryKey: key,
        categoryName: cat.name,
        emoji: cat.emoji,
        amount: val.amount,
        percentage: Math.round((val.amount / total) * 100),
        count: val.count,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function useAnalysis(bills: Bill[], budget: number, currentMonth: string) {
  const monthlyStats = useMemo<MonthlyStats | null>(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const daysInMonth = getDaysInMonth(year, month);

    const monthBills = bills.filter(b => b.date.startsWith(currentMonth));
    if (monthBills.length === 0) return null;

    // 分离支出和收入
    const expenseBills = monthBills.filter(b => b.type === 'expense');
    const incomeBills = monthBills.filter(b => b.type === 'income');

    const totalExpense = expenseBills.reduce((sum, b) => sum + b.amount, 0);
    const totalIncome = incomeBills.reduce((sum, b) => sum + b.amount, 0);

    // 支出分类统计
    const categoryBreakdown = buildCategoryBreakdown(expenseBills, totalExpense, 'expense');

    // 收入分类统计
    const incomeCategoryBreakdown = buildCategoryBreakdown(incomeBills, totalIncome, 'income');

    // 每日支出
    const dailyMap = new Map<string, number>();
    monthBills.forEach(b => {
      dailyMap.set(b.date, (dailyMap.get(b.date) || 0) + b.amount);
    });
    const dailyExpenses: DailyExpense[] = Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topExpense = expenseBills.length > 0
      ? expenseBills.reduce<Bill>((max, b) => (!max || b.amount > max.amount ? b : max), expenseBills[0])
      : null;

    const topIncome = incomeBills.length > 0
      ? incomeBills.reduce<Bill>((max, b) => (!max || b.amount > max.amount ? b : max), incomeBills[0])
      : null;

    return {
      month: currentMonth,
      totalExpense,
      totalIncome,
      netSavings: totalIncome - totalExpense,
      billCount: monthBills.length,
      expenseCount: expenseBills.length,
      incomeCount: incomeBills.length,
      avgPerDay: Math.round(totalExpense / daysInMonth * 100) / 100,
      daysInMonth,
      categoryBreakdown,
      incomeCategoryBreakdown,
      dailyExpenses,
      topExpense,
      topIncome,
    };
  }, [bills, currentMonth]);

  const budgetStatus = useMemo<BudgetStatus | null>(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const daysInMonth = getDaysInMonth(year, month);
    const today = dayjs().format('YYYY-MM-DD');
    const daysElapsed = dayjs(today).date();
    const currentDay = Math.min(daysElapsed, daysInMonth);

    const monthBills = bills.filter(b => b.date.startsWith(currentMonth));
    const expenseBills = monthBills.filter(b => b.type === 'expense');
    const incomeBills = monthBills.filter(b => b.type === 'income');
    const spent = expenseBills.reduce((sum, b) => sum + b.amount, 0);
    const income = incomeBills.reduce((sum, b) => sum + b.amount, 0);

    if (budget <= 0) return null;

    const remaining = budget - spent;
    const percentage = Math.round((spent / budget) * 100);
    const avgDailySpend = currentDay > 0 ? spent / currentDay : 0;
    const projectedTotal = Math.round(avgDailySpend * daysInMonth * 100) / 100;
    const projectedOverspend = Math.max(0, projectedTotal - budget);

    return {
      month: currentMonth,
      budget,
      spent,
      income,
      remaining,
      netPosition: income - spent,
      percentage,
      daysElapsed: currentDay,
      daysInMonth,
      projectedTotal,
      projectedOverspend,
    };
  }, [bills, currentMonth, budget]);

  const analysis = useMemo<AnalysisItem[]>(() => {
    const items: AnalysisItem[] = [];
    if (!monthlyStats) return items;

    const { categoryBreakdown, incomeCategoryBreakdown, totalExpense, totalIncome, netSavings, topExpense } = monthlyStats;

    // 上一月数据对比（仅比较支出）
    const prevMonth = dayjs(currentMonth + '-01').subtract(1, 'month').format('YYYY-MM');
    const prevBills = bills.filter(b => b.date.startsWith(prevMonth));
    const prevExpenseBills = prevBills.filter(b => b.type === 'expense');
    const prevTotal = prevExpenseBills.reduce((sum, b) => sum + b.amount, 0);

    // 1. 最大支出分类
    if (categoryBreakdown.length > 0) {
      const top = categoryBreakdown[0];
      if (top.percentage >= 30) {
        items.push({
          type: 'info',
          icon: '📌',
          text: `${top.emoji}${top.categoryName}占比最高（${top.percentage}%），共 ¥${top.amount.toFixed(2)}，${top.count}笔记录`,
        });
      }
    }

    // 2. 环比变化
    if (prevTotal > 0 && totalExpense > 0) {
      const change = totalExpense - prevTotal;
      const changePercent = Math.round((change / prevTotal) * 100);
      if (changePercent > 20) {
        items.push({
          type: 'warning',
          icon: '📈',
          text: `相比上月支出增长了 ${changePercent}%（上月 ¥${prevTotal.toFixed(0)} → 本月 ¥${totalExpense.toFixed(0)}），注意控制`,
        });
      } else if (changePercent < -20) {
        items.push({
          type: 'good',
          icon: '✅',
          text: `相比上月支出下降了 ${Math.abs(changePercent)}%（上月 ¥${prevTotal.toFixed(0)} → 本月 ¥${totalExpense.toFixed(0)}），控制得不错！`,
        });
      }
    }

    // 3. 大额消费提醒
    if (topExpense && topExpense.amount >= 200) {
      const cat = getCategory(topExpense.categoryKey, 'expense');
      const note = topExpense.note ? `（${topExpense.note}）` : '';
      items.push({
        type: 'tip',
        icon: '💡',
        text: `最大单笔消费：${cat.emoji} ¥${topExpense.amount.toFixed(2)}${note}，日期 ${topExpense.date}`,
      });
    }

    // 4. 前三大类分析
    if (categoryBreakdown.length >= 2) {
      const top3 = categoryBreakdown.slice(0, 3);
      const top3Total = top3.reduce((s, c) => s + c.percentage, 0);
      if (top3Total >= 70) {
        const names = top3.map(c => c.emoji + c.categoryName).join('、');
        items.push({
          type: 'info',
          icon: '🔍',
          text: `${names} 三大类合计占总支出的 ${top3Total}%，可以考虑在这些方面优化`,
        });
      }
    }

    // 5. 预算预警
    if (budgetStatus && budgetStatus.budget > 0) {
      const { percentage, projectedOverspend, remaining, daysElapsed, daysInMonth } = budgetStatus;
      if (percentage >= 100) {
        items.push({
          type: 'warning',
          icon: '⚠️',
          text: `本月预算已超支 ¥${Math.abs(remaining).toFixed(2)}！建议暂停非必要消费`,
        });
      } else if (percentage >= 80) {
        items.push({
          type: 'warning',
          icon: '⚡',
          text: `预算已使用 ${percentage}%，剩余 ¥${remaining.toFixed(2)}，还剩 ${daysInMonth - daysElapsed} 天`,
        });
      }

      if (projectedOverspend > 0 && percentage < 100) {
        items.push({
          type: 'tip',
          icon: '🔮',
          text: `按目前消费速度，月底预计超预算 ¥${projectedOverspend.toFixed(0)}，建议日均控制在 ¥${Math.round(budgetStatus.budget / daysInMonth)} 以内`,
        });
      }

      if (percentage < 50 && daysElapsed > daysInMonth * 0.7) {
        items.push({
          type: 'good',
          icon: '👍',
          text: `月底将至，预算还剩 ¥${remaining.toFixed(2)}（${100 - percentage}%），控制得非常好！`,
        });
      }
    }

    // --- 新增：收入相关分析 ---

    // 6. 结余分析
    if (totalIncome > 0) {
      if (netSavings > 0) {
        items.push({
          type: 'positive',
          icon: '🎉',
          text: `本月结余 ¥${netSavings.toFixed(2)}，收入覆盖支出后还有剩余，继续保持！`,
        });
      } else if (netSavings < 0) {
        items.push({
          type: 'warning',
          icon: '📉',
          text: `本月入不敷出，结余 ¥${netSavings.toFixed(2)}，支出超出收入 ¥${Math.abs(netSavings).toFixed(2)}`,
        });
      }
    }

    // 7. 最大收入来源
    if (incomeCategoryBreakdown.length > 0) {
      const topIncome = incomeCategoryBreakdown[0];
      items.push({
        type: 'info',
        icon: '💎',
        text: `主要收入来源：${topIncome.emoji}${topIncome.categoryName} ¥${topIncome.amount.toFixed(2)}，占收入 ${topIncome.percentage}%`,
      });
    }

    // 8. 储蓄率分析
    if (totalIncome > 0 && netSavings > 0) {
      const savingsRate = Math.round((netSavings / totalIncome) * 100);
      if (savingsRate >= 30) {
        items.push({
          type: 'good',
          icon: '🏆',
          text: `储蓄率高达 ${savingsRate}%，理财能力出色！`,
        });
      } else if (savingsRate < 10) {
        items.push({
          type: 'tip',
          icon: '💡',
          text: `储蓄率仅 ${savingsRate}%，建议适当控制支出以增加结余`,
        });
      }
    }

    // 9. 无数据时的引导
    if (items.length === 0) {
      items.push({
        type: 'tip',
        icon: '💡',
        text: '开始记账后，这里会显示智能分析建议，帮你更好管理财务',
      });
    }

    return items;
  }, [monthlyStats, budgetStatus, bills, currentMonth]);

  // 近6个月趋势数据（支出+收入双线）
  const trendData = useMemo(() => {
    const months: { month: string; expense: number; income: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = dayjs(currentMonth + '-01').subtract(i, 'month').format('YYYY-MM');
      const monthBills = bills.filter(b => b.date.startsWith(m));
      const expense = monthBills.filter(b => b.type === 'expense')
        .reduce((sum, b) => sum + b.amount, 0);
      const income = monthBills.filter(b => b.type === 'income')
        .reduce((sum, b) => sum + b.amount, 0);
      months.push({ month: m, expense, income });
    }
    return months;
  }, [bills, currentMonth]);

  return {
    monthlyStats,
    budgetStatus,
    analysis,
    trendData,
  };
}

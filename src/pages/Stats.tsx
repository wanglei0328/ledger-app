import { useState } from 'react';
import type { Bill } from '../types';
import { useAnalysis } from '../hooks/useAnalysis';
import PieChart from '../components/PieChart';
import LineChart from '../components/LineChart';
import BudgetBar from '../components/BudgetBar';
import Analysis from '../components/Analysis';
import dayjs from 'dayjs';
import './Stats.css';

interface Props {
  bills: Bill[];
  budget: number;
}

const INCOME_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669', '#047857'];

export default function Stats({ bills, budget }: Props) {
  const [viewMonth, setViewMonth] = useState(dayjs().format('YYYY-MM'));

  const prevMonth = () => {
    setViewMonth(dayjs(viewMonth + '-01').subtract(1, 'month').format('YYYY-MM'));
  };
  const nextMonth = () => {
    const next = dayjs(viewMonth + '-01').add(1, 'month').format('YYYY-MM');
    if (next <= dayjs().format('YYYY-MM')) {
      setViewMonth(next);
    }
  };

  const { monthlyStats, budgetStatus, analysis, trendData } = useAnalysis(
    bills,
    budget,
    viewMonth
  );

  const isCurrentMonth = viewMonth === dayjs().format('YYYY-MM');

  return (
    <div className="stats-page">
      {/* 月份切换 */}
      <div className="stats-month-switch">
        <button className="sms-btn" onClick={prevMonth} type="button">←</button>
        <span className="sms-label">
          {dayjs(viewMonth + '-01').format('YYYY年M月')}
          {isCurrentMonth && ' (本月)'}
        </span>
        <button
          className="sms-btn"
          onClick={nextMonth}
          disabled={isCurrentMonth}
          type="button"
        >
          →
        </button>
      </div>

      {!monthlyStats ? (
        <div className="stats-empty">
          <div className="stats-empty-icon">📊</div>
          <div className="stats-empty-text">本月暂无账单记录</div>
          <div className="stats-empty-sub">开始记账后这里会显示统计分析</div>
        </div>
      ) : (
        <>
          {/* 总览卡片 - 三栏：收入/支出/结余 */}
          <div className="stats-overview">
            <div className="so-row">
              <div className="so-card">
                <div className="so-label">本月收入</div>
                <div className="so-amount so-amount-income">
                  ¥{monthlyStats.totalIncome.toFixed(2)}
                </div>
                <div className="so-sub">{monthlyStats.incomeCount} 笔收入</div>
              </div>
              <div className="so-card">
                <div className="so-label">本月支出</div>
                <div className="so-amount">
                  ¥{monthlyStats.totalExpense.toFixed(2)}
                </div>
                <div className="so-sub">
                  {monthlyStats.expenseCount} 笔 · 日均 ¥{monthlyStats.avgPerDay.toFixed(2)}
                </div>
              </div>
              <div className="so-card">
                <div className="so-label">本月结余</div>
                <div className={`so-amount ${monthlyStats.netSavings >= 0 ? 'so-amount-income' : ''}`}>
                  {monthlyStats.netSavings >= 0 ? '+' : ''}¥{monthlyStats.netSavings.toFixed(2)}
                </div>
                <div className="so-sub">收入 - 支出</div>
              </div>
            </div>

            {/* 预算进度 */}
            {budget > 0 && budgetStatus && (
              <div className="so-budget">
                <div className="so-label">
                  预算 ¥{budget} · 已用 {budgetStatus.percentage}%
                  {budgetStatus.income > 0 && (
                    <span className="so-net-position">
                      {' '}· 净头寸 ¥{budgetStatus.netPosition.toFixed(0)}
                    </span>
                  )}
                </div>
                <BudgetBar
                  spent={budgetStatus.spent}
                  budget={budget}
                  percentage={budgetStatus.percentage}
                />
              </div>
            )}
          </div>

          {/* 收入来源 */}
          {monthlyStats.incomeCategoryBreakdown.length > 0 && (
            <div className="stats-section">
              <div className="ss-title">💰 收入来源</div>
              <div className="ss-ranking">
                {monthlyStats.incomeCategoryBreakdown.slice(0, 5).map((cat, i) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const barWidth = Math.max(cat.percentage, 5);
                  return (
                    <div key={cat.categoryKey} className="ss-rank-item">
                      <div className="ss-rank-left">
                        <span className="ss-rank-medal">
                          {i < 3 ? medals[i] : `${i + 1}`}
                        </span>
                        <span className="ss-rank-emoji">{cat.emoji}</span>
                        <span className="ss-rank-name">{cat.categoryName}</span>
                      </div>
                      <div className="ss-rank-right">
                        <span className="ss-rank-amount-income">¥{cat.amount.toFixed(0)}</span>
                        <span className="ss-rank-pct">{cat.percentage}%</span>
                      </div>
                      <div
                        className="ss-rank-bar ss-rank-bar-income"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <PieChart data={monthlyStats.incomeCategoryBreakdown} colors={INCOME_COLORS} />
            </div>
          )}

          {/* 支出分类占比 */}
          {monthlyStats.categoryBreakdown.length > 0 && (
            <div className="stats-section">
              <div className="ss-title">💸 钱花在哪了？</div>

              <div className="ss-ranking">
                {monthlyStats.categoryBreakdown.slice(0, 5).map((cat, i) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const barWidth = Math.max(cat.percentage, 5);
                  return (
                    <div key={cat.categoryKey} className="ss-rank-item">
                      <div className="ss-rank-left">
                        <span className="ss-rank-medal">
                          {i < 3 ? medals[i] : `${i + 1}`}
                        </span>
                        <span className="ss-rank-emoji">{cat.emoji}</span>
                        <span className="ss-rank-name">{cat.categoryName}</span>
                      </div>
                      <div className="ss-rank-right">
                        <span className="ss-rank-amount">¥{cat.amount.toFixed(0)}</span>
                        <span className="ss-rank-pct">{cat.percentage}%</span>
                      </div>
                      <div
                        className="ss-rank-bar"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              <PieChart data={monthlyStats.categoryBreakdown} />
            </div>
          )}

          {/* 近6个月趋势 */}
          <div className="stats-section">
            <div className="ss-title">📈 近6个月趋势</div>
            <LineChart data={trendData} />
          </div>

          {/* 智能分析 */}
          <Analysis items={analysis} />
        </>
      )}
    </div>
  );
}

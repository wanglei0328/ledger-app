import { useState, useRef } from 'react';
import type { RecurringBill, CycleType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategory } from '../data/categories';
import { generateId } from '../data/storage';
import dayjs from 'dayjs';
import './Settings.css';

const CYCLE_LABELS: Record<CycleType, string> = {
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
  yearly: '每年',
};

interface Props {
  budget: number;
  onBudgetChange: (amount: number) => void;
  onExport: () => string;
  onImport: (json: string) => void;
  onClear: () => void;
  recurringBills: RecurringBill[];
  onAddRecurring: (rb: RecurringBill) => void;
  onUpdateRecurring: (id: string, updates: Partial<RecurringBill>) => void;
  onDeleteRecurring: (id: string) => void;
}

// ---- 周期账单表单初始值 ----
function emptyRbForm(): {
  amount: string; type: 'expense' | 'income'; categoryKey: string; cycle: CycleType;
  cycleDay: string; note: string;
} {
  return { amount: '', type: 'expense', categoryKey: 'food', cycle: 'monthly', cycleDay: '1', note: '' };
}

export default function Settings({
  budget, onBudgetChange, onExport, onImport, onClear,
  recurringBills, onAddRecurring, onUpdateRecurring, onDeleteRecurring,
}: Props) {
  const [budgetInput, setBudgetInput] = useState(budget > 0 ? String(budget) : '');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toast, setToast] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // 周期账单表单
  const [showRbForm, setShowRbForm] = useState(false);
  const [rbForm, setRbForm] = useState(emptyRbForm());

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  // ---- 预算 ----
  const handleSaveBudget = () => {
    const amount = parseFloat(budgetInput);
    if (!isNaN(amount) && amount > 0) {
      onBudgetChange(amount);
      showToast('预算已保存 ✓');
    } else if (budgetInput === '' || parseFloat(budgetInput) === 0) {
      onBudgetChange(0);
      showToast('预算已清除 ✓');
    }
  };

  // ---- 数据导入导出 ----
  const handleExport = () => {
    const json = onExport();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `记账数据备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('导出成功 ✓');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onImport(reader.result as string);
        showToast('导入成功 ✓');
        setTimeout(() => window.location.reload(), 500);
      } catch {
        showToast('文件格式错误 ✗');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ---- 清除数据 ----
  const handleClear = () => {
    onClear();
    setShowClearConfirm(false);
    showToast('数据已清除');
    setTimeout(() => window.location.reload(), 500);
  };

  // ---- 周期账单表单 ----
  const handleRbSubmit = () => {
    const amount = parseFloat(rbForm.amount);
    if (!amount || amount <= 0) { showToast('请输入有效金额'); return; }

    const cycleDay = parseInt(rbForm.cycleDay, 10);
    if (isNaN(cycleDay) || cycleDay < 0) { showToast('请输入有效的日期参数'); return; }

    const today = dayjs().format('YYYY-MM-DD');
    const nextDue = getNextDueFromNow(rbForm.cycle, cycleDay);

    const rb: RecurringBill = {
      id: generateId(),
      amount,
      type: rbForm.type,
      categoryKey: rbForm.categoryKey,
      note: rbForm.note.trim(),
      cycle: rbForm.cycle,
      cycleDay,
      startDate: today,
      isActive: true,
      nextDueDate: nextDue,
    };

    onAddRecurring(rb);
    setRbForm(emptyRbForm());
    setShowRbForm(false);
    showToast('周期账单已添加 ✓');
  };

  const handleToggleRb = (rb: RecurringBill) => {
    onUpdateRecurring(rb.id, { isActive: !rb.isActive });
    showToast(rb.isActive ? '已暂停' : '已启用');
  };

  const handleDeleteRb = (rb: RecurringBill) => {
    onDeleteRecurring(rb.id);
    showToast('已删除');
  };

  // 获取当前类型对应的分类
  const currentCategories = rbForm.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="settings-page">
      {toast && <div className="se-toast">{toast}</div>}

      {/* ===== 月度预算 ===== */}
      <div className="settings-section">
        <div className="se-title">💰 月度预算</div>
        <div className="se-desc">设置后可在统计页看到预算进度和预警</div>
        <div className="se-budget-row">
          <span className="se-yuan">¥</span>
          <input
            className="se-budget-input"
            type="number"
            placeholder="输入月度预算金额"
            value={budgetInput}
            onChange={e => setBudgetInput(e.target.value)}
            onBlur={handleSaveBudget}
          />
          <button className="se-btn se-btn-primary" onClick={handleSaveBudget} type="button">
            保存
          </button>
        </div>
        {budget > 0 && (
          <div className="se-current">
            当前预算：¥{budget.toLocaleString()}/月
          </div>
        )}
      </div>

      {/* ===== 周期账单 ===== */}
      <div className="settings-section">
        <div className="se-title">🔄 周期账单</div>
        <div className="se-desc">自动按日/周/月/年定时生成账单，如房租、工资、订阅等</div>

        {recurringBills.length === 0 && !showRbForm ? (
          <div className="rb-empty">
            暂无周期账单，点击下方按钮添加
          </div>
        ) : (
          <div className="recurring-list">
            {recurringBills.map(rb => {
              const cat = getCategory(rb.categoryKey, rb.type);
              const isOverdue = rb.nextDueDate < dayjs().format('YYYY-MM-DD');
              return (
                <div className="rb-item" key={rb.id}>
                  <div className="rb-icon">{cat.emoji}</div>
                  <div className="rb-info">
                    <div className="rb-name">{cat.name}{rb.note ? ` · ${rb.note}` : ''}</div>
                    <div className={`rb-meta${isOverdue ? ' rb-meta-overdue' : ''}`}>
                      {CYCLE_LABELS[rb.cycle]}
                      {rb.cycle === 'monthly' && `(${rb.cycleDay}号)`}
                      {rb.cycle === 'weekly' && `(周${['日','一','二','三','四','五','六'][rb.cycleDay]})`}
                      {rb.cycle === 'yearly' && `(${Math.floor(rb.cycleDay/100)}月${rb.cycleDay%100}日)`}
                      {' · '}
                      {isOverdue ? '已逾期' : `下次: ${rb.nextDueDate.slice(5)}`}
                    </div>
                  </div>
                  <div className={`rb-amount ${rb.type === 'expense' ? 'rb-amount-expense' : 'rb-amount-income'}`}>
                    {rb.type === 'expense' ? '-' : '+'}¥{rb.amount.toLocaleString()}
                  </div>
                  <button
                    className={`rb-toggle${rb.isActive ? ' rb-toggle-active' : ''}`}
                    onClick={() => handleToggleRb(rb)}
                    type="button"
                    aria-label={rb.isActive ? '暂停' : '启用'}
                  />
                  <button
                    className="rb-delete"
                    onClick={() => handleDeleteRb(rb)}
                    type="button"
                    aria-label="删除"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 添加表单 */}
        {showRbForm ? (
          <div className="rb-form">
            <div className="rb-form-title">新增周期账单</div>

            <div className="rb-form-row">
              <span className="se-yuan" style={{ alignSelf: 'center' }}>¥</span>
              <input
                className="rb-form-input"
                type="number"
                placeholder="金额"
                value={rbForm.amount}
                onChange={e => setRbForm(prev => ({ ...prev, amount: e.target.value }))}
              />
              <select
                className="rb-form-select"
                value={rbForm.type}
                onChange={e => setRbForm(prev => ({
                  ...prev,
                  type: e.target.value as 'expense' | 'income',
                  categoryKey: e.target.value === 'income' ? 'salary' : 'food',
                }))}
              >
                <option value="expense">支出</option>
                <option value="income">收入</option>
              </select>
            </div>

            <div className="rb-form-row">
              <select
                className="rb-form-select"
                style={{ flex: 1 }}
                value={rbForm.categoryKey}
                onChange={e => setRbForm(prev => ({ ...prev, categoryKey: e.target.value }))}
              >
                {currentCategories.map(c => (
                  <option key={c.key} value={c.key}>{c.emoji} {c.name}</option>
                ))}
              </select>
              <select
                className="rb-form-select"
                value={rbForm.cycle}
                onChange={e => setRbForm(prev => ({
                  ...prev,
                  cycle: e.target.value as CycleType,
                  cycleDay: e.target.value === 'daily' ? '0' : '1',
                }))}
              >
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
                <option value="yearly">每年</option>
              </select>
            </div>

            {/* cycleDay 输入 */}
            {rbForm.cycle !== 'daily' && (
              <div className="rb-form-row">
                {rbForm.cycle === 'weekly' ? (
                  <select
                    className="rb-form-select"
                    style={{ flex: 1 }}
                    value={rbForm.cycleDay}
                    onChange={e => setRbForm(prev => ({ ...prev, cycleDay: e.target.value }))}
                  >
                    {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((d, i) => (
                      <option key={i} value={i}>{d}</option>
                    ))}
                  </select>
                ) : rbForm.cycle === 'monthly' ? (
                  <>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)', alignSelf: 'center', whiteSpace: 'nowrap' }}>每月</span>
                    <input
                      className="rb-form-input"
                      type="number"
                      min="1" max="31"
                      placeholder="几号"
                      value={rbForm.cycleDay}
                      onChange={e => setRbForm(prev => ({ ...prev, cycleDay: e.target.value }))}
                    />
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)', alignSelf: 'center' }}>号</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)', alignSelf: 'center', whiteSpace: 'nowrap' }}>每年</span>
                    <input
                      className="rb-form-input"
                      type="number"
                      min="1" max="12"
                      placeholder="月"
                      style={{ width: 60, flex: 'none' }}
                      value={rbForm.cycleDay ? Math.floor(parseInt(rbForm.cycleDay, 10) / 100) || '' : ''}
                      onChange={e => {
                        const m = parseInt(e.target.value, 10) || 0;
                        const d = rbForm.cycleDay ? parseInt(rbForm.cycleDay, 10) % 100 : 1;
                        setRbForm(prev => ({ ...prev, cycleDay: String(m * 100 + d) }));
                      }}
                    />
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)', alignSelf: 'center' }}>月</span>
                    <input
                      className="rb-form-input"
                      type="number"
                      min="1" max="31"
                      placeholder="日"
                      style={{ width: 60, flex: 'none' }}
                      value={rbForm.cycleDay ? parseInt(rbForm.cycleDay, 10) % 100 || '' : ''}
                      onChange={e => {
                        const d = parseInt(e.target.value, 10) || 0;
                        const m = rbForm.cycleDay ? Math.floor(parseInt(rbForm.cycleDay, 10) / 100) : 0;
                        setRbForm(prev => ({ ...prev, cycleDay: String(m * 100 + d) }));
                      }}
                    />
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)', alignSelf: 'center' }}>日</span>
                  </>
                )}
              </div>
            )}

            <div className="rb-form-row">
              <input
                className="rb-form-input"
                type="text"
                placeholder="备注（选填）"
                value={rbForm.note}
                onChange={e => setRbForm(prev => ({ ...prev, note: e.target.value }))}
              />
            </div>

            <div className="rb-form-btns">
              <button className="rb-form-save" onClick={handleRbSubmit} type="button">
                保存
              </button>
              <button
                className="rb-form-cancel"
                onClick={() => { setShowRbForm(false); setRbForm(emptyRbForm()); }}
                type="button"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            className="rb-add-btn"
            style={{ marginTop: recurringBills.length > 0 ? 12 : 0 }}
            onClick={() => setShowRbForm(true)}
            type="button"
          >
            ＋ 添加周期账单
          </button>
        )}
      </div>

      {/* ===== 数据管理 ===== */}
      <div className="settings-section">
        <div className="se-title">📦 数据管理</div>
        <div className="se-btn-row">
          <button className="se-btn-export" onClick={handleExport} type="button">
            📤 导出数据
          </button>
          <button
            className="se-btn-import"
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            📥 导入数据
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>
      </div>

      {/* ===== 危险操作 ===== */}
      <div className="se-danger">
        <div className="se-danger-title">⚠️ 危险操作</div>
        {!showClearConfirm ? (
          <button
            className="se-btn-danger"
            onClick={() => setShowClearConfirm(true)}
            type="button"
          >
            🗑️ 清除所有数据
          </button>
        ) : (
          <div className="se-clear-confirm">
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', flex: 1 }}>确定要清除所有数据吗？此操作不可恢复！</span>
            <button className="se-btn-confirm" onClick={handleClear} type="button">
              确认清除
            </button>
            <button
              className="se-btn-cancel"
              onClick={() => setShowClearConfirm(false)}
              type="button"
            >
              取消
            </button>
          </div>
        )}
      </div>

      <div className="settings-version">记账本 v1.0 · 数据仅存储在本地浏览器</div>
    </div>
  );
}

// ---- 工具函数 ----
function getNextDueFromNow(cycle: CycleType, cycleDay: number): string {
  const now = dayjs();
  switch (cycle) {
    case 'daily':
      return now.add(1, 'day').format('YYYY-MM-DD');
    case 'weekly': {
      const target = now.add(1, 'week').day(cycleDay);
      return target.isAfter(now) ? target.format('YYYY-MM-DD') : target.add(1, 'week').format('YYYY-MM-DD');
    }
    case 'monthly': {
      const next = now.add(1, 'month');
      const maxDay = next.daysInMonth();
      return next.date(Math.min(cycleDay, maxDay)).format('YYYY-MM-DD');
    }
    case 'yearly': {
      const m = Math.floor(cycleDay / 100);
      const d = cycleDay % 100;
      const next = now.add(1, 'year').month(m - 1);
      const maxDay = next.daysInMonth();
      return next.date(Math.min(d, maxDay)).format('YYYY-MM-DD');
    }
  }
}

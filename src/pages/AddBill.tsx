import { useState, useCallback, useEffect } from 'react';
import NumberPad from '../components/NumberPad';
import CategoryPicker from '../components/CategoryPicker';
import { getCategory } from '../data/categories';
import type { Bill } from '../types';
import dayjs from 'dayjs';
import './AddBill.css';

interface Props {
  onAdd: (amount: number, categoryKey: string, note: string, date: string, type: 'expense' | 'income') => void;
  bills: Bill[];
}

// 支出和收入分别记住上次使用的分类
function getLastCategory(type: 'expense' | 'income'): string {
  const key = type === 'expense' ? 'ledger_last_expense_category' : 'ledger_last_income_category';
  try {
    return localStorage.getItem(key) || (type === 'expense' ? 'food' : 'salary');
  } catch {
    return type === 'expense' ? 'food' : 'salary';
  }
}

function saveLastCategory(catKey: string, type: 'expense' | 'income') {
  const key = type === 'expense' ? 'ledger_last_expense_category' : 'ledger_last_income_category';
  try {
    localStorage.setItem(key, catKey);
  } catch { /* noop */ }
}

// 余额显示组件（本月结余 + 累计余额）
function BalanceDisplay({ bills }: { bills: Bill[] }) {
  const currentMonth = dayjs().format('YYYY-MM');

  const monthBills = bills.filter(b => b.date.startsWith(currentMonth));
  const monthIncome = monthBills.filter(b => b.type === 'income')
    .reduce((sum, b) => sum + b.amount, 0);
  const monthExpense = monthBills.filter(b => b.type === 'expense')
    .reduce((sum, b) => sum + b.amount, 0);
  const monthBalance = monthIncome - monthExpense;

  const totalIncome = bills.filter(b => b.type === 'income')
    .reduce((sum, b) => sum + b.amount, 0);
  const totalExpense = bills.filter(b => b.type === 'expense')
    .reduce((sum, b) => sum + b.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  return (
    <div className="ab-balance">
      <div className="ab-balance-row">
        <div className="ab-balance-item">
          <div className="ab-balance-label">本月结余</div>
          <div className={`ab-balance-amount ${monthBalance >= 0 ? 'ab-balance-positive' : 'ab-balance-negative'}`}>
            {monthBalance >= 0 ? '+' : ''}¥{monthBalance.toFixed(2)}
          </div>
          <div className="ab-balance-detail">
            收 ¥{monthIncome.toFixed(0)} · 支 ¥{monthExpense.toFixed(0)}
          </div>
        </div>
        <div className="ab-balance-divider" />
        <div className="ab-balance-item">
          <div className="ab-balance-label">累计余额</div>
          <div className={`ab-balance-amount ${totalBalance >= 0 ? 'ab-balance-positive' : 'ab-balance-negative'}`}>
            {totalBalance >= 0 ? '+' : ''}¥{totalBalance.toFixed(2)}
          </div>
          <div className="ab-balance-detail">
            收 ¥{totalIncome.toFixed(0)} · 支 ¥{totalExpense.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddBill({ onAdd, bills }: Props) {
  const [billType, setBillType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(() => getLastCategory('expense'));
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [saved, setSaved] = useState(false);

  // 切换类型时重置分类
  useEffect(() => {
    setCategory(getLastCategory(billType));
  }, [billType]);

  const handleSave = useCallback(() => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    onAdd(num, category, note, dayjs().format('YYYY-MM-DD'), billType);
    saveLastCategory(category, billType);

    // 重置
    setAmount('');
    setNote('');
    setShowNote(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }, [amount, category, note, onAdd, billType]);

  const selectedCat = getCategory(category, billType);
  const canSave = parseFloat(amount) > 0;

  return (
    <div className="add-bill-page">
      {/* 类型切换器 */}
      <div className="ab-type-switch">
        <button
          className={`ab-type-btn ${billType === 'expense' ? 'ab-type-active' : ''}`}
          onClick={() => setBillType('expense')}
          type="button"
        >
          支出
        </button>
        <button
          className={`ab-type-btn ${billType === 'income' ? 'ab-type-active ab-type-income' : ''}`}
          onClick={() => setBillType('income')}
          type="button"
        >
          收入
        </button>
      </div>

      {/* 余额显示 */}
      <BalanceDisplay bills={bills} />

      {/* 金额显示区 */}
      <div className="ab-amount-area">
        <div className="ab-currency">¥</div>
        <div className={`ab-amount ${amount ? '' : 'ab-amount-empty'}`}>
          {amount || '0.00'}
        </div>
        {saved && <div className="ab-saved-toast">✓ 已保存</div>}
      </div>

      {/* 数字键盘 */}
      <NumberPad value={amount} onChange={setAmount} />

      {/* 分类选择 */}
      <div className="ab-section-label">
        选择分类 · {billType === 'expense' ? '支出' : '收入'}
      </div>
      <CategoryPicker selected={category} onSelect={setCategory} type={billType} />

      {/* 备注 */}
      <div className="ab-note-area">
        {showNote ? (
          <div className="ab-note-input-wrap">
            <input
              className="ab-note-input"
              type="text"
              placeholder="备注（可选）"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={30}
              autoFocus
            />
            <button
              className="ab-note-done"
              onClick={() => setShowNote(false)}
              type="button"
            >
              完成
            </button>
          </div>
        ) : (
          <button
            className="ab-note-toggle"
            onClick={() => setShowNote(true)}
            type="button"
          >
            📝 {note ? note : '添加备注（可选）'}
          </button>
        )}
      </div>

      {/* 保存按钮 */}
      <button
        className={`ab-save-btn ${canSave ? 'ab-save-btn-active' : ''}`}
        onClick={handleSave}
        disabled={!canSave}
        type="button"
      >
        保存 {selectedCat.emoji} ¥{amount || '0.00'}
      </button>
    </div>
  );
}

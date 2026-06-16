import { useState, useRef } from 'react';
import './Settings.css';

interface Props {
  budget: number;
  onBudgetChange: (amount: number) => void;
  onExport: () => string;
  onImport: (json: string) => void;
  onClear: () => void;
}

export default function Settings({ budget, onBudgetChange, onExport, onImport, onClear }: Props) {
  const [budgetInput, setBudgetInput] = useState(budget > 0 ? String(budget) : '');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toast, setToast] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

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
        // 刷新页面
        setTimeout(() => window.location.reload(), 500);
      } catch {
        showToast('文件格式错误 ✗');
      }
    };
    reader.readAsText(file);
    // 重置 input 以允许重复导入同一文件
    e.target.value = '';
  };

  const handleClear = () => {
    onClear();
    setShowClearConfirm(false);
    showToast('数据已清除');
    setTimeout(() => window.location.reload(), 500);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  return (
    <div className="settings-page">
      {toast && <div className="settings-toast">{toast}</div>}

      {/* 月度预算 */}
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
          <button className="se-budget-save" onClick={handleSaveBudget} type="button">
            保存
          </button>
        </div>
        {budget > 0 && (
          <div className="se-budget-current">
            当前预算：¥{budget.toLocaleString()}/月
          </div>
        )}
      </div>

      {/* 数据管理 */}
      <div className="settings-section">
        <div className="se-title">📦 数据管理</div>
        <div className="se-actions">
          <button className="se-btn se-btn-export" onClick={handleExport} type="button">
            📤 导出数据
          </button>
          <button
            className="se-btn se-btn-import"
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

      {/* 清除数据 */}
      <div className="settings-section settings-danger">
        <div className="se-title">⚠️ 危险操作</div>
        {!showClearConfirm ? (
          <button
            className="se-btn se-btn-clear"
            onClick={() => setShowClearConfirm(true)}
            type="button"
          >
            🗑️ 清除所有数据
          </button>
        ) : (
          <div className="se-clear-confirm">
            <div className="se-clear-warn">确定要清除所有数据吗？此操作不可恢复！</div>
            <div className="se-clear-btns">
              <button className="se-btn se-btn-clear-yes" onClick={handleClear} type="button">
                确认清除
              </button>
              <button
                className="se-btn se-btn-clear-no"
                onClick={() => setShowClearConfirm(false)}
                type="button"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="settings-version">记账本 v1.0 · 数据仅存储在本地浏览器</div>
    </div>
  );
}

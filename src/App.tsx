import { useState, lazy, Suspense } from 'react';
import { useAppData } from './hooks/useAppData';
import TabBar from './components/TabBar';
import './App.css';

// 页面级懒加载 — 首屏只加载记账页
const AddBill = lazy(() => import('./pages/AddBill'));
const Bills = lazy(() => import('./pages/Bills'));
const Stats = lazy(() => import('./pages/Stats'));
const Settings = lazy(() => import('./pages/Settings'));

function PageFallback() {
  return <div className="page-loading"><div className="pl-spinner" /></div>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('add');
  const { bills, budget, add, remove, updateBudget, exportAll, importAll, clearAll, recurringBills, addRecurring, updateRecurring, deleteRecurring } = useAppData();

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">记账本</h1>
        <button
          className="app-settings-btn"
          onClick={() => setActiveTab('settings')}
          type="button"
          aria-label="设置"
        >
          ⚙️
        </button>
      </header>

      <main className="app-main">
        <Suspense fallback={<PageFallback />}>
          {activeTab === 'add' && <AddBill onAdd={add} bills={bills} />}
          {activeTab === 'bills' && <Bills bills={bills} onDelete={remove} />}
          {activeTab === 'stats' && <Stats bills={bills} budget={budget} />}
          {activeTab === 'settings' && (
            <Settings
              budget={budget}
              onBudgetChange={updateBudget}
              onExport={exportAll}
              onImport={importAll}
              onClear={clearAll}
              recurringBills={recurringBills}
              onAddRecurring={addRecurring}
              onUpdateRecurring={updateRecurring}
              onDeleteRecurring={deleteRecurring}
            />
          )}
        </Suspense>
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

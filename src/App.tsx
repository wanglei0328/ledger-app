import { useState } from 'react';
import { useAppData } from './hooks/useAppData';
import TabBar from './components/TabBar';
import AddBill from './pages/AddBill';
import Bills from './pages/Bills';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('add');
  const { bills, budget, add, remove, updateBudget, exportAll, importAll, clearAll } = useAppData();

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">记账本</h1>
        <button
          className="app-settings-btn"
          onClick={() => setActiveTab('settings')}
          type="button"
        >
          ⚙️
        </button>
      </header>

      <main className="app-main">
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
          />
        )}
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

import './TabBar.css';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { key: 'add', label: '记账', icon: '📝' },
  { key: 'bills', label: '账单', icon: '📋' },
  { key: 'stats', label: '统计', icon: '📊' },
];

export default function TabBar({ activeTab, onTabChange }: Props) {
  return (
    <div className="tab-bar">
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`tab-item ${activeTab === tab.key ? 'tab-active' : ''}`}
          onClick={() => onTabChange(tab.key)}
          type="button"
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

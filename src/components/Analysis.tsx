import type { AnalysisItem } from '../types';
import './Analysis.css';

interface Props {
  items: AnalysisItem[];
}

export default function Analysis({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="analysis-section">
      <div className="as-title">💡 智能分析</div>
      <div className="as-list">
        {items.map((item, i) => (
          <div key={i} className={`as-item as-${item.type}`}>
            <span className="as-icon">{item.icon}</span>
            <span className="as-text">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

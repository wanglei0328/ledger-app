import './BudgetBar.css';

interface Props {
  spent: number;
  budget: number;
  percentage: number;
}

export default function BudgetBar({ spent, budget, percentage }: Props) {
  const isOver = percentage >= 100;
  const barColor = isOver ? '#ef4444' : percentage >= 80 ? '#f59e0b' : '#4f46e5';

  return (
    <div className="budget-bar-wrap">
      <div className="bb-track">
        <div
          className="bb-fill"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            background: barColor,
          }}
        />
      </div>
      <div className="bb-info">
        <span>已用 ¥{spent.toFixed(0)}</span>
        <span className={isOver ? 'bb-over' : ''}>
          {isOver ? `超支 ¥${(spent - budget).toFixed(0)}` : `剩余 ¥${(budget - spent).toFixed(0)}`}
        </span>
      </div>
    </div>
  );
}

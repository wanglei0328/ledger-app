import type { Bill } from '../types';
import { getCategory } from '../data/categories';
import './BillItem.css';

interface Props {
  bill: Bill;
  onDelete: (id: string) => void;
}

export default function BillItem({ bill, onDelete }: Props) {
  const cat = getCategory(bill.categoryKey, bill.type);
  const isIncome = bill.type === 'income';

  const handleDelete = () => {
    if (window.confirm('确定删除这条记录吗？')) {
      onDelete(bill.id);
    }
  };

  return (
    <div className="bill-item">
      <div className="bi-icon">{cat.emoji}</div>
      <div className="bi-info">
        <div className="bi-name">{cat.name}</div>
        {bill.note && <div className="bi-note">{bill.note}</div>}
      </div>
      <div className={`bi-amount ${isIncome ? 'bi-amount-income' : ''}`}>
        {isIncome ? '+' : '-'}¥{bill.amount.toFixed(2)}
      </div>
      <button className="bi-delete" onClick={handleDelete} type="button" title="删除">
        🗑️
      </button>
    </div>
  );
}

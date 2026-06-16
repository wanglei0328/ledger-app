import type { Bill } from '../types';
import BillItem from './BillItem';
import dayjs from 'dayjs';
import './BillGroup.css';

interface Props {
  date: string;
  bills: Bill[];
  onDelete: (id: string) => void;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function BillGroup({ date, bills, onDelete }: Props) {
  const d = dayjs(date);
  const weekday = WEEKDAYS[d.day()];
  const expenseTotal = bills.filter(b => b.type === 'expense')
    .reduce((sum, b) => sum + b.amount, 0);
  const incomeTotal = bills.filter(b => b.type === 'income')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="bill-group">
      <div className="bg-header">
        <div className="bg-date">
          <span className="bg-date-main">{d.format('M月D日')}</span>
          <span className="bg-date-sub">{weekday}</span>
        </div>
        <div className="bg-sum">
          {expenseTotal > 0 && <span className="bg-sum-expense">支出 ¥{expenseTotal.toFixed(2)}</span>}
          {incomeTotal > 0 && <span className="bg-sum-income">收入 ¥{incomeTotal.toFixed(2)}</span>}
        </div>
      </div>
      <div className="bg-list">
        {bills.map(bill => (
          <BillItem key={bill.id} bill={bill} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

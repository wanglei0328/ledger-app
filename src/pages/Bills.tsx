import { useState, useMemo } from 'react';
import type { Bill } from '../types';
import BillGroup from '../components/BillGroup';
import './Bills.css';

interface Props {
  bills: Bill[];
  onDelete: (id: string) => void;
}

type FilterType = 'all' | 'week' | 'month';

export default function Bills({ bills, onDelete }: Props) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filteredBills = useMemo(() => {
    let result = bills;

    // 时间筛选
    const now = new Date();
    if (filter === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      result = result.filter(b => new Date(b.date) >= weekAgo);
    } else if (filter === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      result = result.filter(b => new Date(b.date) >= monthAgo);
    }

    // 搜索
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      result = result.filter(b => b.note.toLowerCase().includes(kw));
    }

    return result;
  }, [bills, filter, search]);

  // 按日期分组
  const groups = useMemo(() => {
    const map = new Map<string, Bill[]>();
    filteredBills.forEach(b => {
      const list = map.get(b.date) || [];
      list.push(b);
      map.set(b.date, list);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredBills]);

  return (
    <div className="bills-page">
      {/* 搜索 */}
      <div className="bills-search">
        <input
          className="bills-search-input"
          type="text"
          placeholder="🔍 搜索备注..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* 筛选 */}
      <div className="bills-filter">
        {([
          ['all', '全部'],
          ['week', '本周'],
          ['month', '本月'],
        ] as [FilterType, string][]).map(([key, label]) => (
          <button
            key={key}
            className={`bf-btn ${filter === key ? 'bf-btn-active' : ''}`}
            onClick={() => setFilter(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="bills-list">
        {groups.length === 0 ? (
          <div className="bills-empty">
            <div className="bills-empty-icon">📋</div>
            <div className="bills-empty-text">
              {bills.length === 0 ? '还没有账单记录' : '没有匹配的记录'}
            </div>
            <div className="bills-empty-sub">
              {bills.length === 0 ? '去记账页添加第一笔吧' : '试试调整筛选条件'}
            </div>
          </div>
        ) : (
          groups.map(([date, dayBills]) => (
            <BillGroup key={date} date={date} bills={dayBills} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}

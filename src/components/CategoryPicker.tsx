import { getCategories } from '../data/categories';
import './CategoryPicker.css';

interface Props {
  selected: string;
  onSelect: (key: string) => void;
  type: 'expense' | 'income';
}

export default function CategoryPicker({ selected, onSelect, type }: Props) {
  const categories = getCategories(type);

  return (
    <div className="category-picker">
      {categories.map(cat => (
        <button
          key={cat.key}
          className={`cp-item ${selected === cat.key ? 'cp-item-active' : ''}`}
          onClick={() => onSelect(cat.key)}
          type="button"
        >
          <span className="cp-emoji">{cat.emoji}</span>
          <span className="cp-name">{cat.name}</span>
        </button>
      ))}
    </div>
  );
}

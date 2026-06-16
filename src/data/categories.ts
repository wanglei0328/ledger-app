import type { Category } from '../types';

export const EXPENSE_CATEGORIES: Category[] = [
  { key: 'food', name: '餐饮', emoji: '🍽️' },
  { key: 'transport', name: '交通', emoji: '🚗' },
  { key: 'shopping', name: '购物', emoji: '🛒' },
  { key: 'entertainment', name: '娱乐', emoji: '🎬' },
  { key: 'housing', name: '居家', emoji: '🏠' },
  { key: 'medical', name: '医疗', emoji: '💊' },
  { key: 'social', name: '人情', emoji: '🎁' },
  { key: 'other', name: '其他', emoji: '📦' },
];

export const INCOME_CATEGORIES: Category[] = [
  { key: 'salary', name: '工资', emoji: '💰' },
  { key: 'parttime', name: '兼职', emoji: '💼' },
  { key: 'invest', name: '理财', emoji: '📈' },
  { key: 'redpacket', name: '红包', emoji: '🧧' },
  { key: 'refund', name: '退款', emoji: '↩️' },
  { key: 'income_other', name: '其他', emoji: '📦' },
];

export function getCategory(key: string, type?: 'expense' | 'income'): Category {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return categories.find(c => c.key === key) || categories[categories.length - 1];
}

export function getCategories(type: 'expense' | 'income'): Category[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

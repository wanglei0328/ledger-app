import type { AppData, Bill } from '../types';

const STORAGE_KEY = 'ledger_app_data';

function getDefaultData(): AppData {
  return {
    bills: [],
    budget: 0,
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const data = JSON.parse(raw) as AppData;
    return {
      bills: data.bills || [],
      budget: data.budget || 0,
    };
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addBill(bill: Bill): AppData {
  const data = loadData();
  data.bills.unshift(bill);
  saveData(data);
  return data;
}

export function deleteBill(id: string): AppData {
  const data = loadData();
  data.bills = data.bills.filter(b => b.id !== id);
  saveData(data);
  return data;
}

export function setBudget(amount: number): AppData {
  const data = loadData();
  data.budget = amount;
  saveData(data);
  return data;
}

export function exportData(): string {
  return JSON.stringify(loadData(), null, 2);
}

export function importData(json: string): AppData {
  const data = JSON.parse(json) as AppData;
  if (!Array.isArray(data.bills)) throw new Error('数据格式错误');
  saveData(data);
  return data;
}

export function clearAllData(): AppData {
  const empty = getDefaultData();
  saveData(empty);
  return empty;
}

// 生成简单 UUID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

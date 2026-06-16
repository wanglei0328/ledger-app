import type { AppData, Bill, RecurringBill, CycleType } from '../types';
import dayjs from 'dayjs';

const STORAGE_KEY = 'ledger_app_data';

function getDefaultData(): AppData {
  return {
    bills: [],
    budget: 0,
    recurringBills: [],
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
      recurringBills: data.recurringBills || [],
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

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ==================== 周期账单 ====================

function getNextDueDate(current: string, cycle: CycleType, cycleDay: number): string {
  const d = dayjs(current);
  switch (cycle) {
    case 'daily':
      return d.add(1, 'day').format('YYYY-MM-DD');
    case 'weekly': {
      // cycleDay = 0(周日)~6(周六)
      const target = d.add(1, 'week').day(cycleDay);
      // 如果算出来还在当前周之前，加一周
      return target.isAfter(d) ? target.format('YYYY-MM-DD') : target.add(1, 'week').format('YYYY-MM-DD');
    }
    case 'monthly': {
      const next = d.add(1, 'month');
      const maxDay = next.daysInMonth();
      const day = Math.min(cycleDay, maxDay);
      return next.date(day).format('YYYY-MM-DD');
    }
    case 'yearly': {
      const m = Math.floor(cycleDay / 100);
      const da = cycleDay % 100;
      const next = d.add(1, 'year').month(m - 1);
      const maxDay = next.daysInMonth();
      return next.date(Math.min(da, maxDay)).format('YYYY-MM-DD');
    }
  }
}

/** 处理所有到期的周期账单，自动生成 Bill */
export function processRecurringBills(): AppData {
  const data = loadData();
  const today = dayjs().format('YYYY-MM-DD');
  let changed = false;

  for (const rb of data.recurringBills) {
    if (!rb.isActive) continue;
    if (rb.endDate && rb.endDate < today) {
      rb.isActive = false;
      changed = true;
      continue;
    }

    // 生成所有到期但未生成的账单
    while (rb.nextDueDate <= today) {
      // 防止同一天重复生成
      if (rb.lastGenerated === rb.nextDueDate) {
        rb.nextDueDate = getNextDueDate(rb.nextDueDate, rb.cycle, rb.cycleDay);
        changed = true;
        continue;
      }

      data.bills.unshift({
        id: generateId(),
        amount: rb.amount,
        type: rb.type,
        categoryKey: rb.categoryKey,
        note: rb.note + ' 🔄',
        date: rb.nextDueDate,
      });

      rb.lastGenerated = rb.nextDueDate;
      rb.nextDueDate = getNextDueDate(rb.nextDueDate, rb.cycle, rb.cycleDay);
      changed = true;
    }
  }

  if (changed) saveData(data);
  return data;
}

// 周期账单 CRUD
export function addRecurringBill(rb: RecurringBill): AppData {
  const data = loadData();
  data.recurringBills.unshift(rb);
  saveData(data);
  return data;
}

export function updateRecurringBill(id: string, updates: Partial<RecurringBill>): AppData {
  const data = loadData();
  const idx = data.recurringBills.findIndex(r => r.id === id);
  if (idx === -1) return data;
  data.recurringBills[idx] = { ...data.recurringBills[idx], ...updates };
  saveData(data);
  return data;
}

export function deleteRecurringBill(id: string): AppData {
  const data = loadData();
  data.recurringBills = data.recurringBills.filter(r => r.id !== id);
  saveData(data);
  return data;
}

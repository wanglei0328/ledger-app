import { useState, useCallback, useEffect } from 'react';
import type { AppData, Bill, RecurringBill } from '../types';
import {
  loadData, addBill, deleteBill, setBudget, exportData, importData, clearAllData, generateId,
  processRecurringBills, addRecurringBill, updateRecurringBill, deleteRecurringBill,
} from '../data/storage';

export function useAppData() {
  const [data, setData] = useState<AppData>(() => {
    // 首次加载时处理周期账单
    return processRecurringBills();
  });

  useEffect(() => {
    setData(processRecurringBills());
  }, []);

  // === 账单操作 ===
  const add = useCallback((
    amount: number,
    categoryKey: string,
    note: string,
    date: string,
    type: 'expense' | 'income' = 'expense',
  ) => {
    const bill: Bill = { id: generateId(), amount, type, categoryKey, note: note.trim(), date };
    setData(addBill(bill));
  }, []);

  const remove = useCallback((id: string) => {
    setData(deleteBill(id));
  }, []);

  const updateBudget = useCallback((amount: number) => {
    setData(setBudget(amount));
  }, []);

  const exportAll = useCallback(() => exportData(), []);
  const importAll = useCallback((json: string) => {
    setData(importData(json));
  }, []);
  const clearAll = useCallback(() => {
    setData(clearAllData());
  }, []);
  const refresh = useCallback(() => {
    setData(loadData());
  }, []);

  // === 周期账单操作 ===
  const addRecurring = useCallback((rb: RecurringBill) => {
    setData(addRecurringBill(rb));
  }, []);

  const updateRecurring = useCallback((id: string, updates: Partial<RecurringBill>) => {
    setData(updateRecurringBill(id, updates));
  }, []);

  const deleteRecurring = useCallback((id: string) => {
    setData(deleteRecurringBill(id));
  }, []);

  return {
    bills: data.bills,
    budget: data.budget,
    recurringBills: data.recurringBills,
    add,
    remove,
    updateBudget,
    exportAll,
    importAll,
    clearAll,
    refresh,
    addRecurring,
    updateRecurring,
    deleteRecurring,
  };
}

import { useState, useCallback, useEffect } from 'react';
import type { AppData, Bill } from '../types';
import { loadData, addBill, deleteBill, setBudget, exportData, importData, clearAllData, generateId } from '../data/storage';

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    setData(loadData());
  }, []);

  const add = useCallback((
    amount: number,
    categoryKey: string,
    note: string,
    date: string,
    type: 'expense' | 'income' = 'expense',
  ) => {
    const bill: Bill = {
      id: generateId(),
      amount,
      type,
      categoryKey,
      note: note.trim(),
      date,
    };
    const newData = addBill(bill);
    setData(newData);
  }, []);

  const remove = useCallback((id: string) => {
    const newData = deleteBill(id);
    setData(newData);
  }, []);

  const updateBudget = useCallback((amount: number) => {
    const newData = setBudget(amount);
    setData(newData);
  }, []);

  const exportAll = useCallback(() => {
    return exportData();
  }, []);

  const importAll = useCallback((json: string) => {
    const newData = importData(json);
    setData(newData);
  }, []);

  const clearAll = useCallback(() => {
    const newData = clearAllData();
    setData(newData);
  }, []);

  const refresh = useCallback(() => {
    setData(loadData());
  }, []);

  return {
    bills: data.bills,
    budget: data.budget,
    add,
    remove,
    updateBudget,
    exportAll,
    importAll,
    clearAll,
    refresh,
  };
}

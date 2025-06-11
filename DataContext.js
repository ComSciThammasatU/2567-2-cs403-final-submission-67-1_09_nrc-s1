import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DataContext = createContext();

export function DataProvider({ children }) {
  const [monthlyRecords, setMonthlyRecords] = useState({});
  const [wantsBudgets, setWantsBudgets] = useState([]);
  const [budgetPercents, setBudgetPercentsState] = useState({ needs:50, wants:30, dream:20 });
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  //AsyncStorage
  useEffect(() => {
    async function loadData() {
      const records = await loadMonthlyRecords();
      const budgets = await loadWantsBudgets();
      const perc   = await loadBudgetPercents();
      setMonthlyRecords(records);
      setWantsBudgets(budgets);
      perc && setBudgetPercents(perc);
    }
    loadData();
  }, []);

  useEffect(() => {
    const rec = monthlyRecords[selectedMonth];
  if (!rec || rec.wantsExpenses === undefined) {
    const newRec = {
      incomes: rec?.incomes || [],
      needsExpenses: rec?.needsExpenses || [],
      savingsExpenses: rec?.savingsExpenses || [],
      wantsExpenses: rec?.wantsExpenses || [],
    };
    const newRecords = { ...monthlyRecords, [selectedMonth]: newRec };
    setMonthlyRecords(newRecords);
    saveMonthlyRecords(newRecords);
  }
  }, [selectedMonth, monthlyRecords]);

  const updateMonthlyRecords = async (newRecords) => {
    setMonthlyRecords(newRecords);
    await saveMonthlyRecords(newRecords);
  };

  const updateWantsBudgets = async (newBudgets) => {
    setWantsBudgets(newBudgets);
    await saveWantsBudgets(newBudgets);
  };

  const setBudgetPercents = async ({ needs, wants, dream }) => {
    const total = needs + wants + dream;
    if (total !== 100) {
      console.warn('Percents must add up to 100');
      return;
    }
    const newPerc = { needs, wants, dream };
    setBudgetPercentsState(newPerc);
    await saveBudgetPercents(newPerc);
  };

  return (
    <DataContext.Provider
      value={{
        monthlyRecords,
        wantsBudgets,
       budgetPercents,
        setBudgetPercents,
        selectedMonth,
        setSelectedMonth,
        updateMonthlyRecords,
        updateWantsBudgets,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

async function loadMonthlyRecords() {
  try {
    const json = await AsyncStorage.getItem('monthlyRecords');
    return json ? JSON.parse(json) : {};
  } catch (e) {
    console.error('Failed to load monthly records', e);
    return {};
  }
}

async function saveMonthlyRecords(records) {
  try {
    await AsyncStorage.setItem('monthlyRecords', JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save monthly records', e);
  }
}

async function loadWantsBudgets() {
  try {
    const json = await AsyncStorage.getItem('wantsBudgets');
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Failed to load wants budgets', e);
    return [];
  }
}

async function saveWantsBudgets(budgets) {
  try {
    await AsyncStorage.setItem('wantsBudgets', JSON.stringify(budgets));
  } catch (e) {
    console.error('Failed to save wants budgets', e);
  }
}

async function loadBudgetPercents() {
  try {
    const json = await AsyncStorage.getItem('budgetPercents');
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.error('Failed to load budget percents', e);
    return null;
  }
}

async function saveBudgetPercents(obj) {
  try {
    await AsyncStorage.setItem('budgetPercents', JSON.stringify(obj));
  } catch (e) {
    console.error('Failed to save budget percents', e);
  }
}
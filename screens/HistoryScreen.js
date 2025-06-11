import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { DataContext } from '../DataContext';

export default function HistoryScreen({ navigation }) {
  const { monthlyRecords } = useContext(DataContext);
  
  const months = Object.keys(monthlyRecords)
    .sort((a, b) => (a < b ? 1 : -1));

  const renderItem = ({ item: month }) => {
    const data = monthlyRecords[month] || { incomes: [], needsExpenses: [], savingsExpenses: [] };
    const income = data.incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const expenseNeeds = data.needsExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expenseDream = data.savingsExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expenseTotal = expenseNeeds + expenseDream;
    const balance = income - expenseTotal;

    return (
      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Summary', { selectedMonth: month })}>
        <Text style={styles.month}>{month}</Text>
        <Text style={styles.value}>Income: {income.toFixed(0)}฿</Text>
        <Text style={styles.value}>Expense: {expenseTotal.toFixed(0)}฿</Text>
        <Text style={[styles.value, balance < 0 && styles.negative]}>Balance: {balance.toFixed(0)}฿</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={months}
        keyExtractor={(item) => item}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  row: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  month: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  value: { fontSize: 14, color: '#333' },
  negative: { color: '#C62828' },
});



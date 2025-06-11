import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { DataContext } from '../DataContext';

export default function IncomeScreen() {
  const { monthlyRecords, selectedMonth, updateMonthlyRecords } = useContext(DataContext);
  const currentData = monthlyRecords[selectedMonth] || { incomes: [], needsExpenses: [], savingsExpenses: [] };
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');

  const totalIncome = currentData.incomes.reduce((sum, inc) => sum + inc.amount, 0);

  const addIncome = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) {
      alert('Please enter a valid income amount (>= 0).');
      return;
    }
    const newIncome = {
      id: Date.now(),
      note: note.trim(),
      amount: val,
      timestamp: new Date().toLocaleString(),
    };
    const newIncomes = [...currentData.incomes, newIncome];
    const newRecords = {
      ...monthlyRecords,
      [selectedMonth]: { ...currentData, incomes: newIncomes },
    };
    updateMonthlyRecords(newRecords);
    setNote('');
    setAmount('');
  };

  const deleteIncome = (id) => {
    const newIncomes = currentData.incomes.filter((inc) => inc.id !== id);
    const newRecords = {
      ...monthlyRecords,
      [selectedMonth]: { ...currentData, incomes: newIncomes },
    };
    updateMonthlyRecords(newRecords);
  };

  const renderIncomeItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemText}>
          {item.note || '(No note)'} 
        </Text>
        <Text style={styles.itemAmount}>
          +{item.amount.toFixed(2)} ฿
        </Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteIncome(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Income for {selectedMonth}</Text>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryLabel}>Total Income:</Text>
          <Text style={styles.summaryValue}>{totalIncome.toFixed(2)} ฿</Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Add New Income</Text>
        <TextInput
          style={styles.input}
          placeholder="Income Note (Optional)"
          value={note}
          onChangeText={setNote}
        />
        <TextInput
          style={styles.input}
          placeholder="Income Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={addIncome}>
          <Text style={styles.addButtonText}>Add Income</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>Income History</Text>
      </View>
      
      {currentData.incomes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No income recorded yet. Add your first income above.
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentData.incomes}
          renderItem={renderIncomeItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#DCF8C6',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#424242',
    marginRight: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 8,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
  },
  listContent: {
    padding: 8,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#757575',
    fontSize: 16,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    elevation: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  itemAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
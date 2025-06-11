import React, { useState, useContext } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { DataContext } from '../DataContext';

export default function SavingsScreen() {
  const { monthlyRecords, selectedMonth, updateMonthlyRecords, budgetPercents } = useContext(DataContext);
  const currentData = monthlyRecords[selectedMonth] || { incomes: [], needsExpenses: [], savingsExpenses: [] };
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');

  const totalIncome = currentData.incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const recommendedDream = totalIncome * (budgetPercents.dream / 100);
  const usedDream = currentData.savingsExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const leftDream = recommendedDream - usedDream;
  
  const percentUsed = totalIncome > 0 ? Math.min(100, (usedDream / recommendedDream) * 100) : 0;

  const addExpense = () => {
    if (!note.trim()) {
      alert('Please enter a valid usage note.');
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) {
      alert('Please enter a valid (>= 0) usage amount.');
      return;
    }
    const newExpense = {
      id: Date.now(),
      note: note.trim(),
      amount: val,
      timestamp: new Date().toLocaleString(),
    };
    const newExpenses = [...currentData.savingsExpenses, newExpense];
    const newRecords = {
      ...monthlyRecords,
      [selectedMonth]: { ...currentData, savingsExpenses: newExpenses },
    };
    updateMonthlyRecords(newRecords);
    setNote('');
    setAmount('');
  };

  const deleteExpense = (id) => {
    const newExpenses = currentData.savingsExpenses.filter((exp) => exp.id !== id);
    const newRecords = {
      ...monthlyRecords,
      [selectedMonth]: { ...currentData, savingsExpenses: newExpenses },
    };
    updateMonthlyRecords(newRecords);
  };

  const renderExpenseItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemText}>{item.note}</Text>
        <Text style={styles.itemAmount}>-{item.amount.toFixed(2)} ฿</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteExpense(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

   return (
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 40 }}  
      >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Savings for {selectedMonth}</Text>
        <Text style={styles.headerSubtitle}>
          {`Funds for your future (${budgetPercents.dream}% of income)`}
        </Text>
      </View>
      
      <View style={styles.budgetCard}>
        <View style={styles.budgetRow}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Text style={styles.budgetValue}>{recommendedDream.toFixed(2)} ฿</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Used</Text>
            <Text style={styles.budgetValue}>{usedDream.toFixed(2)} ฿</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={[
              styles.budgetValue, 
              {color: leftDream >= 0 ? '#FFC107' : '#C62828'}
            ]}>
              {leftDream.toFixed(2)} ฿
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${percentUsed}%`,
                  backgroundColor: percentUsed > 90 ? '#F44336' : 
                                  percentUsed > 75 ? '#FF9800' : '#FFC107'
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{percentUsed.toFixed(1)}% used ({budgetPercents.dream}% goal)</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>What is "Savings"?</Text>
        <Text style={styles.infoText}>
          The remaining 20% of your budget should go toward the future.
          You may put money in an emergency fund, contribute to a retirement account, or save toward a down payment on a home.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Add New Savings Usage</Text>
        <TextInput
          style={styles.input}
          placeholder="Usage Note"
          value={note}
          onChangeText={setNote}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount Used"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={addExpense}>
          <Text style={styles.addButtonText}>Add Usage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>Usage History</Text>
      </View>
      
      {currentData.savingsExpenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No dream fund usage recorded yet. Add your first usage above.
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentData.savingsExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false} 
          contentContainerStyle={styles.listContent}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#FFF9C4',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#424242',
  },
  budgetCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetItem: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ECEFF1',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#616161',
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: '#FFF8E1',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#F57F17',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
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
    backgroundColor: '#FFC107',
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
    color: '#FFC107',
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
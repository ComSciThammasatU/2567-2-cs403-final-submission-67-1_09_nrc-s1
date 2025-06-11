import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataContext } from '../DataContext';

export default function NeedsScreen() {
  const { monthlyRecords, selectedMonth, updateMonthlyRecords, budgetPercents } = useContext(DataContext);
  const currentData = monthlyRecords[selectedMonth] || { incomes: [], needsExpenses: [], savingsExpenses: [], wantsExpenses: [] };
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');

  const totalIncome = currentData.incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const recommendedNeeds = totalIncome * (budgetPercents.needs / 100);
  const usedNeeds = currentData.needsExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const leftNeeds = recommendedNeeds - usedNeeds;
  const percentUsed = totalIncome > 0 ? Math.min(100, (usedNeeds / recommendedNeeds) * 100) : 0;

  
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowAlert: true }),
    });
  }, []);

  useEffect(() => {
    const checkThreshold = async () => {
      const key = `${selectedMonth}-need50-notified`;
      if (usedNeeds > recommendedNeeds * 0.5) {
        const sent = await AsyncStorage.getItem(key);
        if (!sent) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Budget Alert',
              body: `You have spent over 50% of your Needs budget.`,
            },
            trigger: null,
          });
          await AsyncStorage.setItem(key, 'true');
        }
      } else {
        
        await AsyncStorage.removeItem(key);
      }
    };
    checkThreshold();
  }, [usedNeeds, recommendedNeeds, selectedMonth]);

  const addExpense = () => {
    if (!note.trim()) {
      alert('Please enter a valid expense note.');
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) {
      alert('Please enter a valid (>= 0) expense amount.');
      return;
    }
    const newExpense = {
      id: Date.now(),
      note: note.trim(),
      amount: val,
      timestamp: new Date().toLocaleString(),
    };
    const newExpenses = [...currentData.needsExpenses, newExpense];
    const newRecords = {
      ...monthlyRecords,
      [selectedMonth]: { ...currentData, needsExpenses: newExpenses },
    };
    updateMonthlyRecords(newRecords);
    setNote('');
    setAmount('');
  };

  const deleteExpense = (id) => {
    const newExpenses = currentData.needsExpenses.filter((exp) => exp.id !== id);
    const newRecords = {
      ...monthlyRecords,
      [selectedMonth]: { ...currentData, needsExpenses: newExpenses },
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Needs for {selectedMonth}</Text>
        <Text style={styles.headerSubtitle}>
          {`Essential expenses (${budgetPercents.needs}% of income)`}
        </Text>
      </View>
      <View style={styles.budgetCard}>
        <View style={styles.budgetRow}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Text style={styles.budgetValue}>{recommendedNeeds.toFixed(2)} ฿</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Spent</Text>
            <Text style={styles.budgetValue}>{usedNeeds.toFixed(2)} ฿</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={[
              styles.budgetValue,
              { color: leftNeeds >= 0 ? '#2E7D32' : '#C62828' }
            ]}>
              {leftNeeds.toFixed(2)} ฿
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
                                  percentUsed > 75 ? '#FF9800' : '#4CAF50'
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{percentUsed.toFixed(1)}% used</Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Add New Need Expense</Text>
        <TextInput
          style={styles.input}
          placeholder="Expense Note"
          value={note}
          onChangeText={setNote}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={addExpense}>
          <Text style={styles.addButtonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>Expense History</Text>
      </View>
      {currentData.needsExpenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No expenses recorded yet. Add your first expense above.
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentData.needsExpenses}
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
    backgroundColor: '#FFCDD2',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C62828',
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
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
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
    backgroundColor: '#F44336',
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
    color: '#F44336',
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
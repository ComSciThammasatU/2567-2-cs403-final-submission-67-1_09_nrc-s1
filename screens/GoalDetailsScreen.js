import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';
import { DataContext } from '../DataContext';

export default function GoalDetailsScreen({ route }) {
  const { goalId } = route.params;
  const { wantsBudgets, updateWantsBudgets, monthlyRecords, updateMonthlyRecords, selectedMonth, } = useContext(DataContext);
  const goal = wantsBudgets.find((g) => g.id === goalId);
  if (!goal) return <Text>Goal not found</Text>;
 
 const [showMonthlyForm, setShowMonthlyForm] = useState(false);
 const [monthlyNote, setMonthlyNote] = useState('');
 const [monthlyAmount, setMonthlyAmount] = useState('');


  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const [incomeNote, setIncomeNote] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');

  const [expenseNote, setExpenseNote] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const updateGoal = (updatedGoal) => {
    const updatedBudgets = wantsBudgets.map((g) => (g.id === goalId ? updatedGoal : g));
    updateWantsBudgets(updatedBudgets);
  };

  const handleAddIncome = () => {
    if (!incomeNote.trim()) {
      alert('Please enter an income note.');
      return;
    }
    const amt = parseFloat(incomeAmount);
    if (isNaN(amt) || amt < 0) {
      alert('Please enter a valid (>= 0) income amount.');
      return;
    }
    const newBaseSavings = goal.baseSavings + amt;
    const newRecord = {
      id: Date.now(),
      type: 'income',
      note: incomeNote.trim(),
      amount: amt,
      timestamp: new Date().toLocaleString(),
    };
    const updatedGoal = {
      ...goal,
      baseSavings: newBaseSavings,
      expenses: [...(goal.expenses || []), newRecord],
    };
    updateGoal(updatedGoal);

    setIncomeNote('');
    setIncomeAmount('');
    setShowIncomeForm(false);
  };

  const handleAddExpense = () => {
    if (!expenseNote.trim()) {
      alert('Please enter an expense note.');
      return;
    }
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt < 0) {
      alert('Please enter a valid (>= 0) expense amount.');
      return;
    }
    const newTarget = goal.targetAmount + amt;
    const newRecord = {
      id: Date.now(),
      type: 'expense',
      note: expenseNote.trim(),
      amount: amt,
      timestamp: new Date().toLocaleString(),
    };
    const updatedGoal = {
      ...goal,
      targetAmount: newTarget,
      expenses: [...(goal.expenses || []), newRecord],
    };
    updateGoal(updatedGoal);

    setExpenseNote('');
    setExpenseAmount('');
    setShowExpenseForm(false);
  };

  const deleteExpense = (id) => {
    const recordToDelete = (goal.expenses || []).find((exp) => exp.id === id);
    if (!recordToDelete) return;

    let newBaseSavings = goal.baseSavings;
    let newTargetAmount = goal.targetAmount;

    if (recordToDelete.type === 'income' || recordToDelete.type === 'monthly') {
   newBaseSavings -= recordToDelete.amount;
 } else if (recordToDelete.type === 'expense') {
   newTargetAmount -= recordToDelete.amount;
 }

 if (recordToDelete.type === 'monthly') {
   const monthData = monthlyRecords[selectedMonth] || {};
   const newWants = (monthData.wantsExpenses || []).filter(e => e.id !== id);
   updateMonthlyRecords({
     ...monthlyRecords,
     [selectedMonth]: { ...monthData, wantsExpenses: newWants }
   });
 }

    const updatedExpenses = (goal.expenses || []).filter((exp) => exp.id !== id);
    const updatedGoal = {
      ...goal,
      baseSavings: newBaseSavings,
      targetAmount: newTargetAmount,
      expenses: updatedExpenses,
    };
    updateGoal(updatedGoal);
  };

  const renderExpenseItem = ({ item }) => {
    const isIncome = item.type === 'income';
    return (
      <View style={[styles.item, { backgroundColor: isIncome ? '#E8F5E9' : '#FFF3E0' }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTypeLabel}>
            {isIncome ? '⬆️ INCOME' : '⬆️ TARGET ADJUSTMENT'}
          </Text>
          <Text style={styles.itemText}>
            {item.note} {isIncome ? '(+)' : '(+ target)'} {item.amount} {goal.currency}
          </Text>
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
  };

  const currentSavings = goal.baseSavings;
  const actualTarget = goal.targetAmount;
  
  const progressPercentage = Math.min(100, (currentSavings / actualTarget) * 100).toFixed(1);

const handleAddMonthlyIncome = () => {
   const amt = parseFloat(monthlyAmount);
   if (isNaN(amt) || amt < 0 || !monthlyNote.trim()) {
     return alert('กรุณากรอก Note และจำนวนเงินให้ถูกต้อง');
   }
   const entryId = Date.now();
   const ts = new Date().toLocaleString();
  
   const newBase = goal.baseSavings + amt;
   const newRecord = {
     id: entryId,
     type: 'monthly',       
     note: monthlyNote.trim(),
     amount: amt,
     timestamp: ts,
   };
   const updatedGoal = {
     ...goal,
     baseSavings: newBase,
     expenses: [...(goal.expenses || []), newRecord],
   };
   updateWantsBudgets(wantsBudgets.map(g => g.id===goalId ? updatedGoal : g));

   const monthData = monthlyRecords[selectedMonth] || {};
   const newWants = [...(monthData.wantsExpenses || []), {
     id: entryId,         
     note: monthlyNote.trim(),
     amount: amt,
     timestamp: ts,
   }];
   const newMonthly = {
     ...monthlyRecords,
     [selectedMonth]: {
       ...monthData,
       wantsExpenses: newWants,
     }
   };
   updateMonthlyRecords(newMonthly);

   setMonthlyNote('');
   setMonthlyAmount('');
   setShowMonthlyForm(false);
 };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{goal.budgetName}</Text>
        {goal.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{goal.category}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Target</Text>
            <Text style={styles.summaryValue}>{actualTarget} {goal.currency}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Current Savings</Text>
            <Text style={styles.summaryValue}>{currentSavings} {goal.currency}</Text>
          </View>
        </View>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>End Date</Text>
            <Text style={styles.summaryValue}>{goal.endDate}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Progress</Text>
            <Text style={styles.summaryValue}>{progressPercentage}%</Text>
          </View>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Button Row for Add Income / Add Expense */}
      <View style={styles.btnRow}>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#009688' }]}
         onPress={() => setShowMonthlyForm(!showMonthlyForm)}>
         <Text style={styles.buttonText}>Add Monthly Income</Text>
       </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => {
            setShowIncomeForm(!showIncomeForm);
            setShowExpenseForm(false);
          }}
        >
          <Text style={styles.buttonText}>Add Income</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
          onPress={() => {
            setShowExpenseForm(!showExpenseForm);
            setShowIncomeForm(false);
          }}
        >
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {showMonthlyForm && (
       <View style={styles.formContainer}>
         <Text style={styles.formTitle}>Add Monthly Income</Text>
         <TextInput style={styles.input} placeholder="Note" value={monthlyNote} onChangeText={setMonthlyNote} />
         <TextInput style={styles.input} placeholder="Amount" value={monthlyAmount} onChangeText={setMonthlyAmount} keyboardType="numeric" />
         <TouchableOpacity style={[styles.button, { backgroundColor: '#009688' }]} onPress={handleAddMonthlyIncome}>
           <Text style={styles.buttonText}>Confirm</Text>
         </TouchableOpacity>
       </View>
     )}

      {/* Income Form */}
      {showIncomeForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add Income</Text>
          <TextInput
            style={styles.input}
            placeholder="Income Note"
            value={incomeNote}
            onChangeText={setIncomeNote}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={incomeAmount}
            onChangeText={setIncomeAmount}
            keyboardType="numeric"
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50' }]} onPress={handleAddIncome}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Expense Form */}
      {showExpenseForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add Expense</Text>
          <TextInput
            style={styles.input}
            placeholder="Expense Note"
            value={expenseNote}
            onChangeText={setExpenseNote}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={expenseAmount}
            onChangeText={setExpenseAmount}
            keyboardType="numeric"
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: '#FF9800' }]} onPress={handleAddExpense}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Transactions History</Text>
      {(goal.expenses || []).length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No transactions yet. Add some using the buttons above.</Text>
        </View>
      ) : (
        <FlatList
          data={goal.expenses || []}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: '#1976D2',
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ECEFF1',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
  },
  formTitle: {
    fontSize: 16,
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
  button: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  emptyStateContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
  },
  emptyStateText: {
    color: '#666',
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 8,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    elevation: 1,
  },
  itemTypeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#777',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal, Platform, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { DataContext } from '../DataContext';

export default function WantsScreen({ navigation }) {
  const { wantsBudgets, updateWantsBudgets } = useContext(DataContext);

  const [goalName, setGoalName] = useState('');
  const [category, setCategory] = useState('');
  const [currency, setCurrency] = useState('THB (฿)');
  const [targetAmount, setTargetAmount] = useState('');
  const [alreadySaved, setAlreadySaved] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysLeft = (dateString) => {
    if (!dateString) return '-';
    const today = new Date();
    const target = new Date(dateString);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getProgressPercent = (goal) => {
    const saved = parseFloat(goal.baseSavings) || 0;
    const target = parseFloat(goal.targetAmount) || 1;
    const percent = (saved / target) * 100;
    return Math.min(100, percent).toFixed(2);
  };

  const resetForm = () => {
    setGoalName('');
    setCategory('');
    setCurrency('THB (฿)');
    setTargetAmount('');
    setAlreadySaved('');
    setTargetDate('');
    setEditingId(null);
  };

  const handleAddGoal = () => {
    if (!goalName || !targetAmount || parseFloat(targetAmount) < 0 || parseFloat(alreadySaved) < 0) {
      alert('Please enter valid goal name and amounts.');
      return;
    }
    
    if (!targetDate) {
      alert('Please select an end date.');
      return;
    }
    
    const target = new Date(targetDate);
    const now = new Date();
    if (target < now) {
      alert('End date must be today or later.');
      return;
    }
    
    const newGoal = {
      id: editingId || Date.now(),
      budgetName: goalName,
      category,
      currency,
      targetAmount: parseFloat(targetAmount),
      baseSavings: parseFloat(alreadySaved) || 0,
      endDate: targetDate,
      expenses: editingId ? (wantsBudgets.find((g) => g.id === editingId)?.expenses || []) : [],
    };
    
    if (editingId) {
      const updatedGoals = wantsBudgets.map((g) => (g.id === editingId ? newGoal : g));
      updateWantsBudgets(updatedGoals);
    } else {
      updateWantsBudgets([...wantsBudgets, newGoal]);
    }
    
    resetForm();
  };

  const handleEdit = (goal) => {
    setGoalName(goal.budgetName);
    setCategory(goal.category);
    setCurrency(goal.currency);
    setTargetAmount(goal.targetAmount.toString());
    setAlreadySaved(goal.baseSavings.toString());
    setTargetDate(goal.endDate);
    if (goal.endDate) {
      const date = new Date(goal.endDate);
      setSelectedDate(date);
      setCurrentMonth(date);
    }
    setEditingId(goal.id);
  };

  const handleDelete = (id) => {
    const updatedGoals = wantsBudgets.filter((g) => g.id !== id);
    updateWantsBudgets(updatedGoals);
    if (editingId === id) resetForm();
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const getPreviousMonthDays = (year, month) => {
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    const result = [];
    
    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({
        day: daysInPrevMonth - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false
      });
    }
    
    return result;
  };

  const getCurrentMonthDays = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const result = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      result.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true
      });
    }
    
    return result;
  };

  const getNextMonthDays = (year, month, currentMonthDays, prevMonthDays) => {
    const totalDays = currentMonthDays.length + prevMonthDays.length;
    const remainingDays = 42 - totalDays; 
    const result = [];
    
    for (let i = 1; i <= remainingDays; i++) {
      result.push({
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false
      });
    }
    
    return result;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const prevMonthDays = getPreviousMonthDays(year, month);
    const currentMonthDays = getCurrentMonthDays(year, month);
    const nextMonthDays = getNextMonthDays(year, month, currentMonthDays, prevMonthDays);
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isBeforeToday = (year, month, day) => {
    const today = new Date();
    const date = new Date(year, month, day);
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleSelectDay = (day) => {
    const newDate = new Date(day.year, day.month, day.day);
    setSelectedDate(newDate);
  };

  const showDatePickerModal = () => {
    
    if (!targetDate) {
      const today = new Date();
      setSelectedDate(today);
      setCurrentMonth(today);
    } else {
      
      const date = new Date(targetDate);
      setSelectedDate(date);
      setCurrentMonth(date);
    }
    setShowDatePicker(true);
  };

  const handleDateChange = () => {
    const formattedDate = selectedDate.toISOString().split('T')[0]; 
    setTargetDate(formattedDate);
    setShowDatePicker(false);
  };
  
  const handleDatePickerCancel = () => {
    setShowDatePicker(false);
  };

  const renderGoalItem = ({ item }) => {
    const daysLeft = getDaysLeft(item.endDate);
    const progress = getProgressPercent(item);

    return (
      <View style={styles.goalItem}>
        <Text style={styles.goalTitle}>{item.budgetName}</Text>
        <View style={styles.goalInfoRow}>
          <View style={styles.goalInfoBadge}>
            <Text style={styles.goalInfoBadgeText}>{item.category || 'No Category'}</Text>
          </View>
          <Text style={styles.daysLeftText}>{daysLeft} days left</Text>
        </View>
        
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Target:</Text>
          <Text style={styles.amountValue}>{item.targetAmount} {item.currency}</Text>
        </View>
        
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Saved:</Text>
          <Text style={styles.amountValue}>
          {item.baseSavings} {item.currency}
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}% completed</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF9800' }]}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#F44336' }]}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#2196F3' }]}
            onPress={() => navigation.navigate('GoalDetails', { goalId: item.id })}
          >
            <Text style={styles.buttonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.headerTitle}>Wants (Annual/Long-Term Goals)</Text>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {editingId ? 'Edit Wants Goal' : 'Add New Wants Goal'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Goal Name"
            value={goalName}
            onChangeText={setGoalName}
          />
          <TextInput
            style={styles.input}
            placeholder="Category (optional)"
            value={category}
            onChangeText={setCategory}
          />
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Currency:</Text>
            <Picker
              selectedValue={currency}
              onValueChange={(itemValue) => setCurrency(itemValue)}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="THB (฿)" value="THB (฿)" />
              <Picker.Item label="USD ($)" value="USD ($)" />
              <Picker.Item label="EUR (€)" value="EUR (€)" />
              <Picker.Item label="GBP (£)" value="GBP (£)" />
              <Picker.Item label="JPY (¥)" value="JPY (¥)" />
            </Picker>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Target Amount"
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Already Saved"
            value={alreadySaved}
            onChangeText={setAlreadySaved}
            keyboardType="numeric"
          />
          
          {/* Date picker button */}
          <TouchableOpacity 
            style={styles.datePickerButton} 
            onPress={showDatePickerModal}
          >
            <Text style={styles.datePickerButtonText}>
              {targetDate ? `Target End Date: ${targetDate}` : 'Select Target End Date'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: '#4CAF50' }]} 
            onPress={handleAddGoal}
          >
            <Text style={styles.submitButtonText}>
              {editingId ? 'Save Changes' : 'Add Budget'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.headerTitle, { marginTop: 20 }]}>Wants Budgets List</Text>
        {wantsBudgets.length === 0 ? (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No goals yet. Add your first goal above!</Text>
          </View>
        ) : (
          <FlatList
            data={wantsBudgets}
            renderItem={renderGoalItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* Full Calendar Date Picker Modal */}
      {showDatePicker && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showDatePicker}
          onRequestClose={handleDatePickerCancel}
        >
          <View style={styles.modalContainer}>
            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerTitle}>Select End Date</Text>
              
              {/* Month/Year Navigation */}
              <View style={styles.monthYearSelector}>
                <TouchableOpacity
                  onPress={() => {
                    const newDate = new Date(currentMonth);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setCurrentMonth(newDate);
                  }}
                >
                  <Text style={styles.navButton}>◀</Text>
                </TouchableOpacity>
                
                <Text style={styles.monthYearText}>
                  {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
                </Text>
                
                <TouchableOpacity
                  onPress={() => {
                    const newDate = new Date(currentMonth);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setCurrentMonth(newDate);
                  }}
                >
                  <Text style={styles.navButton}>▶</Text>
                </TouchableOpacity>
              </View>
              
              {/* Day Names */}
              <View style={styles.weekdayLabels}>
                <Text style={styles.weekdayLabel}>Sun</Text>
                <Text style={styles.weekdayLabel}>Mon</Text>
                <Text style={styles.weekdayLabel}>Tue</Text>
                <Text style={styles.weekdayLabel}>Wed</Text>
                <Text style={styles.weekdayLabel}>Thu</Text>
                <Text style={styles.weekdayLabel}>Fri</Text>
                <Text style={styles.weekdayLabel}>Sat</Text>
              </View>
              
              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {generateCalendarDays().map((day, index) => {
                  const isSelected = selectedDate && 
                    isSameDay(selectedDate, new Date(day.year, day.month, day.day));
                  const isPast = isBeforeToday(day.year, day.month, day.day);
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.calendarDay,
                        !day.isCurrentMonth && styles.otherMonthDay,
                        isSelected && styles.selectedDay,
                        isPast && styles.pastDay
                      ]}
                      onPress={() => !isPast && handleSelectDay(day)}
                      disabled={isPast}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        !day.isCurrentMonth && styles.otherMonthDayText,
                        isSelected && styles.selectedDayText,
                        isPast && styles.pastDayText
                      ]}>
                        {day.day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              {/* Selected date display */}
              <View style={styles.selectedDateContainer}>
                <Text style={styles.selectedDateText}>
                  Selected: {selectedDate.toDateString()}
                </Text>
              </View>
              
              {/* Action Buttons */}
              <View style={styles.datePickerActions}>
                <TouchableOpacity
                  style={[styles.datePickerActionButton, { backgroundColor: '#f5f5f5' }]}
                  onPress={handleDatePickerCancel}
                >
                  <Text style={[styles.datePickerButtonText, { color: '#333' }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.datePickerActionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={handleDateChange}
                >
                  <Text style={[styles.datePickerButtonText, { color: '#fff' }]}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  picker: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  datePickerButton: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  datePickerButtonText: {
    color: '#333',
  },
  submitButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
    elevation: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyListContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  emptyListText: {
    color: '#666',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  goalItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
    padding: 16,
    elevation: 2,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  goalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalInfoBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  goalInfoBadgeText: {
    color: '#1976D2',
    fontSize: 12,
  },
  daysLeftText: {
    color: '#FF5722',
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ECEFF1',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  monthYearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  navButton: {
    fontSize: 20,
    padding: 5,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  weekdayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    margin: 1,
  },
  selectedDay: {
    backgroundColor: '#2196F3',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  pastDay: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  otherMonthDayText: {
    color: '#999',
  },
  pastDayText: {
    color: '#999',
  },
  selectedDateContainer: {
    alignItems: 'center',
    marginVertical: 12,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  datePickerActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
});
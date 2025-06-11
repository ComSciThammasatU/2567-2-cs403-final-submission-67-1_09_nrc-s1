import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { DataContext } from '../DataContext';

export default function SummaryScreen({ navigation }) {
  const { monthlyRecords, selectedMonth, setSelectedMonth, budgetPercents } = useContext(DataContext);
  const currentData = monthlyRecords[selectedMonth] || {
    incomes: [],
  needsExpenses: [],
  savingsExpenses: [],
  wantsExpenses: [],   
  };

  const totalIncome = currentData.incomes.reduce((sum, inc) => sum + inc.amount, 0);

  const usedNeeds = currentData.needsExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const usedDream = currentData.savingsExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const usedWants = (currentData.wantsExpenses || []).reduce((sum, e) => sum + e.amount, 0);
  
  const totalExpense = usedNeeds + usedDream + usedWants;

  const balance = totalIncome - totalExpense;

  const recommended = {
    needs: totalIncome * (budgetPercents.needs / 100),
    wants: totalIncome * (budgetPercents.wants / 100),
    dream: totalIncome * (budgetPercents.dream / 100),
  };

  const leftoverNeeds = recommended.needs - usedNeeds;
  const leftoverDream = recommended.dream - usedDream;
  
  const leftoverWants = recommended.wants - usedWants;

  const totalLeftover = leftoverNeeds + leftoverWants + leftoverDream;

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    const year = now.getFullYear();
    for (let y = year - 1; y <= year + 1; y++) {
      for (let m = 1; m <= 12; m++) {
        const mm = String(m).padStart(2, '0');
        options.push(`${y}-${mm}`);
      }
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
   <ScrollView
      style={[
        styles.container,
        Platform.OS === 'web' && { height: '100vh' }   
      ]}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MoneyMate</Text>
        <Text style={styles.headerSubtitle}>50/30/20 Budget Tracker</Text>
      </View>

      {/* Month Selector */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Select Month:</Text>
        <Picker
          selectedValue={selectedMonth}
          onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          style={styles.picker}
          mode="dropdown"
        >
          {monthOptions.map((month) => (
            <Picker.Item key={month} label={month} value={month} />
          ))}
        </Picker>
      </View>

      {/* Summary Cards */}
      <View style={styles.dashboardContainer}>
        <View style={[styles.box, { backgroundColor: '#D6F5D6' }]}>
          <Text style={styles.boxTitle}>Income</Text>
          <Text style={styles.boxValue}>{`${totalIncome.toFixed(2)} ฿`}</Text>
        </View>
        <View style={[styles.box, { backgroundColor: '#FFE0E0' }]}>
          <Text style={styles.boxTitle}>Expenses</Text>
          <Text style={styles.boxValue}>{`${totalExpense.toFixed(2)} ฿`}</Text>
        </View>
        <View style={[styles.box, { backgroundColor: balance >= 0 ? '#E0F0FF' : '#FFE0E0' }]}>
          <Text style={styles.boxTitle}>Balance</Text>
          <Text style={[styles.boxValue, { color: balance >= 0 ? '#0066CC' : '#CC0000' }]}>
            {`${balance.toFixed(2)} ฿`}
          </Text>
        </View>
      </View>

      <TouchableOpacity
  style={styles.adjustBtn}
  onPress={() => navigation.navigate('BudgetSettings')}
>
  <Text style={styles.adjustBtnText}>Adjust %</Text>
</TouchableOpacity>


      {/* Budget Breakdown */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Budget Allocation</Text>
        <Text style={styles.sectionSubtitle}>Based on 50/30/20 Rule</Text>

        {/* Needs Bar */}
        <View style={styles.budgetCategory}>
          <View style={styles.budgetLabelContainer}>
            <View style={[styles.colorDot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.budgetLabel}>
            {`Needs (${budgetPercents.needs}%)`}
            </Text>
          </View>
          <View style={styles.budgetBarContainer}>
            <View style={styles.budgetBar}>
              <View 
                style={[
                  styles.budgetBarFill, 
                  { 
                    width: `${Math.min(100, (usedNeeds / recommended.needs) * 100)}%`,
                    backgroundColor: '#FF6B6B' 
                  }
                ]} 
              />
            </View>
            <View style={styles.budgetValues}>
              <Text style={styles.budgetUsed}>{usedNeeds.toFixed(0)}฿</Text>
              <Text style={styles.budgetTotal}>of {recommended.needs.toFixed(0)}฿</Text>
            </View>
          </View>
        </View>

        {/* Wants Bar */}
        <View style={styles.budgetCategory}>
          <View style={styles.budgetLabelContainer}>
            <View style={[styles.colorDot, { backgroundColor: '#4ECDC4' }]} />
            <Text style={styles.budgetLabel}>Wants ({budgetPercents.wants}%)</Text>
          </View>
          <View style={styles.budgetBarContainer}>
            <View style={styles.budgetBar}>
              <View 
                style={[
                  styles.budgetBarFill, 
                  { 
                    width: `${Math.min(100,(usedWants/recommended.wants)*100)}%`,
                    backgroundColor: '#4ECDC4' 
                  }
                ]} 
              />
            </View>
            <View style={styles.budgetValues}>
              <Text style={styles.budgetUsed}>{usedWants.toFixed(0)}฿</Text>
              <Text style={styles.budgetTotal}>of {recommended.wants.toFixed(0)}฿</Text>
              <Text style={styles.budgetNote}>(tracked in Wants)</Text>
            </View>
          </View>
        </View>

        {/* Dream Bar */}
        <View style={styles.budgetCategory}>
          <View style={styles.budgetLabelContainer}>
            <View style={[styles.colorDot, { backgroundColor: '#FFD166' }]} />
            <Text style={styles.budgetLabel}>
              {`Savings (${budgetPercents.dream}%)`}
            </Text>
          </View>
          <View style={styles.budgetBarContainer}>
            <View style={styles.budgetBar}>
              <View 
                style={[
                  styles.budgetBarFill, 
                  { 
                    width: `${Math.min(100, (usedDream / recommended.dream) * 100)}%`,
                    backgroundColor: '#FFD166' 
                  }
                ]} 
              />
            </View>
            <View style={styles.budgetValues}>
              <Text style={styles.budgetUsed}>{usedDream.toFixed(0)}฿</Text>
              <Text style={styles.budgetTotal}>of {recommended.dream.toFixed(0)}฿</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Navigation Section */}
      <View style={styles.navSection}>
        <Text style={styles.navSectionTitle}>Manage Your Money</Text>
        
        <View style={styles.navRow}>
          <TouchableOpacity 
            style={styles.navCard} 
            onPress={() => navigation.navigate('Income')}
          >
            <View style={[styles.navIconCircle, { backgroundColor: '#DCF8C6' }]}>
              <Text style={styles.navIcon}>💰</Text>
            </View>
            <Text style={styles.navCardTitle}>Income</Text>
            <Text style={styles.navCardDesc}>Track your earnings - salary, freelance, etc.</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navCard} 
            onPress={() => navigation.navigate('Needs')}
          >
            <View style={[styles.navIconCircle, { backgroundColor: '#FFCDD2' }]}>
              <Text style={styles.navIcon}>🏠</Text>
            </View>
            <Text style={styles.navCardTitle}>Needs</Text>
            <Text style={styles.navCardDesc}>Essential expenses - rent, bills, food, etc.</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity 
            style={styles.navCard} 
            onPress={() => navigation.navigate('Wants')}
          >
            <View style={[styles.navIconCircle, { backgroundColor: '#B3E5FC' }]}>
              <Text style={styles.navIcon}>🎯</Text>
            </View>
            <Text style={styles.navCardTitle}>Wants</Text>
            <Text style={styles.navCardDesc}>Long-term goals and non-essential purchases</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navCard} 
            onPress={() => navigation.navigate('Savings')}
          >
            <View style={[styles.navIconCircle, { backgroundColor: '#FFF9C4' }]}>
              <Text style={styles.navIcon}>✨</Text>
            </View>
            <Text style={styles.navCardTitle}>Savings</Text>
            <Text style={styles.navCardDesc}>Future funds for your dreams and aspirations</Text>
          </TouchableOpacity>
        </View>
      </View>

       <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.historyBtnText}>View History</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
    marginHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  picker: {
    marginVertical: 0,
    height: 50,
  },
  dashboardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  box: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  boxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  boxValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  budgetCategory: {
    marginBottom: 15,
  },
  budgetLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  budgetBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
  },
  budgetValues: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetUsed: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  budgetTotal: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  budgetNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    marginLeft: 8,
  },
  navSection: {
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  navSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    marginLeft: 5,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  navCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  navIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  navIcon: {
    fontSize: 24,
  },
  navCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  navCardDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },

  adjustBtn: {
    alignSelf: 'flex-end',
    margin: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  adjustBtnText: {
    color: '#333',
    fontWeight: '600',
  },

  historyBtn: {
  alignSelf: 'center',
  marginVertical: 12,
  paddingVertical: 8,
  paddingHorizontal: 16,
  backgroundColor: '#4ECDC4',
  borderRadius: 6,
},
historyBtnText: {
  color: '#fff',
  fontWeight: '600',
},

});
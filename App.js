import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DataProvider } from './DataContext';
import SummaryScreen from './screens/SummaryScreen';
import IncomeScreen from './screens/IncomeScreen';
import NeedsScreen from './screens/NeedsScreen';
import WantsScreen from './screens/WantsScreen';
import SavingsScreen from './screens/SavingsScreen';
import GoalDetailsScreen from './screens/GoalDetailsScreen';
import BudgetSettingsScreen from './screens/BudgetSettingsScreen';
import HistoryScreen from './screens/HistoryScreen';


const Stack = createStackNavigator();

export default function App() {
  return (
    <DataProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Summary">
          <Stack.Screen name="Summary" component={SummaryScreen} options={{ title: 'Summary' }} />
          <Stack.Screen name="Income" component={IncomeScreen} options={{ title: 'Income' }} />
          <Stack.Screen name="Needs" component={NeedsScreen} options={{ title: 'Needs' }} />
          <Stack.Screen name="Wants" component={WantsScreen} options={{ title: 'Wants' }} />
          <Stack.Screen name="Savings" component={SavingsScreen} options={{ title: 'Dream' }} />
          <Stack.Screen name="GoalDetails" component={GoalDetailsScreen} options={{ title: 'Goal Details' }} />
          <Stack.Screen name="BudgetSettings" component={BudgetSettingsScreen} options={{ title: 'Adjust %' }} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />


        </Stack.Navigator>
      </NavigationContainer>
    </DataProvider>
  );
}

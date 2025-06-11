
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { DataContext } from '../DataContext';

export default function BudgetSettingsScreen({ navigation }) {

  const { budgetPercents, setBudgetPercents } = useContext(DataContext);

  const [sliderValues, setSliderValues] = useState([
    budgetPercents.needs,
    budgetPercents.needs + budgetPercents.wants,
  ]);


  const handleSave = () => {
    const [needsValue, wantsPlus] = sliderValues;
    const needs = needsValue;
    const wants = wantsPlus - needsValue;
    const dream = 100 - wantsPlus;
    setBudgetPercents({ needs, wants, dream });
    navigation.goBack();
  };


  const handleDefault = () => {
    const defaultValues = [50, 80]; 
    setSliderValues(defaultValues);
    setBudgetPercents({ needs: 50, wants: 30, dream: 20 });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adjust Budget Allocation</Text>

      <Text style={styles.percentLabel}>
        Needs {sliderValues[0]}% • Wants {sliderValues[1] - sliderValues[0]}% • Dream {100 - sliderValues[1]}%
      </Text>

      <MultiSlider
        values={sliderValues}
        onValuesChange={setSliderValues}
        min={0}
        max={100}
        step={1}
        allowOverlap={false}
        snapped
        sliderLength={280}

        markerStyle={{
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4ECDC4',
  }}
  pressedMarkerStyle={{
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
  }}

  
  touchDimensions={{
    height: 50,
    width: 50,
    borderRadius: 25,
    slipDisplacement: 200,
  }}
      />

      <Button title="Save" onPress={handleSave} />

      <View style={{ marginTop: 12 }}>
        <Button title="Default 50/30/20" color="#888" onPress={handleDefault} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  percentLabel: { fontSize: 16, marginBottom: 16, textAlign: 'center' },
});

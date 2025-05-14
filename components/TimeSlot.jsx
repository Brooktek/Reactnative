import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';

const TimeSlot = ({ item, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.timeSlot,
        isSelected && styles.selectedTimeSlot
      ]}
      onPress={onPress}
    >
      <Text style={styles.timeSlotText}>
        {item.startTime} - {item.endTime}
      </Text>
    </TouchableOpacity>
  );
};

const numColumns = 4;

const styles = StyleSheet.create({
  timeSlot: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#b3e0e5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 70,
    aspectRatio: 1.5,
  },
  selectedTimeSlot: {
    backgroundColor: '#4fc3f7',
    borderWidth: 2,
    borderColor: '#0277bd',
  },
  timeSlotText: {
    textAlign: 'center',
    fontSize: 12,
  },
});

export default TimeSlot;
export { numColumns };
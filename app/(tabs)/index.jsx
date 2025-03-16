import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  StatusBar,
  FlatList,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/Header';
import TimeSlot, { numColumns } from '../../components/TimeSlot';
import AddTaskModal from '../../components/AddTaskModal';
import { generateTimeSlots } from '../../utils/timeUtil';

export default function TimeSlotScreen() {
  const [selectedDate, setSelectedDate] = useState(16);
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedTimeSlotTexts, setSelectedTimeSlotTexts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  const timeSlots = generateTimeSlots();

  const toggleTimeSlot = (id, displayText) => {
    setSelectedTimeSlots(prevSelected => {
      if (prevSelected.includes(id)) {
        // Remove from selection
        setSelectedTimeSlotTexts(prevTexts => 
          prevTexts.filter(text => text.id !== id)
        );
        return prevSelected.filter(slotId => slotId !== id);
      } else {
        // Add to selection
        setSelectedTimeSlotTexts(prevTexts => 
          [...prevTexts, { id, text: displayText }]
        );
        return [...prevSelected, id];
      }
    });
  };

  const renderTimeSlot = ({ item }) => {
    const isSelected = selectedTimeSlots.includes(item.id);
    
    return (
      <TimeSlot 
        item={item}
        isSelected={isSelected}
        onPress={() => toggleTimeSlot(item.id, item.displayText)}
      />
    );
  };

  const handleAddPress = () => {
    if (selectedTimeSlots.length > 0) {
      setModalVisible(true);
    } else {
      // Alert user to select a time slot first
      alert("Please select at least one time slot");
    }
  };

  const handleSubmit = (taskText, taskCategory) => {
    // Here you would handle saving the task
    console.log("Task submitted:", {
      timeSlots: selectedTimeSlotTexts.map(slot => slot.text),
      task: taskText,
      category: taskCategory
    });
    
    // Close modal
    setModalVisible(false);
  };

  // Format the data to ensure consistent columns
  const formatData = (data, numColumns) => {
    const numberOfFullRows = Math.floor(data.length / numColumns);
    let numberOfElementsLastRow = data.length - (numberOfFullRows * numColumns);
    
    while (numberOfElementsLastRow !== 0 && numberOfElementsLastRow !== numColumns) {
      data = [...data, { id: `blank-${numberOfElementsLastRow}`, empty: true }];
      numberOfElementsLastRow++;
    }
    
    return data;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
  {/* Header */}
    <View style={styles.headerContainer}>
      <Header 
        selectedDate={selectedDate}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onDateChange={setSelectedDate}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />
    </View>
      
      {/* Time Slots Grid */}
      <FlatList
        data={formatData(timeSlots, numColumns)}
        renderItem={({ item }) => {
          if (item.empty) {
            return <View style={[styles.emptyItem, { flex: 1 }]} />;
          }
          return renderTimeSlot({ item });
        }}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.timeSlotGrid}
        showsVerticalScrollIndicator={true}
        initialNumToRender={12}
        maxToRenderPerBatch={20}
        windowSize={10}
      />
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddPress}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="pencil" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Add Task Modal */}
      <AddTaskModal
        visible={modalVisible}
        selectedTimeSlots={selectedTimeSlotTexts}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  headerContainer: {
    paddingHorizontal: 10,
  },
  timeSlotGrid: {
    padding: 10,
    paddingBottom: 80, 
  },
  emptyItem: {
    backgroundColor: 'transparent',
    margin: 5,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    zIndex: 10,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#009688',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 5,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
  },
});
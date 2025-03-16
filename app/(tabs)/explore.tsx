import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration (replace with your Firebase project config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

type TimeSlotProps = {
  startTime: string;
  endTime: string;
  isSelected: boolean;
  onSelect: (startTime: string, endTime: string) => void;
};

const TimeSlot: React.FC<TimeSlotProps> = ({ startTime, endTime, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[
      styles.timeSlot,
      isSelected && styles.selectedTimeSlot
    ]}
    onPress={() => onSelect(startTime, endTime)}
    accessible={true}
    accessibilityLabel={`Select time slot from ${startTime} to ${endTime}`}
    accessibilityHint="Double tap to select this time slot."
  >
    <Text style={styles.timeSlotText}>
      {startTime} - {endTime}
    </Text>
  </TouchableOpacity>
);

const App = () => {
  const [selectedDay, setSelectedDay] = useState('14');
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [taskCategory, setTaskCategory] = useState('Work');
  const [isLoading, setIsLoading] = useState(false);

  // Generate time slots from 5:30 AM to 5:30 AM next day
  const generateTimeSlots = () => {
    const slots = [];
    let currentHour = 5; // Start at 5:30 AM
    let currentMinute = 30;
    let period = 'AM';

    for (let i = 0; i < 48; i++) {
      // Format the start time
      const formattedHour = currentHour === 0 ? 12 : currentHour; // Handle midnight (12 AM)
      const formattedMinute = currentMinute === 0 ? '00' : currentMinute;
      const startTime = `${formattedHour}:${formattedMinute} ${period}`;

      // Increment time by 30 minutes
      currentMinute += 30;
      if (currentMinute === 60) {
        currentMinute = 0;
        currentHour += 1;
      }

      // Switch period at 12:00 PM and 12:00 AM
      if (currentHour === 12 && currentMinute === 0) {
        period = period === 'AM' ? 'PM' : 'AM';
      }

      // Reset hour to 1 after 12
      if (currentHour > 12) {
        currentHour = 1;
      }

      // Format the end time
      const formattedNextHour = currentHour === 0 ? 12 : currentHour; // Handle midnight (12 AM)
      const formattedNextMinute = currentMinute === 0 ? '00' : currentMinute;
      const endTime = `${formattedNextHour}:${formattedNextMinute} ${period}`;

      // Add the time slot to the list
      slots.push({ id: `${startTime}-${endTime}`, startTime, endTime });
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSlotSelect = (startTime: string, endTime: string) => {
    const timeSlot = `${startTime} - ${endTime}`;
    setSelectedTimeSlots((prev) =>
      prev.includes(timeSlot)
        ? prev.filter((slot) => slot !== timeSlot) // Deselect if already selected
        : [...prev, timeSlot] // Add to selection
    );
  };

  const handleSubmit = async () => {
    if (!taskText.trim()) {
      Alert.alert('Error', 'Please enter a task.');
      return;
    }

    setIsLoading(true);

    try {
      for (const timeSlot of selectedTimeSlots) {
        await addDoc(collection(db, "tasks"), {
          timeSlot,
          task: taskText,
          category: taskCategory,
          date: `${selectedDay} ${selectedMonth} ${selectedYear}`,
          createdAt: Timestamp.now(),
        });
      }

      Alert.alert('Success', 'Tasks saved successfully!');
      setModalVisible(false);
      setTaskText('');
      setSelectedTimeSlots([]);
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert('Error', 'Failed to save tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setTaskText('');
    setSelectedTimeSlots([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e2732" />

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <Icon name="menu" size={24} color="black" />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedDay}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedDay(itemValue)}
            mode="dropdown"
          >
            {[...Array(31)].map((_, i) => (
              <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMonth}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            mode="dropdown"
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July',
              'August', 'September', 'October', 'November', 'December'].map(month => (
              <Picker.Item key={month} label={month} value={month} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedYear}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
            mode="dropdown"
          >
            {[2023, 2024, 2025, 2026, 2027, 2028].map(year => (
              <Picker.Item key={year} label={`${year}`} value={`${year}`} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.analyticsButton}>
          <Text style={styles.analyticsButtonText}>View Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Time Slots Grid */}
      <FlatList
        data={timeSlots}
        renderItem={({ item }) => (
          <TimeSlot
            startTime={item.startTime}
            endTime={item.endTime}
            isSelected={selectedTimeSlots.includes(`${item.startTime} - ${item.endTime}`)}
            onSelect={handleTimeSlotSelect}
          />
        )}
        keyExtractor={item => item.id}
        numColumns={4}
        contentContainerStyle={styles.timeSlotsContainer}
      />

      {/* Task Entry Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selected Time Slots:</Text>
            {selectedTimeSlots.map((slot, index) => (
              <Text key={index} style={styles.selectedSlotText}>
                {slot}
              </Text>
            ))}

            <TextInput
              style={styles.taskInput}
              placeholder="Enter Task here..."
              value={taskText}
              onChangeText={setTaskText}
              autoFocus={true}
            />

            <View style={styles.categoryPickerContainer}>
              <Picker
                selectedValue={taskCategory}
                style={styles.categoryPicker}
                onValueChange={(itemValue) => setTaskCategory(itemValue)}
              >
                <Picker.Item label="Work" value="Work" />
                <Picker.Item label="Personal" value="Personal" />
                <Picker.Item label="Meeting" value="Meeting" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (selectedTimeSlots.length > 0) {
              setModalVisible(true);
            } else {
              Alert.alert('Error', 'Please select at least one time slot.');
            }
          }}
        >
          <Icon name="bookmark" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="edit" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="delete" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginHorizontal: 5,
    height: 40,
    justifyContent: 'center',
    width: 80,
  },
  picker: {
    height: 40,
    width: 80,
  },
  searchButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  analyticsButton: {
    backgroundColor: 'black',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
  },
  analyticsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  timeSlotsContainer: {
    padding: 10,
  },
  timeSlot: {
    flex: 1,
    backgroundColor: '#a8dadc',
    margin: 5,
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    maxWidth: '24%',
  },
  selectedTimeSlot: {
    borderWidth: 3,
    borderColor: 'black',
  },
  timeSlotText: {
    textAlign: 'center',
    color: '#333',
    fontSize: 12,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  actionButton: {
    backgroundColor: '#2c3846',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedSlotText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  taskInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  categoryPickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 20,
  },
  categoryPicker: {
    width: '100%',
    height: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;
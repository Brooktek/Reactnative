import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddTaskModal = ({ visible, selectedTimeSlots, onClose, onSubmit }) => {
  const [taskText, setTaskText] = useState('');
  const [taskCategory, setTaskCategory] = useState('Work');
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 380;

  const handleSubmit = () => {
    onSubmit(taskText, taskCategory);
    setTaskText('');
  };

  // Format the selected time slots for display in the modal
  const getSelectedBoxesText = () => {
    if (selectedTimeSlots.length === 0) return "";
    if (selectedTimeSlots.length === 1) return selectedTimeSlots[0].text;
    
    return `${selectedTimeSlots.length} time slots selected`;
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isSmallScreen && styles.smallModalContent]}>
          <Text style={styles.modalTitle}>Selected Boxes: {getSelectedBoxesText()}</Text>
          
          {selectedTimeSlots.length > 1 && (
            <ScrollView style={styles.selectedSlotsContainer}>
              {selectedTimeSlots.map((slot, index) => (
                <Text key={index} style={styles.selectedSlotText}>
                  • {slot.text}
                </Text>
              ))}
            </ScrollView>
          )}
          
          <TextInput
            style={styles.textInput}
            placeholder="Enter Task here..."
            value={taskText}
            onChangeText={setTaskText}
          />
          
          <TouchableOpacity style={styles.categoryDropdown}>
            <Text>{taskCategory}</Text>
            <Ionicons name="chevron-down" size={16} color="#000" />
          </TouchableOpacity>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addTagButton}>
              <Text style={styles.buttonText}>Add Tag</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Dimensions.get('window').width * 0.8,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  smallModalContent: {
    width: Dimensions.get('window').width * 0.9,
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  selectedSlotsContainer: {
    width: '100%',
    marginBottom: 15,
    maxHeight: 100,
  },
  selectedSlotText: {
    fontSize: 14,
    marginBottom: 5,
  },
  textInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  categoryDropdown: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    flexWrap: 'wrap',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 5,
  },
  addTagButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddTaskModal;
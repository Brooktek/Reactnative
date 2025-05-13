"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import Calendar from "../../components/Calendar"
import AsyncStorage from "@react-native-async-storage/async-storage"


// Generate time slots from 12 AM to 12 AM
const generateTimeSlots = () => {
  const timeSlots = []

  for (let hour = 0; hour < 24; hour++) {

    let period
    if (hour < 6) {
      period = "AM"
    } else if (hour < 18) {
      period = "PM"
    } else {
      period = "AM"
    }

    const displayHour = hour % 12 === 0 ? 12 : hour % 12

    timeSlots.push({
      id: `slot-${hour}-00`,
      time: `${displayHour}:00 ${period}`,
      displayText: `${displayHour}:00 ${period}`,
    })

    timeSlots.push({
      id: `slot-${hour}-30`,
      time: `${displayHour}:30 ${period}`,
      displayText: `${displayHour}:30 ${period}`,
    })
  }

  return timeSlots
}


const TimeSlotScreen = () => {
  const navigation = useNavigation()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState(generateTimeSlots())
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [taskText, setTaskText] = useState("")
  const [taskCategory, setTaskCategory] = useState("Work")
  const [tasks, setTasks] = useState([])
  const [selectedView, setSelectedView] = useState("calendar") 

  // Load tasks from storage when component mounts
  useEffect(() => {
    loadTasks()
  }, [])

  // Load tasks whenever selected date changes
  useEffect(() => {
    loadTasks()
  }, [selectedDate])

  // Load tasks from AsyncStorage
  const loadTasks = async () => {
    try {
      const dateStr = selectedDate.toDateString()
      const storedTasksJson = await AsyncStorage.getItem("tasks")

      if (storedTasksJson) {
        const storedTasks = JSON.parse(storedTasksJson)
        // Filter tasks for the selected date
        const tasksForDate = storedTasks.filter((task) => task.date === dateStr)
        setTasks(tasksForDate)

        // Highlight time slots that have tasks
        updateTimeSlotHighlights(tasksForDate)
      }
    } catch (error) {
      console.error("Failed to load tasks:", error)
    }
  }

  // Update time slot highlights based on existing tasks
  const updateTimeSlotHighlights = (tasksForDate) => {
    const updatedTimeSlots = generateTimeSlots()

    // Create a set of all time slots that have tasks
    const occupiedTimeSlotIds = new Set()
    tasksForDate.forEach((task) => {
      task.timeSlotIds.forEach((slotId) => {
        occupiedTimeSlotIds.add(slotId)
      })
    })

    // Update time slots with occupation status
    updatedTimeSlots.forEach((slot) => {
      if (occupiedTimeSlotIds.has(slot.id)) {
        slot.hasTask = true
      }
    })

    setTimeSlots(updatedTimeSlots)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    // Clear selected time slots when date changes
    setSelectedTimeSlots([])
  }

  const toggleTimeSlot = (slot) => {
    setSelectedTimeSlots((prev) => {
      // Check if already selected
      const isSelected = prev.some((selectedSlot) => selectedSlot.id === slot.id)

      if (isSelected) {
        // Remove from selection
        return prev.filter((selectedSlot) => selectedSlot.id !== slot.id)
      } else {
        // Add to selection
        return [...prev, slot]
      }
    })
  }

  const handleAddPress = () => {
    if (selectedTimeSlots.length === 0) {
      Alert.alert("No Time Selected", "Please select at least one time slot first.")
      return
    }

    setModalVisible(true)
  }

  const saveTask = async () => {
    if (!taskText.trim()) {
      Alert.alert("Task Required", "Please enter a task description.")
      return
    }

    try {
      // Create new task object
      const newTask = {
        id: Date.now().toString(),
        task: taskText,
        category: taskCategory,
        date: selectedDate.toDateString(),
        timeSlotIds: selectedTimeSlots.map((slot) => slot.id),
        timeSlots: selectedTimeSlots.map((slot) => slot.displayText),
        timestamp: new Date().toLocaleTimeString(),
        totalTime: selectedTimeSlots.length * 0.5, // Each slot is 30 minutes
      }

      // Get existing tasks
      const storedTasksJson = await AsyncStorage.getItem("tasks")
      const storedTasks = storedTasksJson ? JSON.parse(storedTasksJson) : []

      // Add new task
      const updatedTasks = [...storedTasks, newTask]

      // Save back to storage
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks))

      // Update state
      setTasks((prev) => [...prev, newTask])
      updateTimeSlotHighlights([...tasks, newTask])

      // Reset form
      setTaskText("")
      setSelectedTimeSlots([])
      setModalVisible(false)

      // Show success message
      Alert.alert("Success", "Task added successfully!")
    } catch (error) {
      console.error("Failed to save task:", error)
      Alert.alert("Error", "Failed to save your task. Please try again.")
    }
  }

  const goToAnalytics = () => {
    navigation.navigate("explore")
  }

  const renderTimeSlot = ({ item }) => {
    const isSelected = selectedTimeSlots.some((slot) => slot.id === item.id)

    return (
      <TouchableOpacity
        style={[styles.timeSlot, isSelected && styles.selectedTimeSlot, item.hasTask && styles.occupiedTimeSlot]}
        onPress={() => toggleTimeSlot(item)}
      >
        <Text style={[styles.timeSlotText, isSelected && styles.selectedTimeSlotText]}>{item.displayText}</Text>
        {item.hasTask && (
          <View style={styles.taskIndicator}>
            <Ionicons name="bookmark" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const renderTaskItem = ({ item }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskDetails}>
        <Text style={styles.taskTitle}>{item.task}</Text>
        <Text style={styles.taskTime}>{item.timeSlots.join(", ")}</Text>
      </View>
      <View
        style={[
          styles.categoryTag,
          {
            backgroundColor:
              item.category === "Work" ? "#FF5252" : item.category === "Personal" ? "#4CAF50" : "#2196F3",
          },
        ]}
      >
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={goToAnalytics}>
            <Ionicons name="analytics" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* View Switcher */}
      <View style={styles.viewSwitcher}>
        <TouchableOpacity
          style={[styles.viewTab, selectedView === "calendar" && styles.activeViewTab]}
          onPress={() => setSelectedView("calendar")}
        >
          <Ionicons name="calendar" size={20} color={selectedView === "calendar" ? "#6c63ff" : "#888"} />
          <Text style={[styles.viewTabText, selectedView === "calendar" && styles.activeViewTabText]}>Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewTab, selectedView === "timeSlots" && styles.activeViewTab]}
          onPress={() => setSelectedView("timeSlots")}
        >
          <Ionicons name="time" size={20} color={selectedView === "timeSlots" ? "#6c63ff" : "#888"} />
          <Text style={[styles.viewTabText, selectedView === "timeSlots" && styles.activeViewTabText]}>Time Slots</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {selectedView === "calendar" ? (
          /* Calendar View */
          <Calendar onDateSelect={handleDateSelect} />
        ) : (
          /* Time Slots View */
          <View style={styles.timeSlotsContainer}>
            <Text style={styles.dateHeader}>{selectedDate.toDateString()}</Text>

            {/* {tasks.length > 0 && (
              <View style={styles.tasksForDay}>
                <Text style={styles.tasksForDayTitle}>Tasks for today:</Text>
                <FlatList
                  data={tasks}
                  renderItem={renderTaskItem}
                  keyExtractor={(item) => item.id}
                  horizontal={false}
                  style={styles.tasksList}
                />
              </View>
            )} */}

            <Text style={styles.timeSlotsTitle}>Select Time Slots:</Text>
            <FlatList
              data={timeSlots}
              renderItem={renderTimeSlot}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.timeSlotsList}
            />
          </View>
        )}
      </View>

      {/* Modal for Adding Task */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>

            <View style={styles.modalForm}>
              <Text style={styles.modalLabel}>Task Description:</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter task description"
                placeholderTextColor="#888"
                value={taskText}
                onChangeText={setTaskText}
              />

              <Text style={styles.modalLabel}>Category:</Text>
              <View style={styles.categoryButtons}>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    taskCategory === "Work" && styles.activeCategoryButton,
                    { backgroundColor: "#FF5252" },
                  ]}
                  onPress={() => setTaskCategory("Work")}
                >
                  <Text style={styles.categoryButtonText}>Work</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    taskCategory === "Personal" && styles.activeCategoryButton,
                    { backgroundColor: "#4CAF50" },
                  ]}
                  onPress={() => setTaskCategory("Personal")}
                >
                  <Text style={styles.categoryButtonText}>Personal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    taskCategory === "Meeting" && styles.activeCategoryButton,
                    { backgroundColor: "#2196F3" },
                  ]}
                  onPress={() => setTaskCategory("Meeting")}
                >
                  <Text style={styles.categoryButtonText}>Meeting</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Selected Time Slots:</Text>
              <View style={styles.selectedSlotsList}>
                {selectedTimeSlots.map((slot) => (
                  <View key={slot.id} style={styles.selectedSlotChip}>
                    <Text style={styles.selectedSlotText}>{slot.displayText}</Text>
                    <TouchableOpacity style={styles.removeSlotButton} onPress={() => toggleTimeSlot(slot)}>
                      <Ionicons name="close-circle" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={saveTask}>
                <Text style={styles.modalButtonText}>Save Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      {selectedView === "timeSlots" && (
        <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  headerRight: {
    flexDirection: "row",
  },
  headerButton: {
    marginLeft: 15,
  },
  viewSwitcher: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  viewTab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  activeViewTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#6c63ff",
  },
  viewTabText: {
    color: "#888",
    marginLeft: 6,
  },
  activeViewTabText: {
    color: "#6c63ff",
  },
  content: {
    flex: 1,
  },
  timeSlotsContainer: {
    flex: 1,
    padding: 15,
  },
  dateHeader: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  tasksForDay: {
    marginBottom: 20,
  },
  tasksForDayTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  tasksList: {
    maxHeight: 150,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  taskTime: {
    color: "#aaa",
    fontSize: 14,
  },
  categoryTag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginLeft: 10,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  timeSlotsTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  timeSlotsList: {
    paddingBottom: 80,
  },
  timeSlot: {
    flex: 1,
    height: 70,
    backgroundColor: "#1e1e1e",
    margin: 5,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: 10,
  },
  selectedTimeSlot: {
    backgroundColor: "#6c63ff",
  },
  occupiedTimeSlot: {
    borderWidth: 2,
    borderColor: "#FF5252",
  },
  timeSlotText: {
    color: "#fff",
  },
  selectedTimeSlotText: {
    fontWeight: "bold",
  },
  taskIndicator: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#6c63ff",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    width: "90%",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalForm: {
    marginBottom: 20,
  },
  modalLabel: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#2a2a2a",
    borderRadius: 6,
    padding: 12,
    color: "#fff",
    marginBottom: 15,
  },
  categoryButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    opacity: 0.7,
  },
  activeCategoryButton: {
    opacity: 1,
  },
  categoryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  selectedSlotsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  selectedSlotChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    margin: 4,
  },
  selectedSlotText: {
    color: "#fff",
    fontSize: 14,
    marginRight: 5,
  },
  removeSlotButton: {
    padding: 2,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#333",
  },
  saveButton: {
    backgroundColor: "#6c63ff",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
})

export default TimeSlotScreen

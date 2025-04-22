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
  Animated,
  Dimensions,
  Switch,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import Calendar from "@/components/Calendar"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTheme } from "@/contexts/ThemeContext"

// Get screen dimensions
const { width } = Dimensions.get("window")

// Generate time slots from 8 AM to 8 PM
const generateTimeSlots = () => {
  const timeSlots = []
  for (let hour = 8; hour < 20; hour++) {
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour > 12 ? hour - 12 : hour

    // Add two 30-minute slots per hour
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

export default function TimeSlotScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState(generateTimeSlots())
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [taskText, setTaskText] = useState("")
  const [taskCategory, setTaskCategory] = useState("Work")
  const [tasks, setTasks] = useState([])
  const [selectedView, setSelectedView] = useState("calendar") // "calendar" or "timeSlots"
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [sidebarAnimation] = useState(new Animated.Value(-width * 0.7))

  // Load tasks from storage when component mounts
  useEffect(() => {
    loadTasks()
  }, [])

  // Load tasks whenever selected date changes
  useEffect(() => {
    loadTasks()
  }, [selectedDate])

  // Animate sidebar
  useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: sidebarVisible ? 0 : -width * 0.7,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [sidebarVisible])

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

  // Modify the handleDateSelect function to automatically switch to time slots view
  const handleDateSelect = (date) => {
    setSelectedDate(date)
    // Clear selected time slots when date changes
    setSelectedTimeSlots([])
    // Automatically switch to time slots view when a date is selected
    setSelectedView("timeSlots")
  }

  // Update the updateTimeSlotHighlights function to include category colors
  const updateTimeSlotHighlights = (tasksForDate) => {
    const updatedTimeSlots = generateTimeSlots()

    // Create a map of time slots with their tasks and categories
    const slotTaskMap = new Map()

    tasksForDate.forEach((task) => {
      task.timeSlotIds.forEach((slotId) => {
        slotTaskMap.set(slotId, {
          hasTask: true,
          category: task.category,
          taskText: task.task,
        })
      })
    })

    // Update time slots with occupation status and category
    updatedTimeSlots.forEach((slot) => {
      if (slotTaskMap.has(slot.id)) {
        const taskInfo = slotTaskMap.get(slot.id)
        slot.hasTask = true
        slot.category = taskInfo.category
        slot.taskText = taskInfo.taskText
      }
    })

    setTimeSlots(updatedTimeSlots)
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

  const goToAnalytics = () => {
    router.push("/(tabs)/explore")
  }

  const handleEditPress = () => {
    if (selectedTimeSlots.length === 0) {
      Alert.alert("No Time Selected", "Please select a time slot with a task to edit.")
      return
    }

    // Check if selected time slots have tasks
    const hasTask = selectedTimeSlots.some((slot) => timeSlots.find((ts) => ts.id === slot.id)?.hasTask)

    if (!hasTask) {
      Alert.alert("No Task Found", "Please select a time slot that has a task to edit.")
      return
    }

    // Find tasks for the selected time slots
    const tasksToEdit = tasks.filter((task) =>
      task.timeSlotIds.some((id) => selectedTimeSlots.map((slot) => slot.id).includes(id)),
    )

    if (tasksToEdit.length > 0) {
      // Pre-fill the form with the first task's data
      setTaskText(tasksToEdit[0].task)
      setTaskCategory(tasksToEdit[0].category)
      setModalVisible(true)
      // Store the task ID being edited
      setEditingTaskId(tasksToEdit[0].id)
    }
  }

  const handleDeletePress = () => {
    if (selectedTimeSlots.length === 0) {
      Alert.alert("No Time Selected", "Please select a time slot with a task to delete.")
      return
    }

    // Check if selected time slots have tasks
    const hasTask = selectedTimeSlots.some((slot) => timeSlots.find((ts) => ts.id === slot.id)?.hasTask)

    if (!hasTask) {
      Alert.alert("No Task Found", "Please select a time slot that has a task to delete.")
      return
    }

    Alert.alert("Confirm Delete", "Are you sure you want to delete the task(s) in the selected time slots?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: deleteSelectedTasks,
      },
    ])
  }

  const deleteSelectedTasks = async () => {
    try {
      // Get all tasks
      const storedTasksJson = await AsyncStorage.getItem("tasks")
      if (!storedTasksJson) return

      const storedTasks = JSON.parse(storedTasksJson)

      // Filter out tasks that have time slots in the selected time slots
      const selectedSlotIds = selectedTimeSlots.map((slot) => slot.id)
      const updatedTasks = storedTasks.filter((task) => {
        // Keep task if none of its time slots are in the selected time slots
        return !task.timeSlotIds.some((id) => selectedSlotIds.includes(id))
      })

      // Save updated tasks
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks))

      // Update state
      setTasks(tasks.filter((task) => !task.timeSlotIds.some((id) => selectedSlotIds.includes(id))))
      setSelectedTimeSlots([])

      // Update time slot highlights
      updateTimeSlotHighlights(updatedTasks.filter((task) => task.date === selectedDate.toDateString()))

      Alert.alert("Success", "Task(s) deleted successfully!")
    } catch (error) {
      console.error("Failed to delete tasks:", error)
      Alert.alert("Error", "Failed to delete tasks. Please try again.")
    }
  }

  const saveTask = async () => {
    if (!taskText.trim()) {
      Alert.alert("Task Required", "Please enter a task description.")
      return
    }

    try {
      // Get existing tasks
      const storedTasksJson = await AsyncStorage.getItem("tasks")
      const storedTasks = storedTasksJson ? JSON.parse(storedTasksJson) : []

      if (editingTaskId) {
        // Editing existing task
        const updatedTasks = storedTasks.map((task) => {
          if (task.id === editingTaskId) {
            return {
              ...task,
              task: taskText,
              category: taskCategory,
              timeSlotIds: selectedTimeSlots.map((slot) => slot.id),
              timeSlots: selectedTimeSlots.map((slot) => slot.displayText),
              totalTime: selectedTimeSlots.length * 0.5,
            }
          }
          return task
        })

        // Save updated tasks
        await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks))

        // Update state
        setTasks(
          tasks.map((task) =>
            task.id === editingTaskId
              ? {
                  ...task,
                  task: taskText,
                  category: taskCategory,
                  timeSlotIds: selectedTimeSlots.map((slot) => slot.id),
                  timeSlots: selectedTimeSlots.map((slot) => slot.displayText),
                  totalTime: selectedTimeSlots.length * 0.5,
                }
              : task,
          ),
        )

        Alert.alert("Success", "Task updated successfully!")
      } else {
        // Creating new task
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

        // Add new task
        const updatedTasks = [...storedTasks, newTask]

        // Save back to storage
        await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks))

        // Update state
        setTasks((prev) => [...prev, newTask])

        Alert.alert("Success", "Task added successfully!")
      }

      // Update time slot highlights
      loadTasks()

      // Reset form
      setTaskText("")
      setSelectedTimeSlots([])
      setModalVisible(false)
      setEditingTaskId(null)
    } catch (error) {
      console.error("Failed to save task:", error)
      Alert.alert("Error", "Failed to save your task. Please try again.")
    }
  }

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case "Work":
        return colors.error
      case "Personal":
        return colors.success
      case "Meeting":
        return colors.info
      case "School":
        return colors.warning
      case "Team Time":
        return "#03A9F4"
      case "Friends":
        return "#9C27B0"
      default:
        return colors.accent
    }
  }

  // Update the renderTimeSlot function to display category colors
  const renderTimeSlot = ({ item }) => {
    const isSelected = selectedTimeSlots.some((slot) => slot.id === item.id)

    // Determine background color based on category
    let backgroundColor = colors.surfaceVariant // Default background
    if (item.hasTask) {
      backgroundColor = getCategoryColor(item.category)
    }

    // Apply opacity for better text readability
    const finalBackgroundColor = item.hasTask ? backgroundColor + "CC" : backgroundColor // CC adds 80% opacity

    return (
      <TouchableOpacity
        style={[
          styles.timeSlot,
          { backgroundColor: finalBackgroundColor },
          isSelected && [styles.selectedTimeSlot, { borderColor: colors.selected }],
        ]}
        onPress={() => toggleTimeSlot(item)}
      >
        <Text style={[styles.timeSlotText, { color: colors.text }, isSelected && styles.selectedTimeSlotText]}>
          {item.displayText}
        </Text>
        {item.hasTask && (
          <View style={styles.taskTextContainer}>
            <Text style={styles.taskTextInSlot} numberOfLines={1}>
              {item.taskText}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const renderTaskItem = ({ item }) => (
    <View style={[styles.taskItem, { backgroundColor: colors.surfaceVariant }]}>
      <View style={styles.taskDetails}>
        <Text style={[styles.taskTitle, { color: colors.text }]}>{item.task}</Text>
        <Text style={[styles.taskTime, { color: colors.textSecondary }]}>{item.timeSlots.join(", ")}</Text>
      </View>
      <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(item.category) }]}>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
    </View>
  )

  // Sidebar menu items
  const renderSidebarMenuItem = (icon, text, color, isCategory = false) => (
    <View style={[styles.sidebarMenuItem, { borderBottomColor: colors.border }]}>
      <View style={styles.sidebarMenuItemLeft}>
        {isCategory ? (
          <View style={[styles.categoryDot, { backgroundColor: color }]} />
        ) : (
          <View style={styles.menuIconContainer}>{icon}</View>
        )}
        <Text style={[styles.sidebarMenuItemText, { color: isDarkMode ? "#fff" : "#333" }]}>{text}</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color={colors.accent} />
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Sidebar Overlay */}
      {sidebarVisible && (
        <TouchableOpacity style={styles.sidebarOverlay} activeOpacity={1} onPress={() => setSidebarVisible(false)} />
      )}

      {/* Sidebar Menu */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: sidebarAnimation }],
            backgroundColor: isDarkMode ? "#121212" : "#ffffff",
          },
        ]}
      >
        <View style={styles.sidebarHeader}>
          <Text style={[styles.sidebarTitle, { color: isDarkMode ? "#fff" : "#1a237e" }]}>Value Tracker</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Theme Toggle */}
        <View style={[styles.themeToggleContainer, { borderBottomColor: colors.border }]}>
          <View style={styles.themeToggleLeft}>
            <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={isDarkMode ? "#fff" : "#333"} />
            <Text style={[styles.themeToggleText, { color: isDarkMode ? "#fff" : "#333" }]}>
              {isDarkMode ? "Dark Mode" : "Light Mode"}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: "#6c63ff50" }}
            thumbColor={isDarkMode ? "#6c63ff" : "#f4f3f4"}
          />
        </View>

        {/* Menu Items */}
        {renderSidebarMenuItem(<Ionicons name="diamond" size={20} color="#00BCD4" />, "Core Rock", "#00BCD4")}
        {renderSidebarMenuItem(<Ionicons name="radio-button-on" size={20} color="#FF5252" />, "Target", "#FF5252")}
        {renderSidebarMenuItem(<Ionicons name="flash" size={20} color="#FF9800" />, "Action", "#FF9800")}

        {/* Categories Section */}
        <Text style={[styles.sidebarSectionTitle, { color: isDarkMode ? "#fff" : "#333" }]}>Categories</Text>
        {renderSidebarMenuItem(null, "Work", "#FF5252", true)}
        {renderSidebarMenuItem(null, "School", "#4CAF50", true)}
        {renderSidebarMenuItem(null, "Team Time", "#2196F3", true)}
        {renderSidebarMenuItem(null, "Friends", "#9C27B0", true)}
      </Animated.View>

      

      {/* Main Content */}
      <View style={styles.content}>
        {selectedView === "calendar" ? (
          /* Calendar View */
          <Calendar onDateSelect={handleDateSelect} />
        ) : (
          /* Time Slots View */
          <View style={styles.timeSlotsContainer}>
            <Text style={[styles.dateHeader, { color: colors.text }]}>{selectedDate.toDateString()}</Text>

            {tasks.length > 0 && (
              <View style={styles.tasksForDay}>
                <Text style={[styles.tasksForDayTitle, { color: colors.text }]}>Tasks for today:</Text>
                <FlatList
                  data={tasks}
                  renderItem={renderTaskItem}
                  keyExtractor={(item) => item.id}
                  horizontal={false}
                  style={styles.tasksList}
                />
              </View>
            )}

            <Text style={[styles.timeSlotsTitle, { color: colors.text }]}>Select Time Slots:</Text>
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
        onRequestClose={() => {
          setModalVisible(false)
          setEditingTaskId(null)
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingTaskId ? "Edit Task" : "Add New Task"}
            </Text>

            <View style={styles.modalForm}>
              <Text style={[styles.modalLabel, { color: colors.text }]}>Task Description:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Enter task description"
                placeholderTextColor={colors.textSecondary}
                value={taskText}
                onChangeText={setTaskText}
              />

              <Text style={[styles.modalLabel, { color: colors.text }]}>Category:</Text>
              <View style={styles.categoryButtons}>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    taskCategory === "Work" && styles.activeCategoryButton,
                    { backgroundColor: colors.error },
                  ]}
                  onPress={() => setTaskCategory("Work")}
                >
                  <Text style={styles.categoryButtonText}>Work</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    taskCategory === "Personal" && styles.activeCategoryButton,
                    { backgroundColor: colors.success },
                  ]}
                  onPress={() => setTaskCategory("Personal")}
                >
                  <Text style={styles.categoryButtonText}>Personal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    taskCategory === "Meeting" && styles.activeCategoryButton,
                    { backgroundColor: colors.info },
                  ]}
                  onPress={() => setTaskCategory("Meeting")}
                >
                  <Text style={styles.categoryButtonText}>Meeting</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalLabel, { color: colors.text }]}>Selected Time Slots:</Text>
              <View style={styles.selectedSlotsList}>
                {selectedTimeSlots.map((slot) => (
                  <View key={slot.id} style={[styles.selectedSlotChip, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.selectedSlotText, { color: colors.text }]}>{slot.displayText}</Text>
                    <TouchableOpacity style={styles.removeSlotButton} onPress={() => toggleTimeSlot(slot)}>
                      <Ionicons name="close-circle" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.surface }]}
                onPress={() => {
                  setModalVisible(false)
                  setEditingTaskId(null)
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.accent }]}
                onPress={saveTask}
              >
                <Text style={styles.modalButtonText}>Save Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Buttons */}
      {selectedView === "timeSlots" && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={[styles.fab, styles.fabDelete, { backgroundColor: colors.error }]}
            onPress={handleDeletePress}
          >
            <Ionicons name="trash" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fab, styles.fabEdit, { backgroundColor: colors.info }]}
            onPress={handleEditPress}
          >
            <Ionicons name="pencil" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fab, styles.fabAdd, { backgroundColor: colors.success }]}
            onPress={handleAddPress}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 15,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewSwitcher: {
    flexDirection: "row",
    borderBottomWidth: 1,
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
  },
  viewTabText: {
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  timeSlotsContainer: {
    flex: 1,
    padding: 15,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  tasksForDay: {
    marginBottom: 20,
  },
  tasksForDayTitle: {
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
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  taskTime: {
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
    fontSize: 16,
    marginBottom: 10,
  },
  timeSlotsList: {
    paddingBottom: 80,
  },
  timeSlot: {
    flex: 1,
    height: 70,
    margin: 5,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: 10,
  },
  selectedTimeSlot: {
    borderWidth: 3,
  },
  timeSlotText: {
    fontWeight: "500",
  },
  selectedTimeSlotText: {
    fontWeight: "bold",
  },
  taskTextContainer: {
    position: "absolute",
    bottom: 5,
    left: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 2,
    borderRadius: 5,
  },
  taskTextInSlot: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    marginLeft: 10,
  },
  fabAdd: {
    backgroundColor: "#4CAF50", // Green
  },
  fabEdit: {
    backgroundColor: "#2196F3", // Blue
  },
  fabDelete: {
    backgroundColor: "#FF5252", // Red
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "90%",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalForm: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  modalInput: {
    borderRadius: 6,
    padding: 12,
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
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    margin: 4,
  },
  selectedSlotText: {
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

  // Sidebar styles
  sidebarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "70%",
    height: "100%",
    zIndex: 20,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  themeToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  themeToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeToggleText: {
    fontSize: 16,
    marginLeft: 10,
  },
  sidebarSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 15,
  },
  sidebarMenuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sidebarMenuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sidebarMenuItemText: {
    fontSize: 16,
    marginLeft: 10,
  },
  menuIconContainer: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  addButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
})

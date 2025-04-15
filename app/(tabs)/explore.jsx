"use client"

import { useState, useEffect } from "react"
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { BarChart, PieChart } from "react-native-chart-kit"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"

const AnalyticsScreen = () => {
  const navigation = useNavigation()
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [selectedDay, setSelectedDay] = useState(new Date().getDate().toString())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [dateRangeFilter, setDateRangeFilter] = useState("day") // "day", "week", "month", "year"
  const screenWidth = Dimensions.get("window").width

  // Month names for dropdown and display
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  useEffect(() => {
    loadTasks()
  }, [selectedDay, selectedMonth, selectedYear, selectedCategory, dateRangeFilter])

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const storedTasksJson = await AsyncStorage.getItem("tasks")

      if (storedTasksJson) {
        const allTasks = JSON.parse(storedTasksJson)
        let filteredTasks = allTasks

        // Apply date range filter
        filteredTasks = filterTasksByDateRange(allTasks)

        // Apply category filter
        if (selectedCategory !== "All") {
          filteredTasks = filteredTasks.filter((task) => task.category === selectedCategory)
        }

        setTasks(filteredTasks)
      } else {
        // If no tasks, use empty array
        setTasks([])
      }
    } catch (error) {
      console.error("Failed to load tasks:", error)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterTasksByDateRange = (allTasks) => {
    const today = new Date(selectedYear, selectedMonth, Number.parseInt(selectedDay))

    // Set start and end dates based on filter
    let startDate, endDate

    if (dateRangeFilter === "day") {
      // Single day
      startDate = new Date(today)
      endDate = new Date(today)
    } else if (dateRangeFilter === "week") {
      // Current week
      const dayOfWeek = today.getDay()
      startDate = new Date(today)
      startDate.setDate(today.getDate() - dayOfWeek) // Start of week (Sunday)
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6) // End of week (Saturday)
    } else if (dateRangeFilter === "month") {
      // Current month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0) // Last day of month
    } else if (dateRangeFilter === "year") {
      // Current year
      startDate = new Date(today.getFullYear(), 0, 1)
      endDate = new Date(today.getFullYear(), 11, 31)
    }

    // Convert to date strings for comparison
    const startDateStr = startDate.toDateString()
    const endDateStr = endDate.toDateString()

    // Filter tasks that fall within range
    return allTasks.filter((task) => {
      const taskDate = new Date(task.date)
      return taskDate >= new Date(startDateStr) && taskDate <= new Date(endDateStr)
    })
  }

  // Prepare chart data
  const prepareBarChartData = () => {
    // Group tasks by tag and sum total time
    const tagTotals = {}
    tasks.forEach((task) => {
      if (!tagTotals[task.category]) {
        tagTotals[task.category] = 0
      }
      tagTotals[task.category] += task.totalTime
    })

    // If no tasks, show dummy data
    if (Object.keys(tagTotals).length === 0) {
      return {
        labels: ["Work", "Meeting", "Personal"],
        datasets: [
          {
            data: [1, 2, 1.5],
            color: (opacity = 1) => `rgba(255, 82, 82, ${opacity})`, // Red
            strokeWidth: 2,
          },
        ],
      }
    }

    return {
      labels: Object.keys(tagTotals),
      datasets: [
        {
          data: Object.values(tagTotals),
          color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`, // Purple
          strokeWidth: 2,
        },
      ],
    }
  }

  const preparePieChartData = () => {
    // Count tasks by tag
    const tagCounts = {}
    tasks.forEach((task) => {
      if (!tagCounts[task.category]) {
        tagCounts[task.category] = 0
      }
      tagCounts[task.category]++
    })

    // If no tasks, show dummy data
    if (Object.keys(tagCounts).length === 0) {
      return [
        {
          name: "Work",
          population: 1,
          color: "#FF5252",
          legendFontColor: "#fff",
          legendFontSize: 12,
        },
        {
          name: "Meeting",
          population: 1,
          color: "#2196F3",
          legendFontColor: "#fff",
          legendFontSize: 12,
        },
        {
          name: "Personal",
          population: 1,
          color: "#4CAF50",
          legendFontColor: "#fff",
          legendFontSize: 12,
        },
      ]
    }

    // Convert to pie chart format with proper colors
    return Object.keys(tagCounts).map((tag) => {
      let color = "#999999"
      if (tag === "Work") color = "#FF5252" // Red
      if (tag === "Personal") color = "#4CAF50" // Green
      if (tag === "Meeting") color = "#2196F3" // Blue

      return {
        name: tag,
        population: tagCounts[tag],
        color: color,
        legendFontColor: "#fff",
        legendFontSize: 12,
      }
    })
  }

  // Task completion calendar
  const renderCalendarGrid = () => {
    // Get the number of days in the current month
    const daysInMonth = new Date(Number.parseInt(selectedYear), Number.parseInt(selectedMonth) + 1, 0).getDate()
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    // Get completed days from tasks
    const completedDays = new Set()

    // Add each day that has a task
    tasks.forEach((task) => {
      const taskDate = new Date(task.date)
      if (
        taskDate.getMonth() === Number.parseInt(selectedMonth) &&
        taskDate.getFullYear() === Number.parseInt(selectedYear)
      ) {
        completedDays.add(taskDate.getDate())
      }
    })

    return (
      <View style={styles.calendarGrid}>
        {days.map((day) => (
          <View
            key={day}
            style={[styles.calendarDay, completedDays.has(day) ? styles.completedDay : styles.emptyDay]}
          />
        ))}
      </View>
    )
  }

  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics)
  }

  const goBack = () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <Ionicons name="analytics" size={24} color="white" />
          </View>
          <Text style={styles.welcomeText}>Analytics Dashboard</Text>
        </View>

        <View style={styles.filterContainer}>
          {/* Date Range Filter */}
          <View style={styles.dateRangeFilter}>
            <TouchableOpacity
              style={[styles.dateFilterButton, dateRangeFilter === "day" && styles.activeFilterButton]}
              onPress={() => setDateRangeFilter("day")}
            >
              <Text style={styles.dateFilterText}>Day</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateFilterButton, dateRangeFilter === "week" && styles.activeFilterButton]}
              onPress={() => setDateRangeFilter("week")}
            >
              <Text style={styles.dateFilterText}>Week</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateFilterButton, dateRangeFilter === "month" && styles.activeFilterButton]}
              onPress={() => setDateRangeFilter("month")}
            >
              <Text style={styles.dateFilterText}>Month</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateFilterButton, dateRangeFilter === "year" && styles.activeFilterButton]}
              onPress={() => setDateRangeFilter("year")}
            >
              <Text style={styles.dateFilterText}>Year</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerRow}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedDay}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedDay(itemValue)}
                dropdownIconColor="#fff"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <Picker.Item key={day} label={day.toString()} value={day.toString()} color="#fff" />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedMonth}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                dropdownIconColor="#fff"
              >
                {monthNames.map((month, index) => (
                  <Picker.Item key={month} label={month} value={index} color="#fff" />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedYear}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedYear(itemValue)}
                dropdownIconColor="#fff"
              >
                {[2023, 2024, 2025, 2026, 2027, 2028].map((year) => (
                  <Picker.Item key={year} label={year.toString()} value={year.toString()} color="#fff" />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.pickerRow}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCategory}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="All" value="All" color="#fff" />
                <Picker.Item label="Work" value="Work" color="#fff" />
                <Picker.Item label="Personal" value="Personal" color="#fff" />
                <Picker.Item label="Meeting" value="Meeting" color="#fff" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.hideButton} onPress={toggleAnalytics}>
              <Text style={styles.buttonText}>{showAnalytics ? "Hide Analytics" : "Show Analytics"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6c63ff" />
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : (
          <>
            {/* Task Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Task Summary</Text>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{tasks.length}</Text>
                  <Text style={styles.statLabel}>Total Tasks</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {tasks.reduce((total, task) => total + task.totalTime, 0).toFixed(1)}h
                  </Text>
                  <Text style={styles.statLabel}>Hours Planned</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Array.from(new Set(tasks.map((task) => task.date))).length}</Text>
                  <Text style={styles.statLabel}>Active Days</Text>
                </View>
              </View>
            </View>

            {/* Task List Summary */}
            {tasks.length > 0 && (
              <View style={styles.taskListCard}>
                <Text style={styles.cardTitle}>Recent Tasks</Text>
                <View style={styles.taskList}>
                  {tasks.slice(0, 5).map((task) => (
                    <View key={task.id} style={styles.taskItem}>
                      <View style={styles.taskContent}>
                        <Text style={styles.taskText}>{task.task}</Text>
                        <Text style={styles.taskDetails}>
                          {new Date(task.date).toLocaleDateString()} • {task.timeSlots.join(", ")}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.categoryBadge,
                          {
                            backgroundColor:
                              task.category === "Work"
                                ? "#FF5252"
                                : task.category === "Personal"
                                  ? "#4CAF50"
                                  : "#2196F3",
                          },
                        ]}
                      >
                        <Text style={styles.categoryText}>{task.category}</Text>
                      </View>
                    </View>
                  ))}

                  {tasks.length > 5 && (
                    <TouchableOpacity style={styles.showMoreButton}>
                      <Text style={styles.showMoreText}>Show more tasks</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Analytics Section */}
            {showAnalytics && (
              <>
                {/* Analytics Title */}
                <Text style={styles.analyticsTitle}>Visual Analytics</Text>

                {/* Charts Section */}
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Hours Spent per Category</Text>
                  <BarChart
                    data={prepareBarChartData()}
                    width={screenWidth - 40}
                    height={220}
                    yAxisSuffix="h"
                    chartConfig={{
                      backgroundColor: "#1e1e1e",
                      backgroundGradientFrom: "#1e1e1e",
                      backgroundGradientTo: "#1e1e1e",
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      barPercentage: 0.8,
                    }}
                    verticalLabelRotation={0}
                    fromZero
                    showValuesOnTopOfBars
                    style={styles.chart}
                  />
                </View>

                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Task Distribution by Category</Text>
                  <PieChart
                    data={preparePieChartData()}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={{
                      backgroundColor: "#1e1e1e",
                      backgroundGradientFrom: "#1e1e1e",
                      backgroundGradientTo: "#1e1e1e",
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="0"
                    absolute
                    style={styles.chart}
                  />
                </View>

                {/* Task Completion Calendar */}
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Activity Calendar</Text>
                  {renderCalendarGrid()}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={goBack}>
          <Ionicons name="calendar" size={24} color="#888" />
          <Text style={styles.navText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, styles.activeNavButton]}>
          <Ionicons name="analytics" size={24} color="#6c63ff" />
          <Text style={[styles.navText, styles.activeNavText]}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    padding: 15,
    backgroundColor: "#1e1e1e",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  welcomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backButton: {
    marginRight: 10,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6c63ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  welcomeText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  filterContainer: {
    alignItems: "flex-start",
  },
  dateRangeFilter: {
    flexDirection: "row",
    marginBottom: 15,
    backgroundColor: "#2a2a2a",
    borderRadius: 25,
    padding: 4,
  },
  dateFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: "#6c63ff",
  },
  dateFilterText: {
    color: "#fff",
    fontWeight: "500",
  },
  pickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5,
    marginRight: 8,
    marginBottom: 8,
    height: 40,
    width: 100,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
  },
  picker: {
    height: 40,
    width: 100,
    color: "#fff",
  },
  hideButton: {
    backgroundColor: "#6c63ff",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  summaryCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  summaryTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: "#6c63ff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statLabel: {
    color: "#aaa",
    fontSize: 14,
  },
  taskListCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  taskList: {
    marginBottom: 15,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 4,
  },
  taskDetails: {
    color: "#aaa",
    fontSize: 14,
  },
  categoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 10,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  showMoreButton: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 5,
  },
  showMoreText: {
    color: "#6c63ff",
    fontSize: 14,
  },
  analyticsTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  chartCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  chartTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  chart: {
    borderRadius: 8,
    alignSelf: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  calendarDay: {
    width: 30,
    height: 30,
    margin: 3,
    borderRadius: 4,
  },
  emptyDay: {
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#333",
  },
  completedDay: {
    backgroundColor: "#6c63ff",
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: "#1e1e1e",
    height: 60,
  },
  navButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  activeNavButton: {
    borderTopWidth: 2,
    borderTopColor: "#6c63ff",
  },
  navText: {
    color: "#888",
    marginTop: 5,
    fontSize: 12,
  },
  activeNavText: {
    color: "#6c63ff",
  },
})

export default AnalyticsScreen

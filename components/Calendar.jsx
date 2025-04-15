"use client"
import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

const Calendar = ({ onDateSelect }) => {
  const [viewMode, setViewMode] = useState("month") 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState(new Date().getDate())
  const [showViewSelector, setShowViewSelector] = useState(false)
  const [tasksForMonth, setTasksForMonth] = useState([])

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const fullMonthNames = [
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

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"]
  const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Load tasks for highlighting dates with events
  useEffect(() => {
    loadTasksForMonth()
  }, [selectedYear, selectedMonth])

  const loadTasksForMonth = async () => {
    try {
      const storedTasksJson = await AsyncStorage.getItem("tasks")

      if (storedTasksJson) {
        const allTasks = JSON.parse(storedTasksJson)

        // Filter tasks for current month and year
        const filteredTasks = allTasks.filter((task) => {
          const taskDate = new Date(task.date)
          return taskDate.getFullYear() === selectedYear && taskDate.getMonth() === selectedMonth
        })

        setTasksForMonth(filteredTasks)
      } else {
        setTasksForMonth([])
      }
    } catch (error) {
      console.error("Failed to load tasks for month:", error)
      setTasksForMonth([])
    }
  }

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  const getDaysInMonth = (year, month) => {
    const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    return daysInMonth[month]
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    if (onDateSelect) {
      onDateSelect(new Date(selectedYear, selectedMonth, date))
    }
  }

  const handleMonthSelect = (month) => {
    setSelectedMonth(month)
    setViewMode("month")
  }

  const toggleViewSelector = () => {
    setShowViewSelector(!showViewSelector)
  }

  const changeView = (mode) => {
    setViewMode(mode)
    setShowViewSelector(false)
  }

  // Check if a date has tasks
  const hasTasksOnDate = (day) => {
    return tasksForMonth.some((task) => {
      const taskDate = new Date(task.date)
      return taskDate.getDate() === day
    })
  }

  const renderYearView = () => {
    return (
      <View style={styles.yearContainer}>
        <Text style={styles.yearTitle}>{selectedYear}</Text>
        <View style={styles.monthsGrid}>
          {monthNames.map((month, index) => {
            // Generate a mini calendar for each month
            const daysInMonth = getDaysInMonth(selectedYear, index)
            const firstDay = getFirstDayOfMonth(selectedYear, index)

            return (
              <TouchableOpacity
                key={month}
                style={[styles.monthCard, selectedMonth === index && styles.selectedMonthCard]}
                onPress={() => handleMonthSelect(index)}
              >
                <Text style={styles.monthName}>{month}</Text>
                <View style={styles.miniCalendar}>
                  <View style={styles.miniDaysRow}>
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                      <Text key={i} style={[styles.miniDayName, i === 0 || i === 6 ? styles.weekendDay : {}]}>
                        {day}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.miniDatesGrid}>
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <View key={`empty-${i}`} style={styles.miniDateEmpty} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1
                      const isToday =
                        selectedYear === new Date().getFullYear() &&
                        index === new Date().getMonth() &&
                        day === new Date().getDate()
                      const isWeekend = (firstDay + i) % 7 === 0 || (firstDay + i) % 7 === 6

                      return (
                        <Text
                          key={`day-${i}`}
                          style={[styles.miniDate, isToday && styles.todayDate, isWeekend && styles.weekendDay]}
                        >
                          {day}
                        </Text>
                      )
                    })}
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    )
  }

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth)
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === selectedYear && today.getMonth() === selectedMonth

    // Calculate dates for the calendar grid
    const dates = []

    // Add empty spaces for days before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      dates.push(null)
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(i)
    }

    return (
      <View style={styles.monthViewContainer}>
        <Text style={styles.monthViewTitle}>
          {fullMonthNames[selectedMonth]} {selectedYear}
        </Text>

        <View style={styles.weekdaysRow}>
          {dayNames.map((day, index) => (
            <Text key={index} style={[styles.weekdayName, index === 0 || index === 6 ? styles.weekendDay : {}]}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.datesGrid}>
          {dates.map((date, index) => {
            if (date === null) {
              return <View key={`empty-${index}`} style={styles.emptyDate} />
            }

            const isToday = isCurrentMonth && date === today.getDate()
            const isSelected = date === selectedDate
            const dayOfWeek = (firstDay + date - 1) % 7
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
            const hasTask = hasTasksOnDate(date)

            return (
              <TouchableOpacity
                key={`date-${date}`}
                style={[
                  styles.dateButton,
                  isSelected && styles.selectedDate,
                  isToday && styles.todayButton,
                  hasTask && styles.hasTaskButton,
                ]}
                onPress={() => handleDateSelect(date)}
              >
                <Text
                  style={[
                    styles.dateText,
                    isSelected && styles.selectedDateText,
                    isToday && styles.todayText,
                    isWeekend && styles.weekendDay,
                  ]}
                >
                  {date}
                </Text>
                {hasTask && <View style={styles.taskDot} />}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    )
  }

  const renderViewSelector = () => {
    return (
      <Modal
        transparent={true}
        visible={showViewSelector}
        animationType="fade"
        onRequestClose={() => setShowViewSelector(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowViewSelector(false)}>
          <View style={styles.viewSelectorContainer}>
            <TouchableOpacity style={styles.viewOption} onPress={() => changeView("year")}>
              <Ionicons name="calendar-outline" size={24} color="#fff" />
              <Text style={styles.viewOptionText}>Year</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.viewOption} onPress={() => changeView("month")}>
              <Ionicons name="calendar-outline" size={24} color="#fff" />
              <Text style={styles.viewOptionText}>Month</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.viewOption} onPress={() => changeView("week")}>
              <Ionicons name="calendar-outline" size={24} color="#fff" />
              <Text style={styles.viewOptionText}>Week</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.viewOption} onPress={() => changeView("day")}>
              <Ionicons name="calendar-outline" size={24} color="#fff" />
              <Text style={styles.viewOptionText}>Day</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }

  const navigatePrevious = () => {
    if (viewMode === "year") {
      setSelectedYear(selectedYear - 1)
    } else if (viewMode === "month") {
      if (selectedMonth === 0) {
        setSelectedMonth(11)
        setSelectedYear(selectedYear - 1)
      } else {
        setSelectedMonth(selectedMonth - 1)
      }
    }
  }

  const navigateNext = () => {
    if (viewMode === "year") {
      setSelectedYear(selectedYear + 1)
    } else if (viewMode === "month") {
      if (selectedMonth === 11) {
        setSelectedMonth(0)
        setSelectedYear(selectedYear + 1)
      } else {
        setSelectedMonth(selectedMonth + 1)
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleViewSelector} style={styles.viewButton}>
          <Text style={styles.viewButtonText}>
            {viewMode === "year" ? "Year" : viewMode === "month" ? "Month" : viewMode === "week" ? "Week" : "Day"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.navigationButtons}>
          <TouchableOpacity onPress={navigatePrevious} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateNext} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.calendarContent}>
        {viewMode === "year" && renderYearView()}
        {viewMode === "month" && renderMonthView()}
        {/* Week and Day views would be implemented similarly */}
      </ScrollView>

      {renderViewSelector()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 18,
    marginRight: 5,
  },
  navigationButtons: {
    flexDirection: "row",
  },
  navButton: {
    padding: 5,
  },
  calendarContent: {
    flex: 1,
  },

  // Year view styles
  yearContainer: {
    padding: 10,
  },
  yearTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  monthCard: {
    width: "32%",
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  selectedMonthCard: {
    borderColor: "#6c63ff",
    borderWidth: 2,
  },

  monthName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  miniCalendar: {
    width: "100%",
  },
  miniDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  miniDayName: {
    color: "#aaa",
    fontSize: 8,
    textAlign: "center",
    width: "14%",
  },
  miniDatesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  miniDateEmpty: {
    width: "14%",
    aspectRatio: 1,
  },
  miniDate: {
    width: "14%",
    aspectRatio: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 8,
  },
  todayDate: {
    backgroundColor: "#6c63ff",
    borderRadius: 10,
    overflow: "hidden",
  },

  // Month view styles
  monthViewContainer: {
    padding: 10,
  },
  monthViewTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  weekdayName: {
    color: "#fff",
    fontSize: 14,
    width: "14%",
    textAlign: "center",
  },
  weekendDay: {
    color: "#ff5252",
  },
  datesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emptyDate: {
    width: "14.28%",
    aspectRatio: 1,
  },
  dateButton: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dateText: {
    color: "#fff",
    fontSize: 16,
  },
  selectedDate: {
    backgroundColor: "#6c63ff",
    borderRadius: 20,
  },
  selectedDateText: {
    color: "#fff",
    fontWeight: "bold",
  },
  todayButton: {
    borderWidth: 1,
    borderColor: "#6c63ff",
    borderRadius: 20,
  },
  todayText: {
    color: "#6c63ff",
  },
  hasTaskButton: {
    position: "relative",
  },
  taskDot: {
    position: "absolute",
    bottom: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF5252",
  },

  // View selector modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  viewSelectorContainer: {
    backgroundColor: "#1e1e1e",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    padding: 15,
    width: "100%",
  },
  viewOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  viewOptionText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 15,
  },
})

export default Calendar

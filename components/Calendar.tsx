"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTheme } from "@/contexts/ThemeContext"

const { width } = Dimensions.get("window")

interface CalendarProps {
  onDateSelect: (date: Date) => void
}

interface DateObject {
  day: number
  currentMonth: boolean
  month: number
  year: number
}

interface Task {
  id: string
  task: string
  category: string
  date: string
  timeSlotIds: string[]
  timeSlots: string[]
  timestamp: string
  totalTime: number
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const { colors } = useTheme()
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate())
  const [tasksForMonth, setTasksForMonth] = useState<Task[]>([])
  const [monthAnimation] = useState(new Animated.Value(0))

  // Month names for header
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

  // Day names for header
  const dayNames = ["M", "T", "W", "T", "F", "S", "S"]

  // Load tasks for highlighting dates with events
  useEffect(() => {
    loadTasksForMonth()
  }, [currentYear, currentMonth])

  const loadTasksForMonth = async () => {
    try {
      const storedTasksJson = await AsyncStorage.getItem("tasks")

      if (storedTasksJson) {
        const allTasks = JSON.parse(storedTasksJson)

        // Filter tasks for current month and year
        const filteredTasks = allTasks.filter((task: Task) => {
          const taskDate = new Date(task.date)
          return taskDate.getFullYear() === currentYear && taskDate.getMonth() === currentMonth
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

  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  const getDaysInMonth = (year: number, month: number): number => {
    const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    return daysInMonth[month]
  }

  const getFirstDayOfMonth = (year: number, month: number): number => {
    // Get the day of week (0-6, where 0 is Sunday)
    const dayOfWeek = new Date(year, month, 1).getDay()
    // Convert to 0-6 where 0 is Monday
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1
  }

  const handleDateSelect = (date: number, month = currentMonth, year = currentYear) => {
    setSelectedDate(date)
    if (onDateSelect) {
      // Create a Date object with the selected year, month, and day
      onDateSelect(new Date(year, month, date))
    }
  }

  const navigateToPreviousMonth = () => {
    // Start animation
    Animated.timing(monthAnimation, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // After animation completes, reset and update month
      monthAnimation.setValue(0)

      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    })
  }

  const navigateToNextMonth = () => {
    // Start animation
    Animated.timing(monthAnimation, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // After animation completes, reset and update month
      monthAnimation.setValue(0)

      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    })
  }

  // Check if a date has tasks
  const hasTasksOnDate = (day: number): boolean => {
    return tasksForMonth.some((task) => {
      const taskDate = new Date(task.date)
      return taskDate.getDate() === day
    })
  }

  // Get task category for a specific date
  const getTaskCategoryForDate = (day: number): string | null => {
    const tasksForDay = tasksForMonth.filter((task) => {
      const taskDate = new Date(task.date)
      return taskDate.getDate() === day
    })

    if (tasksForDay.length > 0) {
      return tasksForDay[0].category
    }
    return null
  }

  // Get color based on category
  const getCategoryColor = (category: string | null): string => {
    if (!category) return colors.accent

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

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth

    // Get days from previous month to fill the first row
    const daysInPrevMonth =
      currentMonth === 0 ? getDaysInMonth(currentYear - 1, 11) : getDaysInMonth(currentYear, currentMonth - 1)

    const prevMonthDays: DateObject[] = []
    for (let i = 0; i < firstDay; i++) {
      prevMonthDays.unshift({
        day: daysInPrevMonth - i,
        currentMonth: false,
        month: currentMonth === 0 ? 11 : currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
      })
    }

    // Current month days
    const currentMonthDays: DateObject[] = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      currentMonth: true,
      month: currentMonth,
      year: currentYear,
    }))

    // Next month days to fill the last row
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length
    const nextMonthDays: DateObject[] = []
    const remainingCells = Math.ceil(totalDaysDisplayed / 7) * 7 - totalDaysDisplayed

    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push({
        day: i,
        currentMonth: false,
        month: currentMonth === 11 ? 0 : currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
      })
    }

    // Combine all days
    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]

    // Split into weeks
    const weeks: DateObject[][] = []
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7))
    }

    return (
      <View style={styles.calendarContainer}>
        {/* Days of week header */}
        <View style={styles.weekdaysRow}>
          {dayNames.map((day, index) => (
            <Text key={index} style={[styles.weekdayName, { color: index === 6 ? colors.weekend : colors.text }]}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {weeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={[styles.weekRow, { borderBottomColor: colors.divider }]}>
              {week.map((dateObj, dayIndex) => {
                const isToday = isCurrentMonth && dateObj.day === today.getDate() && dateObj.currentMonth

                const isSelected =
                  dateObj.day === selectedDate && dateObj.month === currentMonth && dateObj.year === currentYear

                const isWeekend = dayIndex === 6 // Sunday
                const hasTask = dateObj.currentMonth && hasTasksOnDate(dateObj.day)
                const taskCategory = dateObj.currentMonth ? getTaskCategoryForDate(dateObj.day) : null

                return (
                  <TouchableOpacity
                    key={`date-${weekIndex}-${dayIndex}`}
                    style={[
                      styles.dateCell,
                      isSelected && [styles.selectedDate, { borderColor: colors.selected }],
                      isToday && styles.todayDate,
                    ]}
                    onPress={() => handleDateSelect(dateObj.day, dateObj.month, dateObj.year)}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        { color: dateObj.currentMonth ? (isWeekend ? colors.weekend : colors.text) : colors.inactive },
                        isSelected && { color: colors.selected, fontWeight: "bold" },
                      ]}
                    >
                      {dateObj.day}
                    </Text>

                    {hasTask && (
                      <View style={[styles.taskIndicator, { backgroundColor: getCategoryColor(taskCategory) }]} />
                    )}

                    {isToday && (
                      <View style={styles.todayIndicator}>
                        <Ionicons name="happy-outline" size={16} color={colors.accent} />
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Month header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.monthYearContainer}>
          <Text style={[styles.monthText, { color: colors.text }]}>{monthNames[currentMonth]}</Text>
        </View>

        <TouchableOpacity onPress={navigateToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Calendar grid with animation */}
      <Animated.View style={[styles.animatedCalendar, { transform: [{ translateX: monthAnimation }] }]}>
        {renderCalendarGrid()}
      </Animated.View>

      {/* Add event button */}
      <View style={styles.addEventContainer}>
        <TouchableOpacity
          style={[styles.addEventButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={() => handleDateSelect(selectedDate)}
        >
          <Text style={[styles.addEventText, { color: colors.textSecondary }]}>
            Add event on {selectedDate} {monthNames[currentMonth]}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={() => handleDateSelect(selectedDate)}
        >
          <Ionicons name="add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
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
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  navButton: {
    padding: 5,
  },
  monthYearContainer: {
    alignItems: "center",
  },
  monthText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  animatedCalendar: {
    flex: 1,
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  weekdayName: {
    width: width / 7,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  calendarGrid: {
    flex: 1,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 70,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  dateCell: {
    width: width / 7,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "500",
  },
  selectedDate: {
    borderWidth: 1,
    borderRadius: 5,
  },
  todayDate: {
    borderRadius: 5,
  },
  taskIndicator: {
    position: "absolute",
    bottom: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  todayIndicator: {
    position: "absolute",
    bottom: 5,
    alignItems: "center",
  },
  addEventContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  addEventButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginRight: 15,
  },
  addEventText: {
    fontSize: 16,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default Calendar

"use client"; // Added use client directive

import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StatusBar, 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { BarChart, PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext"; 

const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode, toggleTheme } = useTheme(); 
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAnalytics, setShowAnalytics] = useState(true); 
  const [dateRangeFilter, setDateRangeFilter] = useState("day");
  const screenWidth = Dimensions.get("window").width;
  const [showAllTasks, setShowAllTasks] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  useEffect(() => {
    loadTasks();
  }, [selectedDay, selectedMonth, selectedYear, selectedCategory, dateRangeFilter]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const storedTasksJson = await AsyncStorage.getItem("tasks");

      if (storedTasksJson) {
        const allTasks = JSON.parse(storedTasksJson);
        let filteredTasks = allTasks;

        filteredTasks = filterTasksByDateRange(allTasks);

        if (selectedCategory !== "All") {
          filteredTasks = filteredTasks.filter((task) => task.category === selectedCategory);
        }

        filteredTasks.sort((a, b) => {
          const dateComparison = new Date(a.date) - new Date(b.date);
          if (dateComparison !== 0) return dateComparison;

         
          const timeA = a.timeSlotIds && a.timeSlotIds.length > 0 ? parseInt(a.timeSlotIds[0].split('-')[1] + a.timeSlotIds[0].split('-')[2]) : 0;
          const timeB = b.timeSlotIds && b.timeSlotIds.length > 0 ? parseInt(b.timeSlotIds[0].split('-')[1] + b.timeSlotIds[0].split('-')[2]) : 0;
          return timeA - timeB;
        });

        setTasks(filteredTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTasksByDateRange = (allTasks) => {

    const today = new Date(Number.parseInt(selectedYear), selectedMonth, Number.parseInt(selectedDay));


    let startDate, endDate;

    if (dateRangeFilter === "day") {
      // Single day
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0); 
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999); 
    } else if (dateRangeFilter === "week") {
      const dayOfWeek = today.getDay(); 
      startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); 
      endDate.setHours(23, 59, 59, 999);
    } else if (dateRangeFilter === "month") {
      // Current month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); 
      endDate.setHours(23, 59, 59, 999);
    } else if (dateRangeFilter === "year") {
      // Current year
      startDate = new Date(today.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
    }

    return allTasks.filter((task) => {
      const taskDate = new Date(task.date);

      return taskDate.getTime() >= startDate.getTime() && taskDate.getTime() <= endDate.getTime();
    });
  };


  const getCategoryColor = (category) => {
    switch (category) {
      case "Work":
        return colors.error // Using color from ThemeContext
      case "Personal":
        return colors.success 
      case "Meeting":
        return colors.info 
      case "School":
        return colors.warning 
      case "Team Time":
        return colors.teamTime || "#03A9F4"
      case "Friends":
        return colors.friends || "#9C27B0"
      default:
        return colors.accent 
    }
  }

  const prepareBarChartData = () => {
    const tagTotals = {}
    tasks.forEach((task) => {
      if (!tagTotals[task.category]) {
        tagTotals[task.category] = 0
      }
      tagTotals[task.category] += task.totalTime
    })

    const labels = Object.keys(tagTotals);
    const data = Object.values(tagTotals);

    return {
      labels: labels,
      datasets: [
        {
          data: data,
          color: (opacity = 1) => {
              const hex = colors.accent.replace('#', '');
              const r = parseInt(hex.substring(0, 2), 16);
              const g = parseInt(hex.substring(2, 4), 16);
              const b = parseInt(hex.substring(4, 6), 16);
              return `rgba(${r}, ${g}, ${b}, ${opacity})`;
          },
          strokeWidth: 2,
        },
      ],
    }
  }

  const preparePieChartData = () => {
    const tagCounts = {}
    tasks.forEach((task) => {
      if (!tagCounts[task.category]) {
        tagCounts[task.category] = 0
      }
      tagCounts[task.category]++
    })


    const allCategories = ["Work", "Personal", "Meeting", "School", "Team Time", "Friends"];
     const pieData = allCategories
       .filter(category => tagCounts[category] > 0) 
       .map((tag) => {
       return {
         name: tag,
         population: tagCounts[tag],
         color: getCategoryColor(tag), 
         legendFontColor: colors.text, 
         legendFontSize: 12,
       }
     });

     if (pieData.length === 0) {
       return [{
         name: "No Tasks",
         population: 1,
         color: colors.inactive, 
         legendFontColor: colors.textSecondary,
         legendFontSize: 12,
       }];
     }

    return pieData;
  }


  const renderCalendarGrid = () => {
    const daysInMonth = new Date(Number.parseInt(selectedYear), Number.parseInt(selectedMonth) + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const completedDays = new Set();
    const tasksForSelectedMonth = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate.getMonth() === selectedMonth && taskDate.getFullYear() === Number.parseInt(selectedYear);
    });

    tasksForSelectedMonth.forEach((task) => {
      const taskDate = new Date(task.date);
      completedDays.add(taskDate.getDate());
    });

    return (
      <View style={styles.calendarGrid}>
        {days.map((day) => (
          <View
            key={day}
            style={[
              styles.calendarDay,
              completedDays.has(day) ? styles.completedDay : styles.emptyDay,
              dateRangeFilter === 'day' && day.toString() === selectedDay ? styles.selectedDayHighlight : null,
              dateRangeFilter === 'day' && day.toString() === selectedDay ? { borderColor: colors.selected, borderWidth: 2 } : null,
            ]}
          >
            <Text style={[
              styles.calendarDayText,
              completedDays.has(day) ? { color: colors.onAccent || "#fff" } : { color: colors.textSecondary } 
            ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('index'); 
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, 
    },
    header: {
      padding: 16,
      backgroundColor: colors.surfaceVariant, 
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      boxShadow: `0 4px 8px ${colors.shadow}`,
      elevation: 5, 
      zIndex: 10,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      color: colors.text, 
      fontSize: 20,
      fontWeight: "bold",
    },
    toggleButton: {
      padding: 8,
    },
    filterSection: {
      padding: 16,
      backgroundColor: colors.background, 
    },
    dateRangeFilter: {
      flexDirection: "row",
      marginBottom: 16,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 4,
    },
    dateFilterButton: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 16,
      flex: 1,
      alignItems: "center",
    },
    activeFilterButton: {
      backgroundColor: colors.accent, // Use theme accent color
    },
    dateFilterText: {
      color: colors.textSecondary, // Use theme secondary text color
      fontWeight: "600",
      fontSize: 13,
    },
    activeDateFilterText: {
      color: colors.onAccent || "#fff", // Text color for accent background
    },
    pickerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    pickerContainer: {
      width: "30%",
    },
    pickerLabel: {
      color: colors.textSecondary, // Use theme secondary text color
      fontSize: 12,
      marginBottom: 8,
      fontWeight: "500",
    },
    pickerWrapper: {
      backgroundColor: colors.surface, // Use theme surface color
      borderRadius: 10,
      height: 40,
      justifyContent: "center",
      overflow: "hidden",
       // Add a subtle border to match index.js inputs/buttons
       borderWidth: 1,
       borderColor: colors.border,
    },
    picker: {
      color: colors.text, // Use theme text color
      height: 40,
    },
    categoryFilterContainer: {
      marginBottom: 8,
    },
    categoryButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    categoryButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.surface, // Use theme surface color
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.surface, // Default border color matching background
    },
    activeCategoryButton: {
      borderColor: colors.selected,
      backgroundColor: colors.surfaceVariant, 
    },
    categoryButtonText: {
      color: colors.textSecondary, // Use theme secondary text color
      fontWeight: "600",
      fontSize: 13,
    },
    activeCategoryText: {
      color: colors.text, 
    },
    categoryDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
      paddingTop: 0, 
    },
    loadingContainer: {
      padding: 40,
      alignItems: "center",
    },
    loadingText: {
      color: colors.textSecondary, 
      marginTop: 12,
      fontSize: 14,
      opacity: 0.7, 
    },
    summaryContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
       marginTop: 10, // Add some space after filter section
    },
    summaryCard: {
      backgroundColor: colors.surfaceVariant, // Use theme surface variant color
      borderRadius: 16,
      padding: 16,
      width: "31%",
      alignItems: "center",
      borderLeftWidth: 3,

      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colors.shadowOpacity,
      shadowRadius: 4,
      elevation: 2,
    },
    tasksCard: {
      borderLeftColor: getCategoryColor("Work"), 
    },
    hoursCard: {
      borderLeftColor: getCategoryColor("Personal"), 
    },
    daysCard: {
      borderLeftColor: getCategoryColor("Meeting"), 
    },
    summaryIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.surface, // Use theme surface color
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    summaryIcon: {
       color: colors.accent, // Use theme accent color for icons
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text, // Use theme text color
      marginBottom: 4,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textSecondary, // Use theme secondary text color
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text, // Use theme text color
      marginTop: 8,
      marginBottom: 16,
    },
    taskListCard: {
      backgroundColor: colors.surfaceVariant, 
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,

      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colors.shadowOpacity,
      shadowRadius: 4,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text, // Use theme text color
    },
    viewAllButton: {
      color: colors.accent, // Use theme accent color
      fontSize: 13,
      fontWeight: "600",
    },
    taskList: {
      gap: 12,
    },
    taskItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface, // Use theme surface color
      borderRadius: 12,
      padding: 12,
    },
    categoryIndicator: {
      width: 4,
      height: "70%",
      borderRadius: 2,
      marginRight: 12,
    },
    taskContent: {
      flex: 1,
    },
    taskText: {
      color: colors.text, // Use theme text color
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 6,
    },
    taskDetailsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    taskDetailItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },
    taskDetailIcon: {
      color: colors.accent, // Use theme accent color for icons
      marginRight: 4,
    },
    taskDetailText: {
      color: colors.textSecondary, // Use theme secondary text color
      fontSize: 12,
    },
    categoryBadge: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
      marginLeft: 8,
    },
    categoryText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "bold",
    },
    chartCard: {
      backgroundColor: colors.surfaceVariant, // Use theme surface variant color
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,

      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colors.shadowOpacity,
      shadowRadius: 4,
      elevation: 2,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text, // Use theme text color
    },
    chart: {
      marginVertical: 8,
      borderRadius: 16,
    },
    calendarMonth: {
      color: colors.accent, // Use theme accent color
      fontSize: 13,
      fontWeight: "600",
    },
    calendarGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      marginVertical: 12,
    },
    calendarDay: {
      width: 36,
      height: 36,
      margin: 3,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyDay: {
      backgroundColor: colors.surface, // Use theme surface color for empty days
    },
    completedDay: {
      backgroundColor: colors.accent, // Use theme accent color for completed days
    },
    selectedDayHighlight: {

    },
    calendarDayText: {
      fontSize: 12,
      fontWeight: "bold",
    },
    emptyDayText: {
      color: colors.textSecondary, // Use theme secondary text color
    },
    completedDayText: {
      color: colors.onAccent || "#fff",
    },
    calendarLegend: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 12,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 8,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    legendDotActive: {
      backgroundColor: colors.accent, // Use theme accent color
    },
    legendDotEmpty: {
      backgroundColor: colors.surface, // Use theme surface color
    },
    legendText: {
      color: colors.textSecondary, // Use theme secondary text color
      fontSize: 12,
    },
    bottomSpace: {
      height: 60,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
       {/* Use StatusBar to match theme */}
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} /> {/* Use theme text color */}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
           {/* Optional: Add theme toggle button here if desired */}

           {/* <TouchableOpacity onPress={toggleTheme} style={styles.toggleButton}>
             <Ionicons name={isDarkMode ? "moon" : "sunny"} size={22} color={colors.text} />
           </TouchableOpacity> */}

           <TouchableOpacity onPress={toggleAnalytics} style={styles.toggleButton}>
             <Ionicons name={showAnalytics ? "eye-off" : "eye"} size={22} color={colors.text} />
           </TouchableOpacity>
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.dateRangeFilter}>
          {["day", "week", "month", "year"].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.dateFilterButton,
                dateRangeFilter === range && styles.activeFilterButton
              ]}
              onPress={() => setDateRangeFilter(range)}
            >
              <Text style={[
                styles.dateFilterText,
                dateRangeFilter === range && styles.activeDateFilterText
              ]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.pickerRow}>
          {/* Day Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Day</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedDay}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedDay(itemValue)}
                dropdownIconColor={colors.textSecondary} // Use theme color for dropdown icon
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <Picker.Item key={day} label={day.toString()} value={day.toString()} color={isDarkMode ? "#fff" : "#000"} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Month Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Month</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedMonth}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                dropdownIconColor={colors.textSecondary} // Use theme color for dropdown icon
              >
                {monthNames.map((month, index) => (
                  <Picker.Item key={month} label={month} value={index} color={isDarkMode ? "#fff" : "#000"} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Year Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Year</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedYear}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedYear(itemValue)}
                dropdownIconColor={colors.textSecondary} // Use theme color for dropdown icon
              >
                {[2023, 2024, 2025, 2026].map((year) => (
                  <Picker.Item key={year} label={year.toString()} value={year.toString()} color={isDarkMode ? "#fff" : "#000"} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.categoryFilterContainer}>
          <Text style={styles.pickerLabel}>Category</Text>
          <View style={styles.categoryButtons}>
             {/* Include all categories from index.js for consistency */}
            {["All", "Work", "Personal", "Meeting", "School", "Team Time", "Friends"].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.activeCategoryButton,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                {category !== "All" && (
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: getCategoryColor(category) } // Use theme category color
                    ]}
                  />
                )}
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.activeCategoryText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} /> {/* Use theme accent color */}
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : (
          <>
            {/* Task Summary Cards */}
            <View style={styles.summaryContainer}>
              <View style={[styles.summaryCard, styles.tasksCard]}>
                <View style={styles.summaryIconContainer}>
                  {/* Use theme accent color for icons */}
                  <Ionicons name="list" size={22} style={styles.summaryIcon} />
                </View>
                <Text style={styles.summaryValue}>{tasks.length}</Text>
                <Text style={styles.summaryLabel}>Tasks</Text>
              </View>

              <View style={[styles.summaryCard, styles.hoursCard]}>
                <View style={styles.summaryIconContainer}>
                   {/* Use theme accent color for icons */}
                  <Ionicons name="time" size={22} style={styles.summaryIcon} />
                </View>
                <Text style={styles.summaryValue}>
                  {tasks.reduce((total, task) => total + task.totalTime, 0).toFixed(1)}h
                </Text>
                <Text style={styles.summaryLabel}>Hours Planned</Text>
              </View>

              <View style={[styles.summaryCard, styles.daysCard]}>
                <View style={styles.summaryIconContainer}>
                   {/* Use theme accent color for icons */}
                  <Ionicons name="calendar" size={22} style={styles.summaryIcon} />
                </View>
                <Text style={styles.summaryValue}>
                  {Array.from(new Set(tasks.map((task) => task.date))).length}
                </Text>
                <Text style={styles.summaryLabel}>Active Days</Text>
              </View>
            </View>

            {/* Recent Tasks */}
            {tasks.length > 0 && (
              <View style={styles.taskListCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Recent Tasks</Text>
                  {tasks.length > 4 && (
                    <TouchableOpacity onPress={() => setShowAllTasks(!showAllTasks)}>
                      <Text style={styles.viewAllButton}>
                        {showAllTasks ? "Show Less" : "View All"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.taskList}>
                  {(showAllTasks ? tasks : tasks.slice(0, 4)).map((task) => (
                    <View key={task.id} style={styles.taskItem}>
                      <View
                        style={[
                          styles.categoryIndicator,
                          { backgroundColor: getCategoryColor(task.category) } // Use theme category color
                        ]}
                      />
                      <View style={styles.taskContent}>
                        <Text style={styles.taskText} numberOfLines={1}>
                          {task.task}
                        </Text>
                        <View style={styles.taskDetailsRow}>
                          <View style={styles.taskDetailItem}>
                            {/* Use theme accent color for icons */}
                            <Ionicons name="calendar-outline" size={14} style={styles.taskDetailIcon} />
                            <Text style={styles.taskDetailText}>
                              {new Date(task.date).toLocaleDateString()}
                            </Text>
                          </View>
                          <View style={styles.taskDetailItem}>
                             {/* Use theme accent color for icons */}
                            <Ionicons name="time-outline" size={14} style={styles.taskDetailIcon} />
                            <Text style={styles.taskDetailText}>
                              {task.timeSlots.join(", ")}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: getCategoryColor(task.category) } // Use theme category color
                        ]}
                      >
                        <Text style={styles.categoryText}>{task.category}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Analytics Section */}
            {showAnalytics && (
              <>
                <Text style={styles.sectionTitle}>Visual Analytics</Text>

                {/* Charts Section */}
                <View style={styles.chartCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.chartTitle}>Hours per Category</Text>
                  </View>
                  <BarChart
                    data={prepareBarChartData()}
                    width={screenWidth - 32} 
                    height={220}
                    yAxisSuffix="h"
                    chartConfig={{
                      backgroundColor: colors.surfaceVariant, 
                      backgroundGradientFrom: colors.surfaceVariant, 
                      backgroundGradientTo: colors.surface, // Use theme color
                      decimalPlaces: 1,

                      color: (opacity = 1) => {
                         const hex = colors.text.replace('#', '');
                         const r = parseInt(hex.substring(0, 2), 16);
                         const g = parseInt(hex.substring(2, 4), 16);
                         const b = parseInt(hex.substring(4, 6), 16);
                         return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                      },

                      labelColor: (opacity = 1) => {
                         const hex = colors.textSecondary.replace('#', '');
                         const r = parseInt(hex.substring(0, 2), 16);
                         const g = parseInt(hex.substring(2, 4), 16);
                         const b = parseInt(hex.substring(4, 6), 16);
                         return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                      },
                      style: {
                        borderRadius: 16,
                      },
                      barPercentage: 0.7,
                      propsForBackgroundLines: {
                        strokeWidth: 1,
                        strokeDasharray: "5, 5",
                        stroke: colors.border, // Use theme border color
                      },
                       propsForLabels: {
                         fontSize: 10, // Adjust font size for labels if needed
                       },
                    }}
                    verticalLabelRotation={0}
                    fromZero
                    showValuesOnTopOfBars
                    style={styles.chart}
                  />
                </View>

                <View style={styles.chartCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.chartTitle}>Task Distribution</Text>
                  </View>
                  <PieChart
                    data={preparePieChartData()}
                    width={screenWidth - 32} // Adjust width for padding
                    height={220}
                    chartConfig={{
                      backgroundColor: colors.surfaceVariant, // Use theme color
                      backgroundGradientFrom: colors.surfaceVariant, // Use theme color
                      backgroundGradientTo: colors.surface, 
                      color: (opacity = 1) => {
                         const hex = colors.text.replace('#', '');
                         const r = parseInt(hex.substring(0, 2), 16);
                         const g = parseInt(hex.substring(2, 4), 16);
                         const b = parseInt(hex.substring(4, 6), 16);
                         return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                      },
                    }}
                    accessor="population"
                    backgroundColor="transparent" // Keep transparent if the card background is sufficient
                    paddingLeft="15"
                    absolute
                    style={styles.chart}
                  />
                </View>

                {/* Activity Calendar */}
                <View style={styles.chartCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.chartTitle}>Activity Calendar</Text>
                    <Text style={styles.calendarMonth}>
                      {monthNames[selectedMonth]} {selectedYear}
                    </Text>
                  </View>
                  {renderCalendarGrid()}
                  <View style={styles.calendarLegend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, styles.legendDotActive]} /> {/* Use theme legend dot active style */}
                      <Text style={styles.legendText}>Active Day</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, styles.legendDotEmpty]} /> {/* Use theme legend dot empty style */}
                      <Text style={styles.legendText}>No Activity</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Bottom spacing */}
            <View style={styles.bottomSpace} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};


export default AnalyticsScreen;
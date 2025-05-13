
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { BarChart, PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

const AnalyticsScreen = () => {
  const navigation = useNavigation();
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

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const storedTasksJson = await AsyncStorage.getItem("tasks");

      if (storedTasksJson) {
        const allTasks = JSON.parse(storedTasksJson);
        let filteredTasks = allTasks;

        // Apply date range filter
        filteredTasks = filterTasksByDateRange(allTasks);

        // Apply category filter
        if (selectedCategory !== "All") {
          filteredTasks = filteredTasks.filter((task) => task.category === selectedCategory);
        }

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
    const today = new Date(selectedYear, selectedMonth, Number.parseInt(selectedDay));

    // Set start and end dates based on filter
    let startDate, endDate;

    if (dateRangeFilter === "day") {
      // Single day
      startDate = new Date(today);
      endDate = new Date(today);
    } else if (dateRangeFilter === "week") {
      // Current week
      const dayOfWeek = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek); // Start of week (Sunday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
    } else if (dateRangeFilter === "month") {
      // Current month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of month
    } else if (dateRangeFilter === "year") {
      // Current year
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
    }

    // Convert to date strings for comparison
    const startDateStr = startDate.toDateString();
    const endDateStr = endDate.toDateString();

    // Filter tasks that fall within range
    return allTasks.filter((task) => {
      const taskDate = new Date(task.date);
      return taskDate >= new Date(startDateStr) && taskDate <= new Date(endDateStr);
    });
  };

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
          color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`, // Purple
          strokeWidth: 2,
        },
      ],
    }
  }
  // Prepare chart data - Removed dummy data logic
  const preparePieChartData = () => {
    const tagCounts = {}
    tasks.forEach((task) => {
      if (!tagCounts[task.category]) {
        tagCounts[task.category] = 0
      }
      tagCounts[task.category]++
    })

    return Object.keys(tagCounts).map((tag) => {
      let color = "#999999" // Default color
      if (tag === "Work") color = "#FF6B6B" // Slightly brighter Red
      if (tag === "Personal") color = "#6BCB77" // Slightly brighter Green
      if (tag === "Meeting") color = "#4D96FF" // Slightly brighter Blue


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
    const daysInMonth = new Date(Number.parseInt(selectedYear), Number.parseInt(selectedMonth) + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Get completed days from tasks
    const completedDays = new Set();

    // Add each day that has a task
    tasks.forEach((task) => {
      const taskDate = new Date(task.date);
      if (
        taskDate.getMonth() === Number.parseInt(selectedMonth) &&
        taskDate.getFullYear() === Number.parseInt(selectedYear)
      ) {
        completedDays.add(taskDate.getDate());
      }
    });

    return (
      <View style={styles.calendarGrid}>
        {days.map((day) => (
          <View
            key={day}
            style={[
              styles.calendarDay,
              completedDays.has(day) ? styles.completedDay : styles.emptyDay,
              day.toString() === selectedDay ? styles.selectedDay : null
            ]}
          >
            <Text style={[
              styles.calendarDayText,
              completedDays.has(day) ? styles.completedDayText : styles.emptyDayText
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
    navigation.goBack();
  };

  // Category color helper
  const getCategoryColor = (category) => {
    switch(category) {
      case "Work": return "#FF6384";
      case "Personal": return "#4BC0C0";
      case "Meeting": return "#36A2EB";
      default: return "#FFCE56";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <TouchableOpacity onPress={toggleAnalytics} style={styles.toggleButton}>
            <Ionicons name={showAnalytics ? "eye-off" : "eye"} size={22} color="white" />
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
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Day</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedDay}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedDay(itemValue)}
                dropdownIconColor="white"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <Picker.Item key={day} label={day.toString()} value={day.toString()} color="#000" />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Month</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedMonth}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                dropdownIconColor="white"
              >
                {monthNames.map((month, index) => (
                  <Picker.Item key={month} label={month} value={index} color="#000" />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Year</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedYear}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedYear(itemValue)}
                dropdownIconColor="white"
              >
                {[2023, 2024, 2025, 2026].map((year) => (
                  <Picker.Item key={year} label={year.toString()} value={year.toString()} color="#000" />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        
        <View style={styles.categoryFilterContainer}>
          <Text style={styles.pickerLabel}>Category</Text>
          <View style={styles.categoryButtons}>
            {["All", "Work", "Personal", "Meeting"].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.activeCategoryButton,
                  selectedCategory === category && { borderColor: category !== "All" ? getCategoryColor(category) : "#9b87f5" }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                {category !== "All" && (
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: getCategoryColor(category) }
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
            <ActivityIndicator size="large" color="#9b87f5" />
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : (
          <>
            {/* Task Summary Cards */}
            <View style={styles.summaryContainer}>
              <View style={[styles.summaryCard, styles.tasksCard]}>
                <View style={styles.summaryIconContainer}>
                  <Ionicons name="list" size={22} color="#9b87f5" />
                </View>
                <Text style={styles.summaryValue}>{tasks.length}</Text>
                <Text style={styles.summaryLabel}>Tasks</Text>
              </View>
              
              <View style={[styles.summaryCard, styles.hoursCard]}>
                <View style={styles.summaryIconContainer}>
                  <Ionicons name="time" size={22} color="#9b87f5" />
                </View>
                <Text style={styles.summaryValue}>
                  {tasks.reduce((total, task) => total + task.totalTime, 0).toFixed(1)}h
                </Text>
                <Text style={styles.summaryLabel}>Hours Planned</Text>
              </View>
              
              <View style={[styles.summaryCard, styles.daysCard]}>
                <View style={styles.summaryIconContainer}>
                  <Ionicons name="calendar" size={22} color="#9b87f5" />
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
                          { backgroundColor: getCategoryColor(task.category) }
                        ]} 
                      />
                      <View style={styles.taskContent}>
                        <Text style={styles.taskText} numberOfLines={1}>
                          {task.task}
                        </Text>
                        <View style={styles.taskDetailsRow}>
                          <View style={styles.taskDetailItem}>
                            <Ionicons name="calendar-outline" size={14} color="#9b87f5" style={styles.taskDetailIcon} />
                            <Text style={styles.taskDetailText}>
                              {new Date(task.date).toLocaleDateString()}
                            </Text>
                          </View>
                          <View style={styles.taskDetailItem}>
                            <Ionicons name="time-outline" size={14} color="#9b87f5" style={styles.taskDetailIcon} />
                            <Text style={styles.taskDetailText}>
                              {task.timeSlots.join(", ")}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: getCategoryColor(task.category) }
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
                    width={screenWidth - 40}
                    height={220}
                    yAxisSuffix="h"
                    chartConfig={{
                      backgroundColor: "#1e1e1e",
                      backgroundGradientFrom: "#252536",
                      backgroundGradientTo: "#3F3F63",
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      barPercentage: 0.7,
                      propsForBackgroundLines: {
                        strokeWidth: 1,
                        strokeDasharray: "5, 5",
                        stroke: "rgba(255, 255, 255, 0.2)",
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
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={{
                      backgroundColor: "#1e1e1e",
                      backgroundGradientFrom: "#252536",
                      backgroundGradientTo: "#3F3F63",
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
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
                      <View style={[styles.legendDot, { backgroundColor: "#9b87f5" }]} />
                      <Text style={styles.legendText}>Active Day</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: "#2A2A3F" }]} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191925",
  },
  header: {
    padding: 16,
    backgroundColor: "#252536",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  toggleButton: {
    padding: 8,
  },
  filterSection: {
    padding: 16,
    backgroundColor: "#191925",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  dateRangeFilter: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#252536",
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
    backgroundColor: "#9b87f5",
  },
  dateFilterText: {
    color: "#929292",
    fontWeight: "600",
    fontSize: 13,
  },
  activeDateFilterText: {
    color: "#fff",
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
    color: "#929292",
    fontSize: 12,
    marginBottom: 8,
    fontWeight: "500",
  },
  pickerWrapper: {
    backgroundColor: "#252536",
    borderRadius: 10,
    height: 40,
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    color: "white",
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
    backgroundColor: "#252536",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeCategoryButton: {
    backgroundColor: "#252536",
    borderWidth: 1,
  },
  categoryButtonText: {
    color: "#929292",
    fontWeight: "600",
    fontSize: 13,
  },
  activeCategoryText: {
    color: "#fff",
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
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 14,
    opacity: 0.7,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#252536",
    borderRadius: 16,
    padding: 16,
    width: "31%",
    alignItems: "center",
    borderLeftWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tasksCard: {
    borderLeftColor: "#FF6384", // Pink
  },
  hoursCard: {
    borderLeftColor: "#4BC0C0", // Teal
  },
  daysCard: {
    borderLeftColor: "#36A2EB", // Blue
  },
  summaryIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2F2F45",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#929292",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
    marginBottom: 16,
  },
  taskListCard: {
    backgroundColor: "#252536",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    color: "#fff",
  },
  viewAllButton: {
    color: "#9b87f5",
    fontSize: 13,
    fontWeight: "600",
  },
  taskList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2F2F45",
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
    color: "#fff",
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
    marginRight: 4,
  },
  taskDetailText: {
    color: "#929292",
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
    backgroundColor: "#252536",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  calendarMonth: {
    color: "#9b87f5",
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
    backgroundColor: "#2A2A3F",
  },
  completedDay: {
    backgroundColor: "#9b87f5",
  },
  selectedDay: {
    borderWidth: 2,
    borderColor: "#fff",
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyDayText: {
    color: "#929292",
  },
  completedDayText: {
    color: "#fff",
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
  legendText: {
    color: "#929292",
    fontSize: 12,
  },
  bottomSpace: {
    height: 60,
  },
});

export default AnalyticsScreen;

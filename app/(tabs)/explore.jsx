import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Dummy data for analytics
const dummyTasks = [
  {
    id: '1',
    task: 'Work',
    tag: 'Work',
    color: '#FF0000',
    selectedBoxes: '6, 7',
    totalTime: 1,
    timestamp: '3/23/2025, 6:10:04 PM'
  },
  {
    id: '2',
    task: 'Team meeting',
    tag: 'Meeting',
    color: '#0000FF',
    selectedBoxes: '10, 11, 12',
    totalTime: 2,
    timestamp: '3/23/2025, 10:15:22 AM'
  },
  {
    id: '3',
    task: 'Gym workout',
    tag: 'Personal',
    color: '#00FF00',
    selectedBoxes: '17, 18',
    totalTime: 1.5,
    timestamp: '3/23/2025, 5:30:45 PM'
  },
  {
    id: '4',
    task: 'Gym ',
    tag: 'guu',
    color: 'pink',
    selectedBoxes: '17',
    totalTime: 2,
    timestamp: '3/23/2025, 6:45:30 PM'
  }
];

const AnalyticsScreen = ({ navigation }) => {
  const [selectedDay, setSelectedDay] = useState('23');
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tasks, setTasks] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const screenWidth = Dimensions.get('window').width;

  // Filter tasks based on selected category
  useEffect(() => {
    if (selectedCategory === 'All') {
      setTasks(dummyTasks);
    } else {
      setTasks(dummyTasks.filter(task => task.tag === selectedCategory));
    }
  }, [selectedCategory]);

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { flex: 2 }]}>Task</Text>
      <Text style={styles.headerCell}>Tag</Text>
      <Text style={styles.headerCell}>Color</Text>
      <Text style={[styles.headerCell, { flex: 2 }]}>Selected Boxes</Text>
      <Text style={styles.headerCell}>Total Time</Text>
      <Text style={[styles.headerCell, { flex: 2 }]}>Timestamp</Text>
    </View>
  );

  const renderTableRow = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, { flex: 2 }]}>{item.task}</Text>
      <Text style={styles.tableCell}>{item.tag}</Text>
      <View style={[styles.colorCell, { backgroundColor: item.color }]} />
      <Text style={[styles.tableCell, { flex: 2 }]}>{item.selectedBoxes}</Text>
      <Text style={styles.tableCell}>{item.totalTime}</Text>
      <Text style={[styles.tableCell, { flex: 2 }]}>{item.timestamp}</Text>
    </View>
  );

  // Prepare chart data
  const prepareBarChartData = () => {
    // Group tasks by tag and sum total time
    const tagTotals = {};
    tasks.forEach(task => {
      if (!tagTotals[task.tag]) {
        tagTotals[task.tag] = 0;
      }
      tagTotals[task.tag] += task.totalTime;
    });

    // If no tasks, show dummy data
    if (Object.keys(tagTotals).length === 0) {
      return {
        labels: ['Work'],
        datasets: [
          {
            data: [1],
            colors: [() => '#FF0000']
          }
        ]
      };
    }

    return {
      labels: Object.keys(tagTotals),
      datasets: [
        {
          data: Object.values(tagTotals),
          colors: Object.keys(tagTotals).map(tag => {
            if (tag === 'Work') return () => '#FF0000';
            if (tag === 'Personal') return () => '#00FF00';
            if (tag === 'Meeting') return () => '#0000FF';
            if (tag === 'guu') return () => 'pink';
            return () => '#999999';
          })
        }
      ]
    };
  };

  const preparePieChartData = () => {
    // Count tasks by tag
    const tagCounts = {};
    tasks.forEach(task => {
      if (!tagCounts[task.tag]) {
        tagCounts[task.tag] = 0;
      }
      tagCounts[task.tag]++;
    });

    // If no tasks, show dummy data
    if (Object.keys(tagCounts).length === 0) {
      return [
        {
          name: 'Work',
          count: 1,
          color: '#FF0000',
          legendFontColor: '#333333',
          legendFontSize: 12
        }
      ];
    }

    // Convert to pie chart format
    return Object.keys(tagCounts).map(tag => {
      let color = '#999999';
      if (tag === 'Work') color = '#FF0000';
      if (tag === 'Personal') color = '#00FF00';
      if (tag === 'Meeting') color = '#0000FF';
      if (tag === 'guu') color = 'pink';

      return {
        name: tag,
        count: tagCounts[tag],
        color: color,
        legendFontColor: '#333333',
        legendFontSize: 12
      };
    });
  };

  // Task completion calendar
  const renderCalendarGrid = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    
    // Get completed days from tasks
    const completedDays = new Set();
    tasks.forEach(task => {
      const boxNumbers = task.selectedBoxes.split(', ').map(num => parseInt(num));
      boxNumbers.forEach(num => completedDays.add(num));
    });

    // If no completed days, use dummy data
    if (completedDays.size === 0) {
      completedDays.add(6);
      completedDays.add(7);
    }

    return (
      <View style={styles.calendarGrid}>
        {days.map(day => (
          <View 
            key={day} 
            style={[
              styles.calendarDay, 
              completedDays.has(day) ? styles.completedDay : styles.emptyDay
            ]}
          />
        ))}
      </View>
    );
  };

  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={24} color="white" />
          </View>
          <Text style={styles.welcomeText}>Welcome</Text>
        </View>

        <View style={styles.filterContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedDay}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedDay(itemValue)}
            >
              <Picker.Item label="23" value="23" />
              {[...Array(31)].map((_, i) => (
                <Picker.Item key={i+1} label={`${i+1}`} value={`${i+1}`} />
              ))}
            </Picker>
          </View>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedMonth}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            >
              <Picker.Item label="March" value="March" />
              {['January', 'February', 'April', 'May', 'June', 'July', 
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
            >
              <Picker.Item label="2025" value="2025" />
              {[2023, 2024, 2026, 2027, 2028].map(year => (
                <Picker.Item key={year} label={`${year}`} value={`${year}`} />
              ))}
            </Picker>
          </View>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            >
              <Picker.Item label="All" value="All" />
              <Picker.Item label="Work" value="Work" />
              <Picker.Item label="Personal" value="Personal" />
              <Picker.Item label="Meeting" value="Meeting" />
            </Picker>
          </View>
          
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.hideButton} onPress={toggleAnalytics}>
            <Text style={styles.buttonText}>
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.buttonText}>LogOut</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Tasks Table */}
        <View style={styles.tableContainer}>
          {renderTableHeader()}
          <FlatList
            data={tasks.length > 0 ? tasks : dummyTasks.slice(0, 1)}
            renderItem={renderTableRow}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Analytics Section */}
        {showAnalytics && (
          <>
            {/* Analytics Title */}
            <Text style={styles.analyticsTitle}>Analytics</Text>

            {/* Charts Section */}
            <View style={styles.chartsContainer}>
              {/* Time Spent per Tag */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Total Time Spent per Tag</Text>
                <BarChart
                  data={prepareBarChartData()}
                  width={screenWidth * 0.45}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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

              {/* Task Distribution by Tag */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Task Distribution by Tag</Text>
                <PieChart
                  data={preparePieChartData().map(item => ({
                    ...item,
                    population: item.count,
                  }))}
                  width={screenWidth * 0.45}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  absolute
                  style={styles.chart}
                />
              </View>
            </View>

            {/* Task Completion Over Time */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Task Completion Over Time</Text>
              {renderCalendarGrid()}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6c63ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  welcomeText: {
    color: '#333333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginRight: 8,
    marginBottom: 8,
    height: 40,
    width: 100,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  picker: {
    height: 40,
    width: 100,
  },
  searchButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 8,
  },
  hideButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 8,
  },
  logoutButton: {
    backgroundColor: '#ff4d4f',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  tableContainer: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#888888',
    padding: 10,
  },
  headerCell: {
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    padding: 10,
  },
  tableCell: {
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  colorCell: {
    flex: 1,
    height: 20,
    marginHorizontal: 10,
    borderRadius: 4,
  },
  analyticsTitle: {
    color: '#333333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chartTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDay: {
    width: 30,
    height: 30,
    margin: 3,
    borderRadius: 4,
  },
  emptyDay: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  completedDay: {
    backgroundColor: '#FF0000',
  },
});

export default AnalyticsScreen;
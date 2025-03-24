import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateDropdown from './DateDropdown';
import { useRouter } from 'expo-router';

const Header = ({ 
  selectedDate, 
  selectedMonth, 
  selectedYear,
  onDateChange,
  onMonthChange,
  onYearChange
}) => {
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 380;

  const dateOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const yearOptions = Array.from({ length: 10 }, (_, i) => 2020 + i);

  const closeAllDropdowns = () => {
    setShowDateDropdown(false);
    setShowMonthDropdown(false);
    setShowYearDropdown(false);
  };

  const router = useRouter();

  const navigateToAnalytics = () => {
    router.push('/explore');
  };

  return (
    <View style={[styles.header, isSmallScreen && styles.smallHeader]}>
      {/* Left Section */}
      <View style={[styles.headerLeft, isSmallScreen && styles.smallHeaderLeft]}>
        <TouchableOpacity 
          style={[styles.dropdown, isSmallScreen && styles.smallDropdown]} 
          onPress={() => {
            closeAllDropdowns();
            setShowDateDropdown(!showDateDropdown);
          }}
        >
          <Text style={styles.dropdownText}>{selectedDate}</Text>
          <Ionicons name="chevron-down" size={16} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.dropdown, isSmallScreen && styles.smallDropdown]}
          onPress={() => {
            closeAllDropdowns();
            setShowMonthDropdown(!showMonthDropdown);
          }}
        >
          <Text style={styles.dropdownText}>{selectedMonth}</Text>
          <Ionicons name="chevron-down" size={16} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.dropdown, isSmallScreen && styles.smallDropdown]}
          onPress={() => {
            closeAllDropdowns();
            setShowYearDropdown(!showYearDropdown);
          }}
        >
          <Text style={styles.dropdownText}>{selectedYear}</Text>
          <Ionicons name="chevron-down" size={16} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.searchButton, isSmallScreen && styles.smallButton]}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Right Section */}
      <View style={[styles.headerRight, isSmallScreen && styles.smallHeaderRight]}>
        <TouchableOpacity 
          style={[styles.analyticsButton, isSmallScreen && styles.smallButton]}
          onPress={navigateToAnalytics}
        >
          <Text style={styles.analyticsButtonText}>
            {isSmallScreen ? 'Analytics' : 'View Analytics'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.avatarButton}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Date Dropdown */}
      <DateDropdown
        visible={showDateDropdown}
        options={dateOptions}
        selectedValue={selectedDate}
        onSelect={(value) => {
          onDateChange(value);
          setShowDateDropdown(false);
        }}
        onClose={() => setShowDateDropdown(false)}
        position={{ top: isSmallScreen ? 120 : 60, left: 10 }}
      />
      
      {/* Month Dropdown */}
      <DateDropdown
        visible={showMonthDropdown}
        options={monthOptions}
        selectedValue={selectedMonth}
        onSelect={(value) => {
          onMonthChange(value);
          setShowMonthDropdown(false);
        }}
        onClose={() => setShowMonthDropdown(false)}
        position={{ top: isSmallScreen ? 120 : 60, left: isSmallScreen ? 50 : 70 }}
      />
      
      {/* Year Dropdown */}
      <DateDropdown
        visible={showYearDropdown}
        options={yearOptions}
        selectedValue={selectedYear}
        onSelect={(value) => {
          onYearChange(value);
          setShowYearDropdown(false);
        }}
        onClose={() => setShowYearDropdown(false)}
        position={{ top: isSmallScreen ? 120 : 60, left: isSmallScreen ? 100 : 140 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'Auto', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 1,
  },
  smallHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    flexWrap: 'wrap',
  },
  smallHeaderLeft: {
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallHeaderRight: {
    width: '100%',
    justifyContent: 'space-between',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 5,
    backgroundColor: '#fff',
    width: 'Auto', // Adjust width based on screen size
  },
  smallDropdown: {
    paddingHorizontal: 5,
    marginRight: 4,
    width: 'Auto', // Adjust width for small screens
  },
  dropdownText: {
    marginRight: 5,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#6c63ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    width: 'Auto', // Adjust width based on screen size
  },
  smallButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: 'Auto', // Adjust width for small screens
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  analyticsButton: {
    backgroundColor: '#000',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 10,
    width: 'Auto', // Adjust width based on screen size
  },
  analyticsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
});

export default Header;
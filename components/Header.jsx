import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  Modal,
  Dimensions
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
    // This will navigate to the 'explore' page in the app folder (app/explore.js)
    router.push('/explore');
  };


  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
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
        
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.analyticsButton}
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
        position={{ top: 60, left: 10 }}
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
        position={{ top: 60, left: isSmallScreen ? 50 : 70 }}
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
        position={{ top: 60, left: isSmallScreen ? 100 : 140 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    flexWrap: 'wrap',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  smallDropdown: {
    paddingHorizontal: 5,
    marginRight: 4,
  },
  dropdownText: {
    marginRight: 5,
  },
  searchButton: {
    backgroundColor: '#6c63ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  analyticsButton: {
    backgroundColor: '#000',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  analyticsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
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
import { useRouter } from 'expo-router';
import { useTheme } from "@/contexts/ThemeContext"; 


const Header = ({
  selectedDate,
  selectedMonth,
  selectedYear,
  onDateChange,
  onMonthChange,
  onYearChange
}) => {
  const { colors, isDarkMode } = useTheme(); 
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
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);


  const closeAllDropdowns = () => {
    setShowDateDropdown(false);
    setShowMonthDropdown(false);
    setShowYearDropdown(false);
  };

  const router = useRouter();

  const navigateToAnalytics = () => {
    router.push('/explore');
  };

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row', 
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15, 
      paddingVertical: 10,
      backgroundColor: colors.background, 
      borderBottomWidth: 1,
      borderBottomColor: colors.border, 
      zIndex: 1,
      sboxShadow: `0 2px 3px ${colors.shadow}`,
      elevation: 3,
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
      flex: 1, 
    },
    smallHeaderLeft: {
      width: '100%',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 2, 
      marginLeft: 10, 
    },
    smallHeaderRight: {
      width: '100%',
      justifyContent: 'space-between',
      marginLeft: 0, 
      marginTop: 5, 
    },
    dropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border, 
      borderRadius: 6, 
      paddingHorizontal: 10,
      paddingVertical: 6, 
      marginRight: 8,
      marginBottom: 5, 
      backgroundColor: colors.surface, 
       minWidth: 80, 
       justifyContent: 'space-between', 
    },
    smallDropdown: {
      paddingHorizontal: 8, 
      marginRight: 4, 
      minWidth: 70, 
    },
    dropdownText: {
      marginRight: 5,
      fontSize: 14,
      color: colors.text, 
    },
    dropdownIcon: {
      color: colors.textSecondary, 
    },
    button: { 
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 6, 
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 80, 
    },
    smallButton: { 
      paddingHorizontal: 10,
      paddingVertical: 6,
      minWidth: 70,
    },
    searchButton: {
      backgroundColor: colors.accent, 
      marginRight: 8, 
    },
     searchButtonText: {
       color: colors.onAccent || '#fff', 
       fontWeight: 'bold',
       fontSize: 14,
     },
    analyticsButton: {
      backgroundColor: colors.accent,
      marginRight: 10, 
    },
    analyticsButtonText: {
      color: colors.onAccent || '#fff', 
      fontWeight: 'bold',
      fontSize: 14,
    },
    avatarButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.surfaceVariant, 
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 20,
    },
     dropdownOverlay: { 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0, 
     },
  });


  return (
    <View style={styles.header}>
       {/* Overlay to close dropdowns when tapping outside */}
      {(showDateDropdown || showMonthDropdown || showYearDropdown) && (
        <TouchableOpacity style={styles.dropdownOverlay} onPress={closeAllDropdowns} activeOpacity={1} />
      )}

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
          <Ionicons name="chevron-down" size={16} style={styles.dropdownIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dropdown, isSmallScreen && styles.smallDropdown]}
          onPress={() => {
            closeAllDropdowns();
            setShowMonthDropdown(!showMonthDropdown);
          }}
        >
          <Text style={styles.dropdownText}>{monthOptions[selectedMonth]}</Text>{/* Display month name */}
          <Ionicons name="chevron-down" size={16} style={styles.dropdownIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dropdown, isSmallScreen && styles.smallDropdown]}
          onPress={() => {
            closeAllDropdowns();
            setShowYearDropdown(!showYearDropdown);
          }}
        >
          <Text style={styles.dropdownText}>{selectedYear}</Text>
          <Ionicons name="chevron-down" size={16} style={styles.dropdownIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.searchButton, isSmallScreen && styles.smallButton]}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Right Section */}
      <View style={[styles.headerRight, isSmallScreen && styles.smallHeaderRight]}>
        <TouchableOpacity
          style={[styles.button, styles.analyticsButton, isSmallScreen && styles.smallButton]}
          onPress={navigateToAnalytics}
        >
          <Text style={styles.analyticsButtonText}>
            Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarButton}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text> {/* Emoji or replace with Image/Icon */}
          </View>
        </TouchableOpacity>
      </View>

      {/* Dropdowns (Ensure DateDropdown component is styled to match theme) */}
      {/* Note: Positioning of absolute dropdowns relative to the header might need adjustment based on your layout */}
      {/* Date Dropdown */}
      {/* <DateDropdown
        visible={showDateDropdown}
        options={dateOptions}
        selectedValue={selectedDate}
        onSelect={(value) => {
          onDateChange(value);
          setShowDateDropdown(false);
        }}
        onClose={() => setShowDateDropdown(false)}
        // Example positioning relative to the header/screen
        position={{ top: isSmallScreen ? 120 : 60, left: 10 }}
      /> */}

      {/* Month Dropdown */}
      {/* <DateDropdown
        visible={showMonthDropdown}
        options={monthOptions}
        selectedValue={monthOptions[selectedMonth]} // Pass the string value
        onSelect={(value) => {
          onMonthChange(monthOptions.indexOf(value)); // Pass back the index
          setShowMonthDropdown(false);
        }}
        onClose={() => setShowMonthDropdown(false)}
         // Example positioning relative to the header/screen
        position={{ top: isSmallScreen ? 120 : 60, left: isSmallScreen ? 50 : 70 }}
      /> */}

      {/* Year Dropdown */}
      {/* <DateDropdown
        visible={showYearDropdown}
        options={yearOptions}
        selectedValue={selectedYear}
        onSelect={(value) => {
          onYearChange(value);
          setShowYearDrgoopdown(false);
        }}
        onClose={() => setShowYearDropdown(false)}
         // Example positioning relative to the header/screen
        position={{ top: isSmallScreen ? 120 : 60, left: isSmallScreen ? 100 : 140 }}
      /> */}

       {showDateDropdown && <Text style={{color: colors.text}}>Date Dropdown Placeholder</Text>}
       {showMonthDropdown && <Text style={{color: colors.text}}>Month Dropdown Placeholder</Text>}
       {showYearDropdown && <Text style={{color: colors.text}}>Year Dropdown Placeholder</Text>}


    </View>
  );
};

export default Header;
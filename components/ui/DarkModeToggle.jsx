import React from 'react';
import { Switch, Platform, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext'; 

export default function DarkModeToggle({ isEnabled, toggleSwitch }) {
    const { colors } = useTheme(); 

    return (
        <Switch
            trackColor={{ false: "#767577", true: colors.primary }} 
            thumbColor={Platform.OS === "android" ? colors.text : ""} 
            ios_backgroundColor="#3e3e3e" 
            onValueChange={toggleSwitch}
            value={isEnabled} 
            style={styles.switch} 
        />
    );
}

const styles = StyleSheet.create({
    switch: {
        
    },
});
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions, 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router"; 
import { useState } from "react"; 
import DarkModeToggle from "./ui/DarkModeToggle"; 

const { width } = Dimensions.get("window");
const MENU_WIDTH = width * 0.7; 

export default function ProfileMenu({ onClose, userData, toggleTheme }) {
  const { colors } = useTheme();
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(colors.isDark); 

  const handleDarkModeToggle = () => {
    toggleTheme(); 
    setIsDarkModeEnabled(!isDarkModeEnabled); 
  };

  const handleEditProfile = () => {
    console.log("Navigate to Edit Profile");
    onClose(); 
    // router.push("/(tabs)/profile/edit"); 
  };

  const handleSettings = () => {
    console.log("Navigate to Settings");
    onClose();
    // router.push("/(tabs)/settings"); // Example
  };

  const handleHelp = () => {
    console.log("Navigate to Help & Support");
    onClose();
    // router.push("/(tabs)/help"); // Example
  };

  const handleLogout = () => {
    console.log("Logging out...");
    onClose();
  };

  return (
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onClose} 
    >
      <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
         
          {/* Profile Info Section */}
          <View style={styles.profileInfo}>
            <Image source={{ uri: userData.avatarUri }} style={styles.profileAvatar} />
            <View style={styles.textInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{userData.name}</Text>
              <Text style={[styles.profileEmail, { color: colors.text }]}>{userData.email}</Text>
            </View>
          </View>

          {/* Menu Items */}
          <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
            <Ionicons name="person-outline" size={24} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Settings & Privacy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
            <Ionicons name="help-circle-outline" size={24} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Help & Support</Text>
          </TouchableOpacity>

          {/* Dark Mode Toggle Item */}
          <View style={styles.menuItem}>
            <Ionicons name="moon-outline" size={24} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Dark Mode</Text>
            <DarkModeToggle
                 isEnabled={colors.isDark}
                 toggleSwitch={handleDarkModeToggle}
                 trackColor={{ false: "#767577", true: colors.primary }}
                 thumbColor={colors.text}
                 ios_backgroundColor="#3e3e3e"
                 style={styles.darkModeToggle}
             />
          </View>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="red" />
            <Text style={styles.logoutItemText}>Logout</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    justifyContent: "flex-start", 
    alignItems: "flex-end", 
    paddingTop: 90, 
  },
  menuContainer: {
    width: MENU_WIDTH, 
    height: "55%", 
    borderTopLeftRadius: 10, 
    borderBottomLeftRadius: 10, 
    paddingVertical: 10,
    shadowColor: "#000", 
    shadowOffset: {
      width: -2, 
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc", 
    marginBottom: 10,
  },
  profileAvatar: {
    backgroundColor: "#ccc", 
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textInfo: {
    flex: 1, 
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  profileEmail: {
    fontSize: 14,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1, 
  },
  darkModeToggle: {
  },
  logoutItem: {
    marginTop: 20, 
    borderTopWidth: 1, 
    borderTopColor: "#ccc",
  },
  logoutItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: "red", 
    fontWeight: "bold",
  },
});
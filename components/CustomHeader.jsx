import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image, 
  Modal, 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { useState } from "react";
import ProfileMenu from "./ProfileMenu"; 

export default function CustomHeader({ navigation }) {
  const { colors, toggleTheme } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false); 
  const [selectedView, setSelectedView] = useState("calendar"); 

  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  const goToAnalytics = () => {
    router.push("/(tabs)/explore");
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const toggleProfileMenu = () => {
    setProfileMenuVisible(!profileMenuVisible);
  };

  const closeProfileMenu = () => {
    setProfileMenuVisible(false);
  };

  const userData = {
    name: "Crazy moon",
    email: "brookteklebrhan123@gmail.com",
    avatarUri: "", 
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.headerLeft}>

        <TouchableOpacity onPress={toggleSidebar}>
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Calendar</Text>
      </View>

      <View style={styles.headerRight}>

        <TouchableOpacity style={styles.headerButton} onPress={goToAnalytics}>
          <Ionicons name="analytics" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Avatar Button */}
        <TouchableOpacity style={styles.avatarButton} onPress={toggleProfileMenu}>
          <Image
            source={{ uri: userData.avatarUri }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Menu Modal */}
      <Modal
        animationType="fade" 
        transparent={true}
        visible={profileMenuVisible}
        onRequestClose={closeProfileMenu} 
      >
        <ProfileMenu
          onClose={closeProfileMenu}
          userData={userData}
          toggleTheme={toggleTheme} 
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 40, 
    paddingHorizontal: 15, 
    height: 90, 
    borderBottomWidth: 1,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 15,
  },
  avatarButton: {
    marginLeft: 15,
    width: 40, 
    height: 40,
    borderRadius: 20, 
    overflow: "hidden", 
  },
  avatar: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ccc", 
  },

});
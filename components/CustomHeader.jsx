import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/contexts/ThemeContext"
import { router } from "expo-router"
import Calendar from "./Calendar"
import { useState } from "react"


export default function CustomHeader({ navigation }) {
  const { colors, toggleTheme } = useTheme()
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [selectedView, setSelectedView] = useState("calendar") 



  const goToAnalytics = () => {
    router.push("/(tabs)/explore")
  }

    const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }


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
        
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push("")}>
  <Text style={[styles.headerButtonText, { color: colors.text }]}>C</Text>
</TouchableOpacity>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    padding: 15,
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
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
})

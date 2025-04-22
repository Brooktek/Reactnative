import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/contexts/ThemeContext"

export default function CustomHeader({ navigation }) {
  const { colors, toggleTheme } = useTheme()

  const toggleSidebar = () => {
    // Implement toggleSidebar logic
    console.log("Sidebar toggled")
  }

  const goToAnalytics = () => {
    navigation.navigate("explore")
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
        
        <TouchableOpacity style={styles.headerButton} onPress={toggleTheme}>
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

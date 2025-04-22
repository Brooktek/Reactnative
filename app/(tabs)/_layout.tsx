"use client"

import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/contexts/ThemeContext"
import CustomHeader from "@/components/CustomHeader"
import { useNavigation } from "expo-router"

export default function TabLayout() {
  const { colors } = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
          header: () => <CustomHeader navigation={useNavigation()} />, 
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => <Ionicons name="analytics" size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}

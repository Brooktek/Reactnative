"use client"

import type React from "react"

import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useColorScheme } from "@/hooks/useColorScheme"

// Define theme types
type ThemeContextType = {
  isDarkMode: boolean
  toggleTheme: () => void
  colors: {
    background: string
    surface: string
    surfaceVariant: string
    primary: string
    text: string
    textSecondary: string
    border: string
    accent: string
    error: string
    success: string
    warning: string
    info: string
    weekend: string
    selected: string
    inactive: string
    card: string
    icon: string
    divider: string
    buttonText: string
  }
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme()
  const [isDarkMode, setIsDarkMode] = useState<boolean>(colorScheme === "dark")

  // Load theme preference from storage on initial load
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("themePreference")
        if (storedTheme !== null) {
          setIsDarkMode(storedTheme === "dark")
        } else {
          // Use system preference as default
          setIsDarkMode(colorScheme === "dark")
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error)
      }
    }

    loadThemePreference()
  }, [colorScheme])

  // Save theme preference whenever it changes
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem("themePreference", isDarkMode ? "dark" : "light")
      } catch (error) {
        console.error("Failed to save theme preference:", error)
      }
    }

    saveThemePreference()
  }, [isDarkMode])

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode)
  }

  // Theme colors
  const theme = {
    isDarkMode,
    colors: isDarkMode
      ? {
          // Dark theme
          background: "#000000",
          surface: "#121212",
          surfaceVariant: "#1e1e1e",
          primary: "#6c63ff",
          text: "#ffffff",
          textSecondary: "#aaaaaa",
          border: "#333333",
          accent: "#6c63ff",
          error: "#FF5252",
          success: "#4CAF50",
          warning: "#FFC107",
          info: "#2196F3",
          weekend: "#FF5252",
          selected: "#6c63ff",
          inactive: "#666666",
          card: "#1e1e1e",
          icon: "#ffffff",
          divider: "#333333",
          buttonText: "#ffffff",
        }
      : {
          // Light theme
          background: "#ffffff",
          surface: "#f5f5f5",
          surfaceVariant: "#eeeeee",
          primary: "#6c63ff",
          text: "#000000",
          textSecondary: "#666666",
          border: "#e0e0e0",
          accent: "#6c63ff",
          error: "#B00020",
          success: "#4CAF50",
          warning: "#FF9800",
          info: "#2196F3",
          weekend: "#B00020",
          selected: "#6c63ff",
          inactive: "#9e9e9e",
          card: "#ffffff",
          icon: "#000000",
          divider: "#e0e0e0",
          buttonText: "#ffffff",
        },
  }

  return <ThemeContext.Provider value={{ ...theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

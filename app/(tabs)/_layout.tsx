// app/_layout.tsx or app/(stack)/_layout.tsx
"use client";

import { Stack } from "expo-router";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import CustomHeader from "@/components/CustomHeader";

export default function StackLayout() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.accent,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          header: () => <CustomHeader navigation={navigation} />,
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="explore"
        options={{
          title: "Analytics",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right", // iOS-style transition
        gestureEnabled: true,          // ✅ swipe-back enabled
        gestureDirection: "horizontal",
      }}
    />
  );
}

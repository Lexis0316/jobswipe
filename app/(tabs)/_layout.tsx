//layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // 👈 show your header text (can be replaced)
        tabBarStyle: {
          backgroundColor: "#fffcfc",
          height: 67,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOpacity: 0.10,
          shadowRadius: 4,
          elevation: 6,
          marginBottom: 0,
        },
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#727272",
        tabBarLabelStyle: {
          fontWeight: 'bold', // This makes the active tab label appear "thicker"
        },
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/profile.png")}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pending"
        options={{
          title: "Pending",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/pending.png")}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/discover.png")}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/saved.png")}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/icons/chats.png")}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />
    </Tabs>
  );
}

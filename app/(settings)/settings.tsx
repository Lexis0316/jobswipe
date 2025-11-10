// app/settings.jsx
import { Stack } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export const unstable_settings = {
  // Expo Router setting to control Stack options
};

export default function Settings() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  return (
    <View style={styles.page}>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: true, // 👈 Swipe back enabled
          gestureDirection: "horizontal",
        }}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>JobSwipe</Text>
      </View>

      {/* MAIN CONTENT */}
      <View style={styles.rectangle}>
        <Text style={styles.title}>About JobSwipe</Text>
        <Text style={styles.paragraph}>
          JobSwipe is designed to make job hunting accessible, simple, and
          inclusive to all types of users. This focuses on making sure that both
          job seekers and employers can interact with each other easily.
        </Text>
      </View>

      {/* FOOTER */}
      <Text style={styles.footerText}>© JobSwipe. All Rights Reserved</Text>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    alignItems: "center",
  },
header: {
  width: "100%",
  height: 85,
  backgroundColor: "#ffffff",
  flexDirection: "row",
  alignItems: "flex-end", // 👈 center vertically
  justifyContent: "center", // 👈 center horizontally since only one text
  paddingHorizontal: 20,
  paddingBottom: 10,
  elevation: 5,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
},

  headerText: {
    color: "#002D72", // dark blue
    fontSize: 30,
    fontWeight: "700",
  },
  rectangle: {
    backgroundColor: "#fefefe",
    borderRadius: 20,
    width: "90%",
    height: "71.5%",
    marginTop: 40,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  footerText: {
    position: "absolute",
    bottom: 150,
    color: "#000000b2",
    fontSize: 12,
    textAlign: "center",
  },
  button: {
    position: "absolute",
    bottom: 80,
    backgroundColor: "#dd0808ff",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 50,
    width: 180,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fefefe",
    fontSize: 16,
    fontWeight: "600",
  },
});

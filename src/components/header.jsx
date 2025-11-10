//contains the settings button
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export const Header = () => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>JobSwipe</Text>

      {/* SETTINGS ICON — now clickable */}
      <TouchableOpacity onPress={() => router.push("/settings")}>
        <Image
          source={require("../../assets/icons/settings.png")}
          style={styles.settingsIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 85,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
    elevation: 3,
    marginTop: 0,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 }, // only bottom shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    color: "#002D72", // dark blue
    fontSize: 30,
    fontWeight: "700",
  },
  settingsIcon: {
    width: 28,
    height: 28,
  },
});

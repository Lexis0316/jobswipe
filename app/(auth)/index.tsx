// app/index.tsx
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONTS } from "../../src/styles/theme"; // ✅ corrected path

export default function MainPage() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/shapeset.png")}
      style={styles.background}
      imageStyle={{
        width: "100%",
        height: "100%",
        top: -500,
      }}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome</Text>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/signuppagechoose")}
      >
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Admin Button (optional, can remove) */}
      <TouchableOpacity
        style={styles.adminButton}
        onPress={() => router.push("/(admin)/SignupLoginADM")}
      >
        <Text style={styles.adminButtonText}>Admin</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>JobSwipe</Text>

      {/* Logo Image */}
      <Image
        source={require("../../assets/images/jobswipe-v3-2.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: 272,
    alignItems: "center",
  },
  welcomeText: {
    ...FONTS.h1,
    fontSize: 30,
    fontWeight: "700",
    color: "#0c1c47",
    top: 40,
  },
  button: {
    position: "absolute",
    top: 395,
    backgroundColor: "#f3f3f3",
    borderRadius: 500,
    width: 178,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  loginButton: {
    position: "absolute",
    top: 450,
    backgroundColor: "#0c1c47",
    borderRadius: 500,
    width: 178,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  adminButton: {
    position: "absolute",
    top: 680,
    backgroundColor: "#0c1c47",
    borderRadius: 500,
    width: 178,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpButtonText: {
    color: "#000000",
    ...FONTS.p,
  },
  loginButtonText: {
    color: COLORS.grey,
    ...FONTS.p,
  },
  adminButtonText: {
    color: COLORS.grey,
    ...FONTS.p,
  },
  title: {
    position: "absolute",
    top: 120,
    fontSize: 43,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    width: 390,
    right: 43,
  },
  logo: {
    position: "absolute",
    top: 120,
    left: 287,
    width: 50,
    height: 50,
  },
});

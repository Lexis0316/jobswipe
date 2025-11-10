// app/(admin)/SignupLoginADM.jsx
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
import { COLORS, FONTS } from "../../src/styles/theme";

export default function SignupLoginADMScreen() {
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
      <Text style={styles.title}>JobSwipe</Text>

      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome</Text>
      </View>

      <Text style={styles.adminText}>Admin</Text>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={() => router.push("/signup")}
      >
        <Text style={styles.signUpText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      {/* Logo */}
      <Image
        source={require("../../assets/images/jobswipe-v3-2.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // Background
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f7f7",
  },

  // Admin text (you can easily move or restyle here)
  adminText: {
    position: "absolute",
    top: 110,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    left: 287,
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
  subTitle: {
    fontSize: 20,
    color: "#e6e6e6",
  },

  // Buttons
  signUpButton: {
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
  signUpText: {
    color: "#000",
    ...FONTS.p,
  },
  loginText: {
    color: COLORS.grey,
    ...FONTS.p,
  },

  // Logo and welcome
  logo: {
    position: "absolute",
    top: 120,
    left: 287,
    width: 50,
    height: 50,
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
});

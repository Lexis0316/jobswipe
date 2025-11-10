import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
// 🔻 REMOVED: import { getAdmins } from "../../src/data/adminstorage";
import { COLORS, FONTS } from "../../src/styles/theme";

// Firebase Imports
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../src/data/firebaseConfig";

export default function LoginADMScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Info", "Please enter both email and password.");
      return;
    }

    // 🚀 FIREBASE LOGIN LOGIC
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On success, Firebase automatically handles the session.
      // We just need to navigate.
      router.replace("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      // Provide a user-friendly error
      Alert.alert(
        "Invalid Login",
        "Incorrect email or password. Please try again."
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
        <Image
          source={require("../../assets/images/jobswipe-v3-2.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.adminText}>Admin</Text>

        {/* Labels */}
        <Text style={styles.emailLabel}>Email</Text>
        <Text style={styles.passwordLabel}>Password</Text>

        {/* Form */}
        <View style={styles.formContainer}>
          <TextInput
            style={[styles.input, { top: 330 }]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#cccccc"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { top: 420 }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#cccccc"
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => router.replace("/signup")}
          >
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.lightGreyBackground,
    alignItems: "center",
  },

  // Title + Logo
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
  adminText: {
    position: "absolute",
    top: 110,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    left: 287,
  },
  // Labels
  emailLabel: {
    position: "absolute",
    top: 300,
    left: 30,
    fontSize: 18,
    fontWeight: "400",
    color: "#000000",
  },
  passwordLabel: {
    position: "absolute",
    top: 390,
    left: 30,
    fontSize: 20,
    fontWeight: "400",
    color: "#000000",
  },
  // Inputs
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 0,
  },
  input: {
    position: "absolute",
    width: 370,
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderRadius: 500,
    fontSize: 16,
    color: "#000000",
    top: 210,
  },
  inputPassword: {
    position: "absolute",
    width: 370,
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderRadius: 500,
    fontSize: 16,
    color: "#000000",
    top: 300,
  },

  // Login Button
  loginButton: {
    position: "absolute",
    backgroundColor: "#0c1c47",
    borderRadius: 500,
    width: 178,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1031a0",
    top: 510,
  },
  loginButtonText: {
    color: COLORS.grey,
    ...FONTS.p,
  },
});
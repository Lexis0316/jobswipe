import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../src/data/firebaseConfig";
import { COLORS, FONTS } from "../../src/styles/theme";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleLogin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password.trim()
    );

    const user = userCredential.user;
    const docRef = doc(db, "users", user.uid);

    // 👇 Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();

        // Save to AsyncStorage for caching
        AsyncStorage.setItem("currentUser", JSON.stringify(userData));

        // Navigate after first successful load
        router.push("/(tabs)/profile");
      } else {
        alert("User data not found");
      }
    });

    // Optionally stop listening later:
    // unsubscribe();
  } catch (error: any) {
    alert("Invalid email or password");
  }
};


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
      {/* Title */}
      <Text style={styles.title}>JobSwipe</Text>

      {/* Logo */}
      <Image
        source={require("../../assets/images/jobswipe-v3-2.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Email Label */}
      <Text style={styles.emailLabel}>Email</Text>

      {/* Password Label */}
      <Text style={styles.passwordLabel}>Password</Text>

      {/* Inputs */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="#cccccc"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.inputPassword}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor="#cccccc"
          secureTextEntry
        />

        {/* Login Button */}
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin} // <-- use the new function
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>


      </View>
    </ImageBackground>
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

  // 🧩 Title + Logo
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

  // 🧩 Labels (now movable)
  emailLabel: {
    position: "absolute",
    top: 300, // 👈 you can change this freely (e.g., 59)
    left: 30,
    fontSize: 18,
    fontWeight: "400",
    color: "#000000",
  },
  passwordLabel: {
    position: "absolute",
    top: 390, // 👈 you can change this freely too
    left: 30,
    fontSize: 20,
    fontWeight: "400",
    color: "#000000",
  },

  // 🧩 Inputs
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 120,
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
    alignItems: "center",
  },

  // 🧩 Login Button
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
    top: 390,
  },
  loginButtonText: {
    color: COLORS.grey,
    ...FONTS.p,
  },
});

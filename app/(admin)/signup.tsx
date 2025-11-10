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
import { COLORS, FONTS } from "../../src/styles/theme";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../src/data/firebaseConfig";

export default function SignupADMScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // State for all fields
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleNext = () => {
    if (!firstName || !middleName || !lastName) {
      alert("Please fill in all fields");
      return;
    }
    setStep(2);
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // 🚀 FIREBASE SIGNUP LOGIC
    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Save admin details to Firestore 'admins' collection
      // We use the user's UID as the document ID
      await setDoc(doc(db, "users", user.uid), { // 👈 CHANGED from "admins" to "users"
        firstName,
        middleName,
        lastName,
        email: email.toLowerCase(),
        type: "admin", // 👈 ADDED this line
        // 🚨 DANGER: Never save passwords to Firestore.
        // Firebase Auth handles this securely. Remove the password lines.
      });

      // 3. Clear fields and navigate
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setStep(1);
      router.replace("/dashboard"); // Go to dashboard on success
    } catch (error: any) {
      console.log("Signup error:", error);
      Alert.alert(`Signup failed`, error.message); // Show Firebase error
    }
  };

  const handleBack = () => {
    setStep(1);
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

        {/* Form Container */}
        <View style={styles.formContainer}>
          {step === 1 && (
            <>
              {/* Step 1: Name (Using stacked layout from Code 1) */}
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor="#cccccc"
              />
              <Text style={styles.label}>Middle Name</Text>
              <TextInput
                style={styles.input}
                value={middleName}
                onChangeText={setMiddleName}
                placeholder="Enter your middle name"
                placeholderTextColor="#cccccc"
              />
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor="#cccccc"
              />
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonNext}>Next</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              {/* Step 2: Account (Using stacked layout from Code 1) */}
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#cccccc"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#cccccc"
                secureTextEntry
              />
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="#cccccc"
                secureTextEntry
              />
                <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={handleBack}
              >
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                <Text style={styles.SignupText}>Sign Up</Text>
              </TouchableOpacity>

            </>
          )}
        </View>

        {/* Login Link */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.replace("/login")}
        >
        </TouchableOpacity>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

// 🎨 STYLES
// Using Code 2's styles, but replacing 'label' and 'input'
// with the styles from Code 1
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.lightGreyBackground,
    alignItems: "center",
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

  adminText: {
    position: "absolute",
    top: 110,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    left: 287,
  },

  formContainer: {
    position: "absolute",
    top: 250,
    width: "100%",
    alignItems: "center",
  },

  // 👇 Styles copied from Code 1
  label: {
    width: 370,
    fontSize: 18,
    fontWeight: "400",
    color: "#000000",
    marginTop: 20,
  },
  // 👇 Styles copied from Code 1
  input: {
    width: 370,
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderRadius: 500,
    fontSize: 16,
    marginTop: 5,
  },

  // 👇 Styles from Code 2 (for buttons)
  button: {
    top: 20,
    marginTop: 10,
    backgroundColor: "#0c1c47",
    borderRadius: 500,
    width: 178,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  backButton: {
    backgroundColor: "#f3f3f3",
  },
  
  buttonText: {
    color: "#000000ff",
    ...FONTS.p, // Added font style from Code 1
  },

    buttonNext: {
    color: "#ffffffff",
    ...FONTS.p, // Added font style from Code 1
  },

  SignupText: {
    color: "#ffffff", // Kept white text
    ...FONTS.p, // Added font style from Code 1
  },

  // 👇 Styles from Code 2 (for login link)
  loginLink: {
    position: "absolute",
    bottom: 50,
  },
  loginText: {
    fontSize: 16,
    color: "#000000",
  },
  loginLinkText: {
    color: "#0c1c47",
    fontWeight: "700",
  },
});
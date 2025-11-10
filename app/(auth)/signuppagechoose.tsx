import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS, FONTS } from "../../src/styles/theme";

export default function LoginPageChoose() {
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

      {/* Company Button */}
      <TouchableOpacity
        style={styles.companyButton}
        onPress={() => router.push("/company")}
      >
        <Text style={styles.companyButtonText}>Company</Text>
      </TouchableOpacity>

      {/* Applicant Button */}
      <TouchableOpacity
        style={styles.applicantButton}
        onPress={() => router.push("/applicant")}
      >
        <Text style={styles.applicantButtonText}>Applicant</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>JobSwipe</Text>

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
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lightGreyBackground,
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
  companyButton: {
    position: "absolute",
    top: 450,
    backgroundColor: "#f3f3f3",
    borderRadius: 500,
    width: 178,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  applicantButton: {
    position: "absolute",
    top: 395,
    backgroundColor: "#f3f3f3",
    borderRadius: 500,
    borderWidth: 1,
    borderColor: "#000",
    width: 178,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },
  companyButtonText: {
    color: COLORS.darkBlue,
    ...FONTS.p,
  },
  applicantButtonText: {
    color: COLORS.darkBlue,
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

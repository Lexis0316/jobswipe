
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { auth, db } from "../../src/data/firebaseConfig";
import provincesData from "../../src/data/provinces.json";
import { COLORS, FONTS } from "../../src/styles/theme";

export default function CreateCompanyAccount() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    hrFirstName: "",
    hrLastName: "",
    age: "",
    sex: "",
    companyAddress: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showSexModal, setShowSexModal] = useState(false); // ✅ NEW MODAL STATE
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const provinces = provincesData;

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    if (
      !formData.companyName.trim() ||
      !formData.hrFirstName.trim() ||
      !formData.hrLastName.trim() ||
      !formData.age.trim() ||
      !formData.sex.trim() || 
      !formData.companyAddress.trim()
    ) {
      alert("Please fill in all fields");
      return;
    }

    // ✅ Age validation logic
    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 18) {
      alert("You must be at least 18 years old to sign up.");
      return;
    }

    setStep(2);
  };

const handleSignUp = async () => {
  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email.trim(),
      formData.password.trim()
    );

    const user = userCredential.user;

    // store extra info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      type: "company",
      ...formData,
    });

    alert("Account created successfully!");
    router.push("/login");
  } catch (error: any) {
    alert(error.message);
  }
};

  // --- Province & City modal handlers ---
  const openProvinceModal = () => {
    setShowProvinceModal(true);
  };

  const selectProvince = (province: string) => {
    setSelectedProvince(province);
    setShowProvinceModal(false);
    setTimeout(() => setShowCityModal(true), 200);
  };

  const selectCity = (city: string) => {
    setSelectedCity(city);
    const fullAddress = `${selectedProvince}, ${city}`;
    handleChange("companyAddress", fullAddress);
    setShowCityModal(false);
  };

  // --- Sex modal handlers ---
  const openSexModal = () => {
    setShowSexModal(true);
  };

  const selectSex = (sex: string) => {
    handleChange("sex", sex);
    setShowSexModal(false);
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

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <Text style={[styles.label, { top: 250 }]}>Company Name</Text>
          <TextInput
            style={[styles.input, { top: 275 }]}
            value={formData.companyName}
            onChangeText={(v) => handleChange("companyName", v)}
            placeholder="Enter company name"
            placeholderTextColor="#cccccc"
          />

          <Text style={[styles.label, { top: 330 }]}>HR First Name</Text>
          <TextInput
            style={[styles.input, { top: 355 }]}
            value={formData.hrFirstName}
            onChangeText={(v) => handleChange("hrFirstName", v)}
            placeholder="Enter HR first name"
            placeholderTextColor="#cccccc"
          />

          <Text style={[styles.label, { top: 410 }]}>HR Last Name</Text>
          <TextInput
            style={[styles.input, { top: 435 }]}
            value={formData.hrLastName}
            onChangeText={(v) => handleChange("hrLastName", v)}
            placeholder="Enter HR last name"
            placeholderTextColor="#cccccc"
          />

          <Text style={[styles.label, { top: 490 }]}>Age</Text>
          <TextInput
            style={[styles.input, { top: 515 }]}
            value={formData.age}
            onChangeText={(v) => handleChange("age", v)}
            placeholder="Enter age"
            placeholderTextColor="#cccccc"
            keyboardType="numeric"
          />

          <Text style={[styles.label, { top: 570 }]}>Sex</Text>
          <TouchableOpacity
            style={[styles.input, { top: 595, justifyContent: "center" }]}
            onPress={openSexModal} // ✅ FIXED
          >
            <Text
              style={{
                color: formData.sex ? "#000" : "#cccccc",
                fontSize: 16,
              }}
            >
              {formData.sex || "Select Sex"}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.label, { top: 650 }]}>Company Address</Text>
          <TouchableOpacity
            style={[styles.input, { top: 675, justifyContent: "center" }]}
            onPress={openProvinceModal}
          >
            <Text
              style={{
                color: formData.companyAddress ? "#000" : "#cccccc",
                fontSize: 16,
              }}
            >
              {formData.companyAddress || "Select Province and City"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signUpButton} onPress={handleNext}>
            <Text style={styles.signUpButtonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <Text style={[styles.label, { top: 265 }]}>Email</Text>
          <TextInput
            style={[styles.input, { top: 290 }]}
            value={formData.email}
            onChangeText={(v) => handleChange("email", v)}
            placeholder="Enter email"
            placeholderTextColor="#cccccc"
            keyboardType="email-address"
          />

          <Text style={[styles.label, { top: 345 }]}>Password</Text>
          <TextInput
            style={[styles.input, { top: 370 }]}
            value={formData.password}
            onChangeText={(v) => handleChange("password", v)}
            placeholder="Enter password"
            placeholderTextColor="#cccccc"
            secureTextEntry
          />

          <Text style={[styles.label, { top: 425 }]}>Confirm Password</Text>
          <TextInput
            style={[styles.input, { top: 450 }]}
            value={formData.confirmPassword}
            onChangeText={(v) => handleChange("confirmPassword", v)}
            placeholder="Confirm password"
            placeholderTextColor="#cccccc"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.signUpButton, { top: 685, backgroundColor: "#f3f3f3" }]}
            onPress={() => setStep(1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.signUpButton, { top: 740 }]} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ✅ Sex Modal */}
      <Modal visible={showSexModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Sex</Text>
            {["Male", "Female", "Other"].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => selectSex(option)}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowSexModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Province Modal */}
      <Modal visible={showProvinceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Province</Text>
            <ScrollView>
              {Object.keys(provinces).map((prov) => (
                <TouchableOpacity
                  key={prov}
                  style={styles.modalOption}
                  onPress={() => selectProvince(prov)}
                >
                  <Text style={styles.modalOptionText}>{prov}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowProvinceModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* City Modal */}
      <Modal visible={showCityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select City / Municipality</Text>
            <ScrollView>
              {selectedProvince &&
                provinces[selectedProvince]?.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={styles.modalOption}
                    onPress={() => selectCity(city)}
                  >
                    <Text style={styles.modalOptionText}>{city}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowCityModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  title: {
    position: "absolute",
    top: 120,
    fontSize: 40,
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

  label: {
    position: "absolute",
    left: 30,
    fontSize: 18,
    fontWeight: "400",
    color: "#000000",
  },

  input: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -185 }],
    width: 370,
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderRadius: 500,
    fontSize: 16,
    color: "#000000",
  },

  signUpButton: {
    position: "absolute",
    top: 750,
    backgroundColor: "#0c1c47",
    borderRadius: 500,
    width: 178,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  signUpButtonText: {
    color: COLORS.grey,
    ...FONTS.p,
  },
  backButtonText:{
    color: COLORS.black,
    ...FONTS.p,
  },

  /* Modal styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalOptionText: {
    fontSize: 18,
    textAlign: "center",
    color: "#000",
  },
  modalCancel: {
    marginTop: 16,
    alignItems: "center",
  },
  modalCancelText: {
    color: "red",
    fontSize: 16,
  },
});

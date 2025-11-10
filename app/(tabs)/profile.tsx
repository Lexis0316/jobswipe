import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Header } from "../../src/components/header";
import { auth, db } from "../../src/data/firebaseConfig";

// ================== REUSABLE MODAL ==================
// 1. I moved this component OUT of WorkDetailsSection to make it reusable
const ModalContainer = ({
  title,
  options,
  selected,
  toggleOption,
  onClose,
}: {
  title: string;
  options: string[];
  selected: string[];
  toggleOption: (option: string) => void;
  onClose: () => void;
}) => (
  <Modal visible transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{title}</Text>
        <ScrollView>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => toggleOption(option)}
              style={styles.modalOption}
            >
              <Text style={styles.modalCheck}>
                {selected.includes(option) ? "☑️" : "⬜️"}
              </Text>
              <Text style={styles.modalOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={onClose} style={styles.modalDoneButton}>
          <Text style={styles.modalDoneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function UnifiedProfile() {
const [user, setUser] = useState<any>(null);
const [editSection, setEditSection] = useState<string | null>(null);
const [showModal, setShowModal] = useState(false);
const [showShiftModal, setShowShiftModal] = useState(false);
const [showRolesModal, setShowRolesModal] = useState(false); // 2. Added state for Roles modal
const [newItem, setNewItem] = useState("");
const [formData, setFormData] = useState<any>({
  bio: "",
  phone: "",
  email: "",
  work: [],
  time: [],
  experience: "",
  certificate: "",
  additional: "",
  skills: [],
  roles: [],
  benefits: "",
  training: "",
});

const handleInputChange = (field: string, value: string) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [field]: value,
      }));
    };

const shiftOptions = [
  "8-hour",
  "Part-time (4–6 hours)",
  "12-hour shifts",
  "Stay-in weekdays",
  "Stay-in weekends",
];

const toggleShift = (shift: string) => {
  setFormData((prev: any) => {
    const alreadySelected = prev.time.includes(shift);
    return {
      ...prev,
      time: alreadySelected
        ? prev.time.filter((item: string) => item !== shift)
        : [...prev.time, shift],
    };
  });
};

// This list is now used for BOTH Applicant 'Work' and Company 'Roles'
const [availableWork] = useState([
  "Construction Worker",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Welder",
  "Painter",
  "Mason",
  "Mechanic",
  "Driver",
  "Delivery Rider",
  "Factory Worker",
  "Janitor / Cleaner",
  "Security Guard",
  "HVAC Technician",
  "Roofing Worker",
  "Tile Setter",
  "Scaffolder",
  "Concrete Finisher",
  "Gardener",
  "Bricklayer",
  "Forklift Operator",
  "Heavy Equipment Operator",
  "Cable Installer",
  "Housekeeper",
  "Laundry Worker",
  "Cook",
  "Waiter / Waitress",
  "Maintenance Technician",
]);

useEffect(() => {
  const fetchUser = async () => {
    // ✅ Get current user from Firebase Auth
    const currentUser = auth.currentUser;

    // If not logged in, try fallback from cache
    if (!currentUser || !auth.currentUser) {
      const userData = await AsyncStorage.getItem("currentUser");
      if (userData) setUser(JSON.parse(userData));
      return;
    }

    // ✅ Firestore reference for real-time updates
    const userDocRef = doc(db, "users", currentUser.uid);

    // 👇 Listen for live changes
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const liveUserData = docSnap.data();
            setUser(liveUserData);

            // 👇 THIS IS THE FIX
            // It merges database data with your default state
            setFormData((prevFormData) => ({
              ...prevFormData, // <-- Keeps default empty arrays
              ...liveUserData, // <-- Overwrites with any saved data
            }));
            
            AsyncStorage.setItem("currentUser", JSON.stringify(liveUserData));
          }
        });

    // 🧹 Cleanup listener when leaving screen
    return () => unsubscribe();
  };

  fetchUser();
}, []);

  const handleEdit = (section: string) => {
    setEditSection(editSection === section ? null : section);
  };

const handleSave = async () => {
      if (!auth.currentUser) return;
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      
      try {
        await updateDoc(userDocRef, formData); // This will now save the NEW data
        setEditSection(null);
        console.log("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile: ", error);
        alert("Could not update profile.");
      }
    };

  const toggleWork = (workOption: string) => {
    setFormData((prev: any) => {
      const alreadySelected = prev.work.includes(workOption);
      return {
        ...prev,
        work: alreadySelected
          ? prev.work.filter((item: string) => item !== workOption)
          : [...prev.work, workOption],
      };
    });
  };

  // 3. Added new toggle function for Roles
  const toggleRole = (role: string) => {
    setFormData((prev: any) => {
      const alreadySelected = prev.roles.includes(role);
      return {
        ...prev,
        roles: alreadySelected
          ? prev.roles.filter((item: string) => item !== role)
          : [...prev.roles, role],
      };
    });
  };

  if (!user) return <Text>Loading...</Text>;

  const isApplicant = user.type === "applicant";

  const storage = getStorage();

const pickAndUploadImage = async () => {
  try {
    // 1️⃣ Ask for permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      alert("Permission to access gallery is required!");
      return;
    }

    // 2️⃣ Let user pick an image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const imageUri = result.assets[0].uri;

    // 3️⃣ Prepare FormData for Cloudinary
    const data = new FormData();
    data.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    });

    // ⚠️ Replace with your own Cloudinary info:
    data.append("upload_preset", "unsigned_profile"); // your preset name
    data.append("cloud_name", "dkmg4zfxy"); // your Cloudinary cloud name

    // 4️⃣ Upload to Cloudinary
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dkmg4zfxy/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const resultData = await res.json();

    if (!resultData.secure_url) {
      throw new Error("Failed to upload image to Cloudinary.");
    }

    const imageUrl = resultData.secure_url;

    // 5️⃣ Save Cloudinary image URL to Firestore
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userDocRef, { profileImage: imageUrl });

    alert("Profile picture updated succesfully.");
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Failed to upload image: " + error.message);
  }
};

const pickAndUploadBanner = async () => {
  try {
    // 1️⃣ Ask permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      alert("Permission to access gallery is required!");
      return;
    }

    // 2️⃣ Open image picker with free crop
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3.41, 1], // 🔹 Set your desired aspect ratio (e.g., 16:9)
      quality: 0.8,
    });

    if (result.canceled) return;

    const imageUri = result.assets[0].uri;

    // 3️⃣ Prepare upload to Cloudinary
    const data = new FormData();
    data.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "banner.jpg",
    });
    data.append("upload_preset", "unsigned_profile");
    data.append("cloud_name", "dkmg4zfxy");

    // 4️⃣ Upload to Cloudinary
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dkmg4zfxy/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const resultData = await res.json();

    if (!resultData.secure_url)
      throw new Error("Failed to upload banner image.");

    const bannerUrl = resultData.secure_url;

    // 5️⃣ Save to Firestore
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userDocRef, { bannerImage: bannerUrl });

    alert("Banner updated");
  } catch (error) {
    console.error("Banner upload failed:", error);
    alert("Failed to upload banner: " + error.message);
  }
};
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 10 }}>
        {/* Header */}
        <View style={{ width: "100%", alignItems: "stretch", marginBottom: 24 }}>
            <TouchableOpacity onPress={pickAndUploadBanner}>
              <Image
                source={
                  user?.bannerImage
                    ? { uri: user.bannerImage }
                    : require("../../assets/images/banner.png")
                }
                style={{
                  width: "100%",
                  height: 125,
                  borderRadius: 8,
                }}
              />
            </TouchableOpacity>
            <View style={{ alignItems: "center", marginTop: -70 }}>
                <TouchableOpacity onPress={pickAndUploadImage}>
                  <Image
                    source={
                      user?.profileImage
                        ? { uri: user.profileImage }
                        : require("../../assets/images/pfp.png")
                    }
                    style={{
                      width: 140,
                     height: 140,
                      borderRadius: 70,
                      borderWidth: 2,
                      borderColor: "#fff",
                    }}
                  />
                </TouchableOpacity>
                </View>
                <View style={{ alignItems: "center"}}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#000", marginTop: 12 }}>
            {isApplicant
              ? `${user.firstName} ${user.lastName}`
              : `${user.hrFirstName} ${user.hrLastName} | ${user.companyName}`}
          </Text>
                <Text style={{ fontSize: 14, color: "#727272", marginTop: 4 }}>
                {isApplicant ? "Applicant Profile" : "Company Profile"}
                </Text>

                {/* 👇 Inline info display */}
                <Text style={{ fontSize: 14, color: "#727272"}}>
                {isApplicant
                    ? `${user.age} | ${user.sex.charAt(0)} | ${user.address}`
                    : `${user.age} | ${user.sex.charAt(0)} | ${user.companyAddress}`}
                </Text>
                </View>
        </View>

        {/* Bio / Company Description */}
        
            <Section
            title="Bio"
            field="bio"
            editSection={editSection}
            formData={formData}
            setFormData={setFormData}
            handleEdit={handleEdit}
            handleSave={handleSave}
            textStyle={styles.sectionBio} // bio-specific styling
            />

        {/* Contact Details */}
        <ContactSection
          editSection={editSection}
          formData={formData}
          setFormData={setFormData}
          handleEdit={handleEdit}
         handleSave={handleSave}
        />

        {/* Skills or Roles */}
        {isApplicant ? (
          <ListSection
            title="Skills"
            field="skills"
            newItem={newItem}
            setNewItem={setNewItem}
            formData={formData}
            setFormData={setFormData}
            editSection={editSection}
            handleEdit={handleEdit}
            handleSave={handleSave}
            placeholder="Enter a skill"
            placeholderTextColor="#999999"
          />
        ) : (
          // 5. MODIFIED THIS SECTION
          // Replaced ListSection with an inline component that opens a modal
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Enter Open Roles</Text>
              <TouchableOpacity onPress={() => handleEdit("Enter Open Roles")}>
                <Image
                  source={require("../../assets/icons/edit.png")}
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            </View>
            {editSection === "Enter Open Roles" ? (
              // EDIT MODE - Button to open modal
              <>
                <TouchableOpacity
                  onPress={() => setShowRolesModal(true)}
                  style={styles.selectorButton} // Using style from WorkDetails
                >
                  <Image
                    source={require("../../assets/icons/work.png")}
                    style={{ width: 18, height: 18, marginRight: 8 }}
                  />
                  <Text style={{ flex: 1, flexWrap: "wrap" }}>
                   {formData.roles.length > 0
                        ? formData.roles.join(", ")
                        : "Select open roles"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              // VIEW MODE - Chips (stolen from ListSection)
              <View style={styles.skillList}>
                {formData.roles.length > 0 ? (
                  formData.roles.map((item: string, i: number) => (
                    <View key={i} style={styles.skillChip}>
                      <Text>{item}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: "#999", fontStyle: "italic" }}>
                    Select open roles
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
        {/* Work Details */}
            <WorkDetailsSection
            formData={formData}
            setFormData={setFormData}
            editSection={editSection}
            handleEdit={handleEdit}
            handleSave={handleSave}
            showModal={showModal}
            setShowModal={setShowModal}
            availableWork={availableWork}
            toggleWork={toggleWork}
            toggleShift={toggleShift}
            isApplicant={isApplicant}
            shiftOptions={shiftOptions}
            showShiftModal={showShiftModal}
            setShowShiftModal={setShowShiftModal}
            />
        {/* Additional Info / Benefits */}
        {isApplicant ? (
            <Section
            title="Additional Information"
            field="additional"
            editSection={editSection}
            formData={formData}
            setFormData={setFormData}
            handleEdit={handleEdit}
            handleSave={handleSave}
            />
        ) : (
          <Section
            title="Compensation / Benefits"
            field="benefits"
            editSection={editSection}
            formData={formData}
            setFormData={setFormData}
            handleEdit={handleEdit}
            handleSave={handleSave}
          />
        )}
        {/* 4. All Modals are now rendered here, at the top level */}
        {showModal && (
          <ModalContainer
            title="Select Available Work"
            options={availableWork}
            selected={formData.work}
            toggleOption={toggleWork}
            onClose={() => setShowModal(false)}
          />
        )}

        {showShiftModal && (
          <ModalContainer
            title="Select Shift"
            options={shiftOptions}
            selected={formData.time}
            toggleOption={toggleShift}
            onClose={() => setShowShiftModal(false)}
          />
        )}
        {showRolesModal && (
          <ModalContainer
            title="Select Open Roles"
            options={availableWork}
            selected={formData.roles}
            toggleOption={toggleRole}
            onClose={() => setShowRolesModal(false)}
          />
        )}
      </ScrollView>
    </View>
  );
}

// ================== REUSABLE SECTIONS ==================

function Section({
  title,
  field,
  editSection,
  formData,
  setFormData,
  handleEdit,
  handleSave,
  textStyle,
}) {
  const renderBulletedText = (text) => {
    if (!text) {
      // Custom placeholder text for empty sections
      if (field === "additional") return <Text style={textStyle}>Enter Additional Info</Text>;
      if (field === "benefits") return <Text style={textStyle}>Enter Compensation / Benefits</Text>;
      if (field === "bio") return <Text style={textStyle}>Enter bio</Text>;
      return <Text style={textStyle}>Enter {title.toLowerCase()}</Text>;
    }

    // 👇 Bio has no bullets, others do
    if (field === "bio") {
      return <Text style={textStyle}>{text}</Text>;
    }

    // Split by newline or comma for bullets
    const items = text
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    return items.map((item, idx) => (
      <Text key={idx} style={[textStyle, { marginBottom: 4 }]}>
        • {item}
      </Text>
    ));
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={() => handleEdit(title)}>
          <Image source={require("../../assets/icons/edit.png")} style={styles.editIcon} />
        </TouchableOpacity>
      </View>

      {editSection === title ? (
        <>
          <TextInput
            style={[styles.sectionContent, textStyle]}
            multiline
            placeholder={
              field === "bio"
                ? "Enter bio"
                : field === "additional"
                ? "Enter Additional Info"
                : field === "benefits"
                ? "Enter Compensation / Benefits"
                : `Enter ${title.toLowerCase()}`
            }
            placeholderTextColor="#999999"
            value={formData[field]}
            onChangeText={(text) => setFormData({ ...formData, [field]: text })}
          />
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View>{renderBulletedText(formData[field])}</View>
      )}
    </View>
  );
}

function ContactSection({ editSection, formData, setFormData, handleEdit, handleSave }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Contact Details</Text>
        <TouchableOpacity onPress={() => handleEdit("Contact Details")}>
          <Image source={require("../../assets/icons/edit.png")} style={styles.editIcon} />
        </TouchableOpacity>
      </View>

      {editSection === "Contact Details" ? (
        <>
          {/* 📞 Phone Field (edit mode) */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Image
              source={require("../../assets/icons/phone.png")}
              style={{ width: 18, height: 18, marginRight: 6 }}
            />
            <Text style={{ fontSize: 15, marginRight: 4 }}>+63</Text>
            <TextInput
              style={[styles.sectionContent, { flex: 1 }]}
              placeholder="Enter phone number"
              placeholderTextColor="#999999"
              keyboardType="numeric"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              maxLength={10}
            />
          </View>

          {/* 📧 Email Field (edit mode) */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={require("../../assets/icons/email.png")}
              style={{ width: 18, height: 18, marginRight: 6 }}
            />
            <TextInput
              style={[styles.sectionContent, { flex: 1 }]}
              placeholder="Enter email"
              placeholderTextColor="#999999"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
          </View>

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* 📞 Phone Field (view mode) */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Image
              source={require("../../assets/icons/phone.png")}
              style={{ width: 18, height: 18, marginRight: 6 }}
            />
            <Text style={styles.sectionContent}>
              +63 {formData.phone || "Enter phone number"}
            </Text>
          </View>

          {/* 📧 Email Field (view mode) */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={require("../../assets/icons/email.png")}
              style={{ width: 18, height: 18, marginRight: 6 }}
            />
            <Text style={styles.sectionContent}>{formData.email || "Enter email"}</Text>
          </View>
        </>
      )}
    </View>
  );
}

function ListSection({
  title,
  field,
  newItem,
  setNewItem,
  formData,
  setFormData,
  editSection,
  handleEdit,
  handleSave,
  placeholder,
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={() => handleEdit(title)}>
          <Image source={require("../../assets/icons/edit.png")} style={styles.editIcon} />
        </TouchableOpacity>
      </View>
      {editSection === title ? (
        <>
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <TextInput
              style={[styles.sectionContent, { flex: 1 }]}
              placeholder={placeholder}
              value={newItem}
              onChangeText={setNewItem}
            />
            <TouchableOpacity
              onPress={() => {
                if (newItem.trim() !== "") {
                  setFormData({ ...formData, [field]: [...formData[field], newItem.trim()] });
                  setNewItem("");
                }
              }}
              style={{
                marginLeft: 8,
                backgroundColor: "#0c1c47",
                paddingHorizontal: 12,
                justifyContent: "center",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.skillList}>
            {formData[field].map((item: string, i: number) => (
              <View key={i} style={styles.skillChip}>
                <Text style={{ marginRight: 6 }}>{item}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setFormData({
                      ...formData,
                      [field]: formData[field].filter((_: any, index: number) => index !== i),
                    })
                  }
                >
                  <Text style={{ fontWeight: "700" }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.skillList}>
          {formData[field].length > 0 ? (
            formData[field].map((item: string, i: number) => (
              <View key={i} style={styles.skillChip}>
                <Text>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: "#999", fontStyle: "italic" }}>Enter {title.toLowerCase()}</Text>
          )}
        </View>
      )}
    </View>
  );
}

interface WorkDetailsProps {
  formData: any;
  setFormData: any;
  editSection: string | null;
  handleEdit: (section: string) => void;
  handleSave: () => void;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  availableWork: string[];
  toggleWork: (workOption: string) => void;
  toggleShift: (shift: string) => void; // <- add this
  isApplicant: boolean;
  shiftOptions: string[];
  showShiftModal: boolean;
  setShowShiftModal: (value: boolean) => void;
}


function WorkDetailsSection({
  formData,
  setFormData,
  editSection,
  handleEdit,
  handleSave,
  showModal,
  setShowModal,
  availableWork,
  toggleWork,
  toggleShift,
  isApplicant,
  shiftOptions,
  showShiftModal,
  setShowShiftModal,
}: WorkDetailsProps) {
  // The ModalContainer component was here, but has been moved
  // to the top level to be reusable.

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Work Details</Text>
        <TouchableOpacity onPress={() => handleEdit("Work Details")}>
          <Image
            source={require("../../assets/icons/edit.png")}
            style={styles.editIcon}
          />
        </TouchableOpacity>
      </View>

      {/* ====================== VIEW MODE ====================== */}
      {editSection !== "Work Details" ? (
        <>
          {isApplicant && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
                flexWrap: "wrap",
              }}
            >
              <Image
                source={require("../../assets/icons/work.png")}
                style={{ width: 18, height: 18, marginRight: 6 }}
              />
              <Text style={styles.sectionContent}>
                {formData.work.length > 0
                  ? formData.work.join(", ")
                  : "Select work options"}
              </Text>
            </View>
          )}

          <View
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
          >
            <Image
              source={require("../../assets/icons/time.png")}
              style={{ width: 18, height: 18, marginRight: 6 }}
            />
            <Text style={styles.sectionContent}>
              {formData.time.length > 0
                ? formData.time.join(", ")
                : "Select shift"}
            </Text>
          </View>

          <View
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
          >
            <Image
              source={require("../../assets/icons/experience.png")}
              style={{ width: 18, height: 18, marginRight: 6 }}
            />
            <Text style={styles.sectionContent}>
              {formData.experience || "Enter experience"}
            </Text>
          </View>

          <View
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
          >
            <Image
              source={require("../../assets/icons/certificate.png")}
              style={{ width: 18, height: 18, marginRight: 6 }}
            />
            <Text style={styles.sectionContent}>
              {formData.certificate || "Enter certificate"}
            </Text>
          </View>

          {!isApplicant && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../assets/icons/training.png")}
                style={{ width: 18, height: 18, marginRight: 6 }}
              />
              <Text style={styles.sectionContent}>
                {formData.training || "Select training option"}
              </Text>
            </View>
          )}
        </>
      ) : (
        <>
          {/* ====================== EDIT MODE ====================== */}
          {isApplicant && (
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              style={styles.selectorButton}
            >
              <Image
                source={require("../../assets/icons/work.png")}
                style={{ width: 18, height: 18, marginRight: 8 }}
              />
              <Text style={{ flex: 1, flexWrap: "wrap" }}>
                {formData.work.length > 0
                  ? formData.work.join(", ")
                  : "Select work options"}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ marginVertical: 16 }}>
            <Text style={{ fontWeight: "600", fontSize: 16 }}>Shift</Text>
            <TouchableOpacity
              onPress={() => setShowShiftModal(true)}
              style={styles.selectorButton}
            >
              <Image
                source={require("../../assets/icons/time.png")}
                style={{ width: 18, height: 18, marginRight: 8 }}
              />
              <Text style={{ flex: 1, flexWrap: "wrap" }}>
                {formData.time.length > 0
                  ? formData.time.join(", ")
                  : "Select shift"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* The Modal renders were removed from here and put in UnifiedProfile */}

          {/* Experience */}
          <View
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
          >
            <Image
              source={require("../../assets/icons/experience.png")}
              style={{ width: 18, height: 18, marginRight: 6 }}
            />
            <TextInput
              style={[styles.sectionContent, { flex: 1 }]}
            placeholder="Enter experience"
              placeholderTextColor="#999999"
              value={formData.experience}
              onChangeText={(text) =>
                setFormData({ ...formData, experience: text })
              }
            />
          </View>

          {/* Certificate */}
          <View
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
          >
           <Image
              source={require("../../assets/icons/certificate.png")}
             style={{ width: 18, height: 18, marginRight: 6 }}
            />
            <TextInput
             style={[styles.sectionContent, { flex: 1 }]}
              placeholder="Enter certificate"
              placeholderTextColor="#999999"
              value={formData.certificate}
              onChangeText={(text) =>
                setFormData({ ...formData, certificate: text })
              }
            />
          </View>

          {/* Training (Company Only) */}
          {!isApplicant && (
            <View
              style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}
            >
              <Image
                source={require("../../assets/icons/training.png")}
                style={{ width: 18, height: 18, marginRight: 6 }}
              />
              <View style={{ flex: 1, flexDirection: "row" }}>
                {["Training Provided", "No Training Provided"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setFormData({ ...formData, training: option })}
                     style={[
                      styles.trainingOption,
                      {
                        backgroundColor:
                          formData.training === option ? "#0c1c47" : "#f0f0f0",
                      },
                    ]}
                  >
                    <Text
                      style={{
color: formData.training === option ? "#fff" : "#000",
                          fontWeight: "600",
                      }}
                    >
                    {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}


// ================== STYLES ==================
const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fefefe",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: "#555",
  },
  sectionContent: {
    fontSize: 15,
    marginBottom: 6,
  },
  saveButton: {
    backgroundColor: "#0c1c47",
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  saveText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
  skillList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 6,
  },

  selectorButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    padding: 16,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalCheck: { marginRight: 8, fontSize: 16 },
  modalOptionText: { fontSize: 16 },
  modalDoneButton: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#ccc",
  },
  modalDoneText: {
    fontWeight: "600",
    fontSize: 16,
  },
  trainingOption: {
    flex: 1,
    padding: 10,
    marginRight: 8,
    borderRadius: 8,
    alignItems: "center",
  },
    sectionBio: {
    textAlign: "center",         // centers text horizontally
    textAlignVertical: "center", // centers vertically on Android
    fontSize: 15,
    color: "#000",
    padding: 0,
    width: "100%",
  },
  
});

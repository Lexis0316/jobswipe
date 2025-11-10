import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { signOut } from "firebase/auth";
// ➕ ADDED 'doc' import
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../src/data/firebaseConfig";

export default function DashboardADM() {
  const router = useRouter();

  const [applicantCount, setApplicantCount] = useState("...");
  const [companyCount, setCompanyCount] = useState("...");
  // ➕ ADDED: State for admin's name
  const [adminName, setAdminName] = useState("...");

  useEffect(() => {
    // --- Applicant Count Listener ---
    const applicantsQuery = query(
      collection(db, "users"), // 👈 from 'users'
      where("type", "==", "applicant") // 👈 where type is 'applicant'
    );

    const unsubApplicants = onSnapshot(
      applicantsQuery, // 👈 Listen to the query
      (snapshot) => {
        setApplicantCount(snapshot.size.toString());
      },
      (error) => {
        console.error("Error listening to applicants count:", error);
        setApplicantCount("N/A");
      }
    );

    // --- Company Count Listener ---
    const companiesQuery = query(
      collection(db, "users"), // 👈 from 'users'
      where("type", "==", "company") // 👈 where type is 'company'
    );

    const unsubCompanies = onSnapshot(
      companiesQuery, // 👈 Listen to the query
      (snapshot) => {
        setCompanyCount(snapshot.size.toString());
      },
      (error) => {
        console.error("Error listening to companies count:", error);
        setCompanyCount("N/A");
      }
    );

    // ➕ ADDED: Admin Name Listener
    const user = auth.currentUser;
    let unsubAdmin = () => {}; // Initialize as a no-op function

    if (user) {
      // Get a reference to the admin's document in the 'users' collection
      const adminDocRef = doc(db, "users", user.uid);

      unsubAdmin = onSnapshot(
        adminDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Build the full name, handling missing fields
            const fName = data.firstName || "";
            const mName = data.middleName || "";
            const lName = data.lastName || "";

            // Combine and clean up extra spaces
            const fullName = `${fName} ${mName} ${lName}`
              .replace(/\s+/g, " ")
              .trim();

            setAdminName(fullName || "Admin"); // Use "Admin" as fallback
          } else {
            console.warn("Admin document not found for UID:", user.uid);
            setAdminName("Admin (Not Found)");
          }
        },
        (error) => {
          console.error("Error fetching admin data:", error);
          setAdminName("N/A");
        }
      );
    } else {
      console.warn("No user logged in, cannot fetch admin name.");
      setAdminName("Unknown");
    }

    // --- Cleanup ---
    return () => {
      unsubApplicants();
      unsubCompanies();
      unsubAdmin(); // 👈 ADDED cleanup for admin listener
    };
  }, []);

  // ➕ ADDED: Logout Function (This was already in your code)
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login"); // Use replace to prevent going back
    } catch (error: any) {
      console.error("Logout error:", error);
      Alert.alert("Logout Failed", error.message);
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
      {/* 🧩 Header */}
      <Text style={styles.title}>JobSwipe</Text>
      <Image
        source={require("../../assets/images/jobswipe-v3-2.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.adminText}>Admin</Text>

      {/* 🧩 Dashboard Title */}
      <Text style={styles.dashboardTitle}>Dashboard</Text>

      {/* ➕ ADDED: Admin Logged In Text */}
      <Text style={styles.adminLoggedInText}>
        Admin Logged In: {adminName}
      </Text>

      {/* 🧩 Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Applicants</Text>
          <Text style={styles.statValue}>{applicantCount}</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Companies</Text>
          <Text style={styles.statValue}>{companyCount}</Text>
        </View>
      </View>

      {/* 🧩 Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/mod-applicants")}
        >
          <Text style={styles.buttonText}>Modify Applicants</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/mod-companies")}
        >
          <Text style={styles.buttonText}>Modify Companies</Text>
        </TouchableOpacity>
      </View>

      {/* 🧩 Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout} // 👈 Use functional logout
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

// ... STYLES (Only one addition)
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#f4f7fa",
    alignItems: "center",
  },

  // 🧩 Header
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

  // 🧩 Dashboard Title
  dashboardTitle: {
    position: "absolute",
    top: 315,
    fontSize: 34,
    fontWeight: "bold",
    color: "#0c1c47",
  },

  // ➕ ADDED: Style for Admin Name
  adminLoggedInText: {
    position: "absolute",
    top: 270, // Positioned between the title and the stat boxes
    fontSize: 16,
    fontWeight: "500",
    color: "#0c1c47",
    left: 34,
  },

  // 🧩 Stats
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 50,
    position: "absolute",
    top: 380,
  },
  statBox: {
    backgroundColor: "#ffffff",
    width: 150,
    height: 100,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0c1c47",
  },

  // 🧩 Buttons
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    position: "absolute",
    top: 540,
  },
  actionButton: {
    backgroundColor: "#0c1c47",
    width: 150,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    marginTop: -40,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  // 🧩 Logout Button Styles
  logoutButton: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "#E05B5B",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 3,
  },
  logoutText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
});
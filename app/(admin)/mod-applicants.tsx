import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// ➕ ADDED: doc and deleteDoc
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../src/data/firebaseConfig";

export default function ModAppADMScreen() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const collRef = query(
      collection(db, "users"),
      where("type", "==", "applicant")
    );

    const unsubscribe = onSnapshot(
      collRef,
      (querySnapshot) => {
        const applicantsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApplicants(applicantsList);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to applicants:", error);
        Alert.alert("Error", "Failed to load applicants in real-time.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ➕ ADDED: Function to handle user deletion
  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      "Delete Applicant",
      `Are you sure you want to delete ${userName} (${userId})? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // We delete from the 'users' collection
              await deleteDoc(doc(db, "users", userId));
              Alert.alert(
                "Success",
                `User ${userName} has been deleted.`
              );
              // The real-time listener will automatically update the UI
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("Error", "Failed to delete user.");
            }
          },
        },
      ]
    );
  };

  const filteredApplicants = applicants.filter((applicant) =>
    applicant.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

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
      {/* 🧩 Header (no changes) */}
      <Text style={styles.title}>JobSwipe</Text>
      <Image
        source={require("../../assets/images/jobswipe-v3-2.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.adminText}>Admin</Text>
      <Text style={styles.dashboardTitle}>Modify Applicants</Text>

      {/* 🧩 Search Bar (no changes) */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by email..."
          value={searchEmail}
          onChangeText={setSearchEmail}
        />
      </View>

      {/* 🧩 Table */}
      {/* 🔄 UPDATED: This ScrollView handles VERTICAL scrolling */}
      <ScrollView style={styles.tableContainer}>
        {/* ➕ ADDED: This ScrollView handles HORIZONTAL scrolling */}
        <ScrollView horizontal={true} contentContainerStyle={styles.tableContent}>
          <View>
            {/* Header Row */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.colName]}>Name</Text>
              <Text style={[styles.headerCell, styles.colSex]}>Sex</Text>
              <Text style={[styles.headerCell, styles.colAge]}>Age</Text>
              <Text style={[styles.headerCell, styles.colLocation]}>Location</Text>
              <Text style={[styles.headerCell, styles.colEmail]}>Email</Text>
              <Text style={[styles.headerCell, styles.colActions]}>Actions</Text>
            </View>

            {/* Data Rows */}
            {loading ? (
              <Text style={styles.loadingText}>Loading applicants...</Text>
            ) : filteredApplicants.length > 0 ? (
              filteredApplicants.map((applicant, index) => (
                <View
                  key={applicant.id || index}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  <Text style={[styles.dataCell, styles.colName]}>
                    {`${applicant.lastName} ${applicant.firstName}`}
                  </Text>
                  <Text style={[styles.dataCell, styles.colSex]}>{applicant.sex}</Text>
                  <Text style={[styles.dataCell, styles.colAge]}>{applicant.age}</Text>
                  <Text style={[styles.dataCell, styles.colLocation]}>{applicant.address}</Text>
                  <Text style={[styles.dataCell, styles.colEmail]}>{applicant.email}</Text>
                  <View style={[styles.actionCell, styles.colActions]}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        handleDeleteUser(
                          applicant.id,
                          `${applicant.firstName} ${applicant.lastName}`
                        )
                      }
                    >
                      <Ionicons name="trash-bin" size={18} color="#fff" />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.loadingText}>No applicants found.</Text>
            )}
          </View>
        </ScrollView>
      </ScrollView>

      {/* 🧩 Button (no changes) */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

// ... STYLES
const styles = StyleSheet.create({
  // ... (All previous styles: background, title, logo, etc. are unchanged)
  // ...
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
    top: 250,
    fontSize: 30,
    fontWeight: "bold",
    color: "#0c1c47",
    marginBottom: 30,
  },

  // 🧩 Search Bar
  searchContainer: {
    position: "absolute",
    top: 320,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 30,
    paddingHorizontal: 20,
    width: 400,
    height: 50,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },

  // 🧩 Table
  tableContainer: {
    position: "absolute",
    top: 400,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: 400,
    maxHeight: 300,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    marginBottom: 40,
  },
  // ➕ ADDED: This ensures the horizontal scroll works
  tableContent: {
    paddingHorizontal: 0, // Let the inner view handle padding
    // The inner <View> will naturally expand
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f3f3f3",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center", // Align items vertically
  },
  evenRow: {
    backgroundColor: "#ffffff",
  },
  oddRow: {
    backgroundColor: "#f9f9f9",
  },
  // 🔄 UPDATED: Styles for fixed-width cells
  headerCell: {
    fontSize: 14,
    color: "#222",
    fontWeight: "bold",
    // width: 150, // <-- REMOVE THIS
    paddingHorizontal: 5,
  },
  // 🔄 UPDATED: Remove 'width: 150'
  dataCell: {
    fontSize: 14,
    color: "#222",
    // width: 150, // <-- REMOVE THIS
    paddingHorizontal: 5,
  },
  // 🔄 UPDATED: Remove 'width: 150'
  actionCell: {
    // width: 150, // <-- REMOVE THIS
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  colName: {
    width: 180,
  },
  colSex: {
    width: 60,
  },
  colAge: {
    width: 60,
  },
  colLocation: {
    width: 200,
  },
  colEmail: {
    width: 220,
  },
  colActions: {
    width: 100,
  },
  // ➕ ADDED: Delete button styles
  deleteButton: {
    flexDirection: "row",
    backgroundColor: "#e74c3c",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  loadingText: {
    textAlign: "center",
    padding: 20,
    fontSize: 16,
    color: "#555",
    width: 400, // Ensure it fills the container
  },

  // 🧩 Buttons
  actionButton: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "#0c1c47",
    width: 250,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});
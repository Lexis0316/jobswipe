// saved.tsx (UPDATED FILE)
import { AntDesign, Ionicons } from "@expo/vector-icons"; // 👈 ADDED Ionicons
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query, // 👈 ADDED
  serverTimestamp,
  setDoc, // 👈 ADDED
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Header } from "../../src/components/header";
import { auth, db } from "../../src/data/firebaseConfig";
import { COLORS } from "../../src/styles/theme";

// --- Types ---
// 👇 UPDATED to include all user profile fields
type CurrentUser = {
  uid: string;
  type: "applicant" | "company";
  name?: string;
  lastName?: string;
  companyName?: string;
  profileImage?: string | null;
  skills?: string[];
  location?: string;
  // ... any other fields from your user document
};

// This is the same type from pending.tsx
type SavedProfile = {
  id: string; // This is the UID of the saved profile
  name: string;
  profileImage: string | null;
  // Applicant fields
  lastName?: string;
  skills?: string[];
  // Company fields
  companyName?: string;
  location?: string;
};

export default function SavedScreen() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Get the logged-in user (This fetches the full user doc)
  useEffect(() => {
    const fetchUser = async () => {
      const userAuth = auth.currentUser;
      if (!userAuth) {
        const userData = await AsyncStorage.getItem("currentUser");
        if (userData) {
          const parsedData = JSON.parse(userData);
          setCurrentUser({ ...parsedData, uid: userAuth?.uid || parsedData.uid });
        }
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", userAuth.uid);
      const unsubscribe = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const liveUserData = docSnap.data();
            // 👇 This now sets the full user profile
            setCurrentUser({ ...(liveUserData as CurrentUser), uid: userAuth.uid });
          } else {
            setCurrentUser(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching user snapshot:", error);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    };
    fetchUser();
  }, []);

  // 2. Fetch all saved profiles
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true); // 👈 Set loading true when fetching
    const savedRef = collection(db, "users", currentUser.uid, "savedProfiles");
    const q = query(savedRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const profiles: SavedProfile[] = [];
      snapshot.forEach((doc) => {
        profiles.push({ id: doc.id, ...doc.data() } as SavedProfile);
      });
      setSavedProfiles(profiles);
      setLoading(false); // 👈 Set loading false after fetch
    }, (error) => {
      console.error("Error fetching saved profiles:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

// 3. Handle removing a saved profile
  const removeFromSaved = async (id: string) => {
    if (!currentUser) return;

    // 👇 ADD ALERT WRAPPER
    Alert.alert(
      "Remove Profile?",
      "Are you sure you want to remove this profile from your saved list?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            // This is your original logic
            const savedProfileRef = doc(db, "users", currentUser.uid, "savedProfiles", id);
            try {
              await deleteDoc(savedProfileRef);
            } catch (error) {
              console.error("Error removing saved profile: ", error);
            }
          },
        },
      ]
    );
  };

  // 👇 4. NEW: Handle creating the match
  const handleCreateMatch = async (savedProfile: SavedProfile) => {
    if (!currentUser) return;

    // 👇 ADD ALERT WRAPPER
    Alert.alert(
      "Start Chat?",
      "Do you want to start a chat with this profile? This will move them from 'Saved' to your 'Chats'.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Chat",
          style: "default",
          onPress: async () => {
            // This is your original logic
            // 1. Create consistent Match ID (sorted UIDs)
            const [uid1, uid2] = [currentUser.uid, savedProfile.id].sort();
            const matchId = `${uid1}_${uid2}`;
            const matchRef = doc(db, "matches", matchId);

            // 2. Prepare profile objects for the match doc
            const { uid, type, ...currentUserProfileData } = currentUser;
            const { id, ...savedUserProfileData } = savedProfile;

            // 3. Define the match document
            const matchData = {
              users: [currentUser.uid, savedProfile.id],
              userProfiles: {
                [currentUser.uid]: currentUserProfileData,
                [savedProfile.id]: savedUserProfileData,
              },
              lastMessage: {
                text: "You are now connected!",
                timestamp: serverTimestamp(),
              },
              lastSender: "system",
              type: "direct",
            };

            try {
              // 4. Create the match document
              await setDoc(matchRef, matchData);
              // 5. Remove from saved profiles (it's a match now)
              await removeFromSaved(savedProfile.id); // Call the original remove logic
            } catch (error) {
              console.error("Error creating match:", error);
            }
          },
        },
      ]
    );
  };

  // 5. Determine what to show on the card
  const getCardDetails = (item: SavedProfile) => {
    if (currentUser?.type === "company") {
      // A Company saved an Applicant
      return {
        name: item.name || "Applicant",
        subtitle: (Array.isArray(item.skills) && item.skills.length > 0)
          ? item.skills.join(", ")
          : "No skills",
      };
    } else {
      // An Applicant saved a Company
      return {
        name: item.companyName || "Company",
        subtitle: item.location || "No location",
      };
    }
  };

  // 6. Render the list item (MODIFIED)
  const renderItem = ({ item }: { item: SavedProfile }) => {
    const { name, subtitle } = getCardDetails(item);

    return (
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Image
            source={
              item.profileImage
                ? { uri: item.profileImage }
                : require("../../assets/images/profile.png") // Fallback
            }
            style={styles.avatar}
          />
          {/* 👇 Added text container for better layout */}
          <View style={styles.infoTextContainer}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.details} numberOfLines={2}>{subtitle}</Text>
          </View>
        </View>

        {/* 👇 Added container for buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => handleCreateMatch(item)}
            style={styles.iconButton}
          >
            <Ionicons name="chatbubble-ellipses" size={26} color={COLORS.primary || "#007BFF"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeFromSaved(item.id)}
            style={styles.iconButton}
          >
            <AntDesign name="heart" size={24} color={COLORS.primary || "#E53935"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && savedProfiles.length === 0) { // 👈 Only show full loading first time
    return (
      <View style={styles.screen}>
        <Header />
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={COLORS.textDark} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.headerText}>Saved Profiles</Text>
        <Text style={styles.sectionTitle}>Your Saved Profiles</Text>
        <FlatList
          data={savedProfiles}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No saved profiles yet.</Text>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        />
      </View>
    </View>
  );
}

// STYLES (Copied from your saved.tsx and adjusted)
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS?.lightGreyBackground || "#f5f5ff",
  },
  container: {
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 25,
    marginTop: 18,
    height: Platform.OS === "ios" ? '86%' : '0%',
    flex: Platform.OS === "ios" ? 0 : 1,
    width: Platform.OS === "ios" ? '92%' : '91%',
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    color: COLORS?.textDark || "#000",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS?.lightGreyCard || "#f6f6f6",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10, // Added for spacing
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // 👈 Allow this side to grow and shrink
    overflow: "hidden", // 👈 Prevent content from overflowing
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 12,
  },
  // 👇 NEW: Container for text
  infoTextContainer: {
    flex: 1, // Take remaining space
    marginRight: 8, // Add space before buttons
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS?.textDark || "#000",
  },
  details: {
    color: COLORS?.grayText || "gray",
    fontSize: 14,
    flexShrink: 1, // Allow text to shrink/wrap
  },
  // 👇 NEW: Container for buttons
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  // 👇 NEW: Style for icon buttons
  iconButton: {
    padding: 4,
    marginLeft: 8, // Space between buttons
  },
  emptyText: {
    textAlign: "center",
    color: COLORS?.grayText || "#888",
    marginTop: 20,
  },
    headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS?.textDark || "#000",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    color: COLORS?.grayText || "#666",
    marginBottom: 12,
  },
});
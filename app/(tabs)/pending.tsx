// pending.tsx (STYLES UPDATED)
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image, // Kept for platform-specific logic if needed, but removed from styles
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Header } from "../../src/components/header";
import { auth, db } from "../../src/data/firebaseConfig";
import { COLORS } from "../../src/styles/theme";

// --- Types ---
type CurrentUser = {
  uid: string;
  type: "applicant" | "company";
  // ... any other fields
};

type PendingLike = {
  id: string; // This is the UID of the person who liked you
  name: string;
  profileImage: string | null;
  timestamp: any;
  // Applicant fields
  lastName?: string;
  skills?: string[];
  // Company fields
  companyName?: string;
  location?: string;
};

// ========================== MAIN COMPONENT =========================
export default function PendingScreen() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [pendingLikes, setPendingLikes] = useState<PendingLike[]>([]);
  const [pastMatches, setPastMatches] = useState<PendingLike[]>([]);
  
  // 👇 MODIFIED: Split loading state for a better user experience
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingPast, setLoadingPast] = useState(true);

  // 1. Get the logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const userAuth = auth.currentUser;
      if (!userAuth) {
        const userData = await AsyncStorage.getItem("currentUser");
        if (userData) {
          const parsedData = JSON.parse(userData);
          setCurrentUser({ ...parsedData, uid: userAuth?.uid || parsedData.uid });
        }
        // 👇 MODIFIED: Set both loaders
        setLoadingPending(false);
        setLoadingPast(false);
        return;
      }

      const userDocRef = doc(db, "users", userAuth.uid);
      const unsubscribe = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const liveUserData = docSnap.data();
            setCurrentUser({ ...liveUserData, uid: userAuth.uid });
          } else {
            setCurrentUser(null);
            // 👇 MODIFIED: Set both loaders if no user
            setLoadingPending(false);
            setLoadingPast(false);
          }
          // Note: We let the *other* useEffects handle setting their
          // respective loading states to false on success.
        },
        (error) => {
          console.error("Error fetching user snapshot:", error);
          // 👇 MODIFIED: Set both loaders on error
          setLoadingPending(false);
          setLoadingPast(false);
        }
      );
      return () => unsubscribe();
    };
    fetchUser();
  }, []);

  // 2. Fetch all users who liked you
  useEffect(() => {
    if (!currentUser) return;

    setLoadingPending(true); // Use pending loader
    const likesRef = collection(db, "users", currentUser.uid, "likesReceived");
    const q = query(likesRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const likes: PendingLike[] = [];
      snapshot.forEach((doc) => {
        likes.push({ id: doc.id, ...doc.data() } as PendingLike);
      });
      setPendingLikes(likes);
      setLoadingPending(false); // Use pending loader
    }, (error) => {
      console.error("Error fetching pending likes:", error);
      setLoadingPending(false); // Use pending loader on error
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 3. Fetch all past (rejected) matches
  useEffect(() => {
    if (!currentUser) return;

    setLoadingPast(true); // Use past loader
    const rejectedRef = collection(db, "users", currentUser.uid, "rejectedLikes");
    const q = query(rejectedRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rejected: PendingLike[] = [];
      snapshot.forEach((doc) => {
        rejected.push({ id: doc.id, ...doc.data() } as PendingLike);
      });
      setPastMatches(rejected);
      setLoadingPast(false); // Use past loader
    }, (error) => {
      console.error("Error fetching past matches:", error);
      setLoadingPast(false); // Use past loader on error
    });

    return () => unsubscribe();
  }, [currentUser]);

  // --- Button Handlers (No changes) ---
  const handleSaveProfile = async (like: PendingLike) => {
    if (!currentUser) return;
    const { id, ...likeData } = like; 

    try {
      const savedProfileRef = doc(db, "users", currentUser.uid, "savedProfiles", id);
      await setDoc(savedProfileRef, likeData);

      const pendingLikeRef = doc(db, "users", currentUser.uid, "likesReceived", id);
      await deleteDoc(pendingLikeRef);

      Alert.alert("Added to Saved");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Could not save profile.");
    }
  };

  const handleRemoveFromPast = async (like: PendingLike) => {
    if (!currentUser) return;
    const { id } = like;

    try {
      const rejectedLikeRef = doc(db, "users", currentUser.uid, "rejectedLikes", id);
      await deleteDoc(rejectedLikeRef);
      Alert.alert("Removed in Past Matches");
    } catch (error) {
      console.error("Error removing past match:", error);
      Alert.alert("Error", "Could not remove past match.");
    }
  };

  const handleRejectProfile = async (like: PendingLike) => {
    if (!currentUser) return;
    const { id, ...likeData } = like;

    try {
      const rejectedLikeRef = doc(db, "users", currentUser.uid, "rejectedLikes", id);
      await setDoc(rejectedLikeRef, { ...likeData, timestamp: serverTimestamp() });

      const pendingLikeRef = doc(db, "users", currentUser.uid, "likesReceived", id);
      await deleteDoc(pendingLikeRef);

      Alert.alert("Moved to Past Matches");
    } catch (error) {
      console.error("Error rejecting profile:", error);
      Alert.alert("Error", "Could not move profile.");
    }
  };

  // 4. Render the profile card (No changes)
  const renderProfileCard = (like: PendingLike, isPending: boolean) => {
    let title = "";
    let subtitle = "";

    if (currentUser?.type === "company") {
      title = like.name || "Applicant";
      if (Array.isArray(like.skills) && like.skills.length > 0) {
        subtitle = like.skills.join(", ");
      } else {
        subtitle = "No skills listed";
      }
    } else {
      title = like.companyName || "Company";
      subtitle = like.location || "No location listed";
    }

    const hasValidImage = typeof like.profileImage === "string" && like.profileImage;

    return (
      <View key={like.id} style={styles.cardTouchable}>
        <View style={styles.cardContainer}>
          <View style={styles.cardImageContainer}>
            {hasValidImage ? (
              <Image
                source={{ uri: like.profileImage! }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderImageText}>No Profile</Text>
                <Text style={styles.placeholderImageText}>Picture Available</Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.textContainer}>
              <Text style={styles.cardName} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            </View>

            {isPending && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.iconButton, styles.saveButton]}
                  onPress={() => handleSaveProfile(like)}
                >
                  <AntDesign name="check" size={14} color="#4BDE97" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, styles.rejectButton]}
                  onPress={() => handleRejectProfile(like)}
                >
                  <AntDesign name="close" size={14} color="#F06060" />
                </TouchableOpacity>
              </View>
            )}

            {!isPending && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleRemoveFromPast(like)}
                >
                  <AntDesign name="close" size={14} color="#F06060" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // --- RENDER (JSX Updated) ---
  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        // 👇 MODIFIED: This content container handles the padding for the whole screen
        contentContainerStyle={styles.scrollContainer}
      >
        
        {/* =================================== */}
        {/* 👇 NEW: Pending Matches Container  */}
        {/* =================================== */}
        <View style={styles.sectionContainer}>
          <Text style={styles.headerText}>Pending Matches</Text>

          {loadingPending && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={COLORS.textDark}
                style={{ marginTop: 20 }}
              />
            </View>
          )}

          {!loadingPending && pendingLikes.length === 0 && (
            <Text style={styles.emptyText}>
              No one has swiped right on you yet.
            </Text>
          )}

          {!loadingPending && pendingLikes.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardListContainer}
            >
              {pendingLikes.map((like) => renderProfileCard(like, true))}
            </ScrollView>
          )}
        </View>

        {/* ================================= */}
        {/* 👇 NEW: Past Matches Container   */}
        {/* ================================= */}
        <View style={[styles.sectionContainer2, { marginTop: -6.5 }]}>
          {/* 👇 MODIFIED: Using headerText style for consistency */}
          <Text style={styles.headerText}>Past Matches</Text>

          {loadingPast && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={COLORS.textDark}
                style={{ marginTop: 20 }}
              />
            </View>
          )}

          {!loadingPast && pastMatches.length === 0 && (
            <Text style={styles.emptyText}>No past matches to show.</Text>
          )}

          {!loadingPast && pastMatches.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardListContainer}
            >
              {pastMatches.map((like) => renderProfileCard(like, false))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ========================== STYLES =========================
const styles = StyleSheet.create({
  // --- Screen style ---
  screen: {
    flex: 1,
    backgroundColor: COLORS?.lightGreyBackground || "#f5f5ff",
  },
  // 👇 NEW: Container for the main ScrollView
  scrollContainer: {
    paddingHorizontal: "4%", // Replaces width: '92%'
    paddingVertical: 18,
    flexGrow: 1,
  },
  // 👇 RENAMED & MODIFIED: This is the style for each white "card" section
  sectionContainer: {
    backgroundColor: "#fff",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    // --- REMOVED ---
    // All flex, height, width, alignSelf, and margin properties
    // were removed to make this a self-contained component.
  },
    sectionContainer2: {
    backgroundColor: "#fff",
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    // --- REMOVED ---
    // All flex, height, width, alignSelf, and margin properties
    // were removed to make this a self-contained component.
  },
  // --- Other container styles ---
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS?.textDark || "#000",
    marginBottom: 10,
  },
  // 👇 DELETED: sectionTitle (replaced by headerText)
  emptyText: {
    textAlign: "center",
    color: COLORS?.grayText || "#888",
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
    minHeight: 100, // Give it some space
  },

  // --- Kept from pending.tsx (for card layout) ---
  cardListContainer: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  cardTouchable: {
    width: 170,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    // --- REMOVED ---
    height: "100%", // This was a layout hack, no longer needed
  },
  cardContainer: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
  },
  cardImageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: COLORS?.grayText || "#888",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#8A8A8A",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderImageText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
  },
  cardFooter: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 80,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: COLORS?.grayText || "#666",
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 35,
    height: 35,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  rejectButton: {
    marginTop: 5,
  },
  saveButton: {
    // No change needed
  },
});
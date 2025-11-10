import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where
} from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react"; // 👈 ADD useMemo
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { Header } from "../../src/components/header";
import { auth, db } from "../../src/data/firebaseConfig";
import { COLORS } from "../../src/styles/theme";

function shuffleArray(array) {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

// -------------------------------------------------------------------
// STEP 1: CREATE A SEPARATE COMPONENT FOR YOUR FLIPPING CARD
// This lets each card manage its own flip state
// -------------------------------------------------------------------
const ProfileCard = ({ profile, currentUser }) => {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const flipCard = () => {
    if (flipped) {
      Animated.spring(flipAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      setFlipped(false);
    } else {
      Animated.spring(flipAnim, {
        toValue: 180,
        useNativeDriver: true,
      }).start();
      setFlipped(true);
    }
  };

  return (
    <TouchableOpacity onPress={flipCard} activeOpacity={0.9}>
      {/* ------------------- */}
      {/* FRONT SIDE        */}
      {/* ------------------- */}
      <Animated.View
        style={[styles.card, { transform: [{ rotateY: frontInterpolate }] }]}
      >
      <Image
      source={
        profile.profileImage // 👈 Use profileImage
          ? { uri: profile.profileImage } // 👈 Use profileImage
            : require("../../assets/images/profile.png") 
              }
            style={styles.image1}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.companyRow}>
            <Text style={styles.companyName}>
              {currentUser.type === "applicant"
                ? profile.companyName
                : `${profile.firstName} ${profile.lastName}`}
            </Text>
          </View>
          <Text style={styles.jobTitle}>
            {currentUser.type === "applicant"
              ? profile.companyAddress
              : profile.work
              ? profile.work.join(", ")
              : "N/A"}
          </Text>
          <Text style={styles.location}>
            {currentUser.type === "applicant"
              ? "Looking for: " +
                (profile.roles ? profile.roles.join(", ") : "N/A")
              : "Location: " + profile.address}
          </Text>
        </View>
      </Animated.View>

      {/* ----------------------------------------------- */}
      {/* BACK SIDE (Using your final requested layout)   */}
      {/* ----------------------------------------------- */}
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          { transform: [{ rotateY: backInterpolate }] },
        ]}
      >
      <Image
          source={
            profile.profileImage // 👈 Use profileImage
              ? { uri: profile.profileImage } // 👈 Use profileImage
             : require("../../assets/images/profile.png")
          }
          style={styles.image1}
          resizeMode="cover"
          />
        <View style={styles.overlayBack}>
          <ScrollView showsVerticalScrollIndicator={false} 
          style={{ flex: 1 }}
>
            {/* --- Header (Name & HR/Age) --- */}
            <Text style={styles.companyBackName}>
              {currentUser.type === "applicant"
                ? profile.companyName
                : `${profile.firstName} ${profile.lastName}`}
            </Text>
            <Text style={styles.hrText}>
              {currentUser.type === "applicant"
                ? `HR: ${profile.hrFirstName || ""} ${profile.hrLastName || ""}`
                : `Age: ${profile.age || "N/A"}, Sex: ${profile.sex || "N/A"}`}
            </Text>

            {/* ======================================================= */}
            {/* A. THIS IS WHAT APPLICANTS SEE (COMPANY PROFILE)        */}
            {/* ======================================================= */}
            {currentUser.type === "applicant" && (
              <>
              {/* 1. COMPANY DESC */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Company Description</Text>
                  <Text style={styles.sectionContent}>
                    {profile.bio || "No details provided."}
                  </Text>
                </View>

              {/* 2. CONTACT DETAILS */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Contact Details</Text>
                  <View style={styles.iconLine}>
                    <Image source={require("../../assets/icons/phonewhite.png")} style={styles.icon} />
                    <Text style={styles.number}>+63</Text>
                    <Text style={[styles.sectionContent, { flex: 1, textAlign: 'left' }]}>
                      {profile.phone || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.iconLine}>
                    <Image source={require("../../assets/icons/emailwhite.png")} style={styles.icon} />
                    <Text style={styles.sectionContent}>{profile.email}</Text>
                  </View>
                </View>

                {/* 3. OPEN ROLES */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Open Roles:</Text>
                  <View style={styles.rolesContainer}>
                    {profile.roles && profile.roles.length > 0 ? (
                      profile.roles.map((role: string, index: number) => (
                        <Text key={index} style={styles.role}>{role}</Text>
                      ))
                    ) : (
                      <Text style={styles.sectionContent}>No open roles listed.</Text>
                    )}
                  </View>
                </View>

                {/* 4. WORK DETAILS*/}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Work Details/Requirements</Text>
                  <View style={styles.iconLine}>
                    <Image source={require("../../assets/icons/timewhite.png")} style={styles.icon} />
                    <Text style={styles.sectionContent}>{profile.time ? profile.time.join(", ") : "N/A"}</Text>
                  </View>
                  <View style={styles.iconLine}>
                    <Image source={require("../../assets/icons/experiencewhite.png")} style={styles.icon} />
                    <Text style={styles.sectionContent}>{profile.experience || "N/A"}</Text>
                  </View>
                  <View style={styles.iconLine}>
                    <Image source={require("../../assets/icons/certificatewhite.png")} style={styles.icon} />
                    <Text style={styles.sectionContent}>{profile.certificate || "N/A"}</Text>
                  </View>
                  <View style={styles.iconLine}>
                    <Image source={require("../../assets/icons/trainingwhite.png")} style={styles.icon} />
                    <Text style={styles.sectionContent}>{profile.training || "N/A"}</Text>
                  </View>
                </View>

                {/* 5. BENEFITS */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Compensation/Benefits</Text>
                  {profile.benefits ? (
                    <View style={styles.bulletLine}>
                      <Text style={styles.bullet}>•</Text>
                        <Text style={[styles.sectionContent, { flex: 1, textAlign: 'left' }]}>
                          {profile.benefits}
                        </Text>
                    </View>
                  ) : (
                    <Text style={styles.sectionContent}>
                      No compensation details listed.
                    </Text>
                  )}
                </View>
              </>
            )}

            {/* ======================================================= */}
            {/* B. THIS IS WHAT COMPANIES SEE (APPLICANT PROFILE)       */}
            {/* (This section is now updated to your new order)         */}
            {/* ======================================================= */}
            {currentUser.type === "company" && (
              <>
                {/* 1. BIO */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Applicant Bio</Text>
                  <Text style={styles.sectionContent}>
                    {profile.bio || "No bio provided."}
                  </Text>
                </View>

                {/* 2. CONTACT */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Contact Details</Text>
                  <View style={styles.iconLine}>
                    <Image source={require("../../assets/icons/phonewhite.png")} style={styles.icon} />
                    <Text style={styles.number}>+63</Text>
                    <Text style={[styles.sectionContent, { flex: 1, textAlign: 'left' }]}>
                      {profile.phone || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.iconLine}>
                    <Image source={require("../../assets/icons/emailwhite.png")} style={styles.icon} />
                    <Text style={styles.sectionContent}>{profile.email}</Text>
                  </View>
                </View>

                {/* 3. SKILL DETAILS */}
                 <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Skills</Text>
                  <View style={styles.rolesContainer}>
                    {profile.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill: string, index: number) => (
                        <Text key={index} style={styles.role}>{skill}</Text>
                      ))
                    ) : (
                      <Text style={styles.sectionContent}>No skills listed.</Text>
                    )}
                  </View>
                </View>

                {/* 4. WORK DETAILS */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Work Details/Requirements</Text>
                  <View style={styles.iconLine}>
                    <Image source={require("../../assets/icons/workwhite.png")} style={styles.icon} />
                    <Text style={styles.sectionContent}>{profile.work ? profile.work.join(", ") : "N/A"}</Text>
                  </View>
                  <View style={styles.iconLine}>
                    <Image source={require("../../assets/icons/timewhite.png")} style={styles.icon} />
                    <Text style={styles.sectionContent}>{profile.time ? profile.time.join(", ") : "N/A"}</Text>
                  </View>
                  <View style={styles.iconLine}>
                    <Image source={require("../../assets/icons/experiencewhite.png")} style={styles.icon} />
                    <Text style={styles.sectionContent}>{profile.experience || "N/A"}</Text>
                  </View>
                  <View style={styles.iconLine}>
                    <Image source={require("../../assets/icons/certificatewhite.png")} style={styles.icon} />
                    <Text style={styles.sectionContent}>{profile.certificate || "N/A"}</Text>
                  </View>
                </View>
                
                {/* 5. ADDITIONAL INFO */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Additional Information</Text>
                  {profile.additional ? (
                    <View style={styles.bulletLine}>
                      <Text style={styles.bullet}>•</Text>
                        <Text style={[styles.sectionContent, { flex: 1, textAlign: 'left' }]}>
                    {profile.additional}
                </Text>
                </View>
                ) : (
                <Text style={styles.sectionContent}>
                  No additional Information listed.
                    </Text>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// -------------------------------------------------------------------
// STEP 2: YOUR CLEANED-UP DISCOVER PAGE
// It now uses the <Swiper> and passes data to <ProfileCard>
// -------------------------------------------------------------------
export default function DiscoverPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [cardIndex, setCardIndex] = useState(0); // 👈 ADD THIS

  // Effect to fetch the *logged-in user*
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        const userData = await AsyncStorage.getItem("currentUser");
        if (userData) setCurrentUser(JSON.parse(userData));
        return;
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const liveUserData = docSnap.data();
          setCurrentUser(liveUserData);
          AsyncStorage.setItem("currentUser", JSON.stringify(liveUserData));
        }
      });
      return () => unsubscribe();
    };

    fetchUser();
  }, []);

  // Effect to fetch the *profiles to swipe*
useEffect(() => {
    if (!currentUser || !auth.currentUser) return; // Wait until we know who the user is

    const fetchProfiles = async () => {
      const typeToFetch =
        currentUser.type === "applicant" ? "company" : "applicant";
      
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) return;

      try {
        // ==============================================
        // 1. GET ALL SEEN IDs (MODIFIED LOGIC)
        // ==============================================
        
        // Use a Set for fast lookup
        const seenIds = new Set(); 

        // A. Get profiles YOU have swiped on (from swipes collection)
        const swipesRef = collection(db, "users", currentUserId, "swipes");
        const swipesSnapshot = await getDocs(swipesRef);
        swipesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.likedUserId) {
            seenIds.add(data.likedUserId);
          }
          if (data.passedUserId) {
            seenIds.add(data.passedUserId);
          }
        });

        // B. Get profiles in your PENDING queue (from likesReceived)
        // 👇 --- NEW CODE --- 👇
        const likesReceivedRef = collection(db, "users", currentUserId, "likesReceived");
        const likesReceivedSnapshot = await getDocs(likesReceivedRef);
        likesReceivedSnapshot.forEach((doc) => {
          seenIds.add(doc.id); // doc.id is the UID of the person who liked you
        });
        // 👆 --- END NEW CODE --- 👆

        // C. Get profiles you have SAVED (from savedProfiles)
        // 👇 --- NEW CODE --- 👇
        const savedProfilesRef = collection(db, "users", currentUserId, "savedProfiles");
        const savedProfilesSnapshot = await getDocs(savedProfilesRef);
        savedProfilesSnapshot.forEach((doc) => {
          seenIds.add(doc.id); // doc.id is the UID of the saved profile
        });
        // 👆 --- END NEW CODE --- 👆

        // ==============================================

        // 2. Query for users of the opposite type
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("type", "==", typeToFetch));

        const querySnapshot = await getDocs(q);
        const fetchedProfiles: any[] = [];

// 3. Filter the results (This logic is now correct)
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentUserId && !seenIds.has(doc.id)) {
            fetchedProfiles.push({ id: doc.id, ...doc.data() });
          }
        });
        
        // 👇 --- THIS IS THE ONLY CHANGE YOU NEED --- 👇
        // Shuffle the array *before* setting the state
        const shuffledProfiles = shuffleArray(fetchedProfiles);
        setProfiles(shuffledProfiles);
        // 👆 --- END OF CHANGE --- 👆

      } catch (error) {
        console.error("Error fetching profiles: ", error);
      }
    };

    fetchProfiles();
  }, [currentUser]); // This effect depends on currentUser

const currentMatches = useMemo(() => {
    // 1. Wait for data
    if (!currentUser || !profiles || profiles.length === 0) {
      return [];
    }

    // 2. Get the top card (or return if out of bounds)
    const currentProfile = profiles[cardIndex];
    if (!currentProfile) {
      return [];
    }

    // 3. Figure out who is who
    const applicant = (currentUser.type === 'applicant') ? currentUser : currentProfile;
    const company = (currentUser.type === 'company') ? currentUser : currentProfile;

    // 4. Safely get the arrays (use empty array [] as fallback)
    // 👇 --- MODIFIED --- 👇
    const applicantWork = applicant?.work || []; // Changed from applicant?.skills
    // 👆 --- MODIFIED --- 👆
    const applicantTime = applicant?.time || [];
    const companyRoles = company?.roles || [];
    const companyTime = company?.time || []; // Assuming company lists their shifts in 'time'

    // 5. Find the intersections
    // 👇 --- MODIFIED --- 👇
    const matchingWorkRoles = applicantWork.filter(work => companyRoles.includes(work));
    // 👆 --- MODIFIED --- 👆
    const matchingShifts = applicantTime.filter(shift => companyTime.includes(shift));

    // 6. Return all matches
    // 👇 --- MODIFIED --- 👇
    return [...matchingWorkRoles, ...matchingShifts];
    // 👆 --- MODIFIED --- 👆

  }, [cardIndex, profiles, currentUser]); // This re-runs when the card or user changes

  // --- SWIPE HANDLERS ---
  //
  // 👇 ================== THIS IS THE CORRECTED FUNCTION ================== 👇
  //
  // REPLACE your old handleSwipeRight with this one
  const handleSwipeRight = async (cardIndex: number) => {
    if (!auth.currentUser || !currentUser) return;

    const swipedProfile = profiles[cardIndex];
    const swiperId = auth.currentUser.uid;
    const swipedUserId = swipedProfile.id;

    try {
      // 1. Record the "like" in your own "swipes" collection
      // (This prevents you from seeing them again)
      const swipeRef = collection(db, "users", swiperId, "swipes");
      await addDoc(swipeRef, {
        likedUserId: swipedUserId,
        timestamp: serverTimestamp(),
      });

      // 2. Check if the other user has liked you (to see if it's a match)
      const otherUserSwipesRef = collection(db, "users", swipedUserId, "swipes");
      const q = query(otherUserSwipesRef, where("likedUserId", "==", swiperId));
      const querySnapshot = await getDocs(q);

      // ===============================================
      // 👇 START OF NEW LOGIC
      // ===============================================

      if (!querySnapshot.empty) {
        // 3. IT'S A MATCH!
        console.log("MATCH! You both liked each other.");

        // A. Create the Match document for chat
        const matchId = [swiperId, swipedUserId].sort().join("_");
        const swiperName = currentUser.type === 'applicant' ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.companyName;
        const swipedName = swipedProfile.type === 'applicant' ? `${swipedProfile.firstName} ${swipedProfile.lastName}` : swipedProfile.companyName;

        await setDoc(doc(db, "matches", matchId), {
          users: [swiperId, swipedUserId],
          userProfiles: {
            [swiperId]: { name: swiperName, profileImage: currentUser.profileImage || null },
            [swipedUserId]: { name: swipedName, profileImage: swipedProfile.profileImage || null },
          },
          createdAt: serverTimestamp(),
          lastMessage: { text: "You matched! Say hi.", timestamp: serverTimestamp() },
        });

        // B. Clean up the "pending like" from the other user
        // (This removes them from *your* pending list)
        await deleteDoc(doc(db, "users", swiperId, "likesReceived", swipedUserId));

        alert("It's a Match!");

      } else {
        // 4. IT'S NOT A MATCH (YET)
        // Create a "pending like" for the *other user*
        console.log("You liked:", swipedProfile.id, ". They will be notified.");

        // A. Get the info to show on their pending screen
        let swiperInfoForPending;
        if (currentUser.type === 'applicant') {
          // I am an applicant, send my info
          swiperInfoForPending = {
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            lastName: currentUser.lastName,
            skills: currentUser.skills || [],
            profileImage: currentUser.profileImage || null,
          };
        } else {
          // I am a company, send my info
          swiperInfoForPending = {
            name: currentUser.companyName,
            companyName: currentUser.companyName,
            location: currentUser.companyAddress,
            profileImage: currentUser.profileImage || null,
          };
        }

        // B. Create the document in their "likesReceived" subcollection
        const likeReceivedRef = doc(db, "users", swipedUserId, "likesReceived", swiperId);
        await setDoc(likeReceivedRef, {
          ...swiperInfoForPending,
          timestamp: serverTimestamp(),
          swiperId: swiperId,
        });
      }
      // ===============================================
      // 👆 END OF NEW LOGIC
      // ===============================================

    } catch (error) {
      console.error("Error handling swipe:", error);
    }
  };

// --- UPDATED FUNCTION ---
  const handleSwipeLeft = async (cardIndex: number) => { // 1. Add async
    if (!auth.currentUser) return; // 2. Add guard clause

    const swipedProfile = profiles[cardIndex];
    const swiperId = auth.currentUser.uid;
    const swipedUserId = swipedProfile.id;

    try {
      // 3. Record the "pass" in the database
      const swipeRef = collection(db, "users", swiperId, "swipes");
      await addDoc(swipeRef, {
        passedUserId: swipedUserId, // 4. Use "passedUserId"
        timestamp: serverTimestamp(),
      });
      console.log("You passed on:", swipedProfile.id);
    } catch (error) {
      console.error("Error handling swipe left:", error);
    }
  };

  // --- LOADING VIEW ---
  if (!currentUser || profiles.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading profiles...</Text>
      </View>
    );
  }

  // --- MAIN RENDER ---
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS?.lightGreyBackground || "#f5f5f5",
      }}
    >
      <Header />
      <View style={styles.container}>
        {/* THIS IS THE SWIPER */}
      <Swiper
          cards={profiles}
          renderCard={(profile) => { // 'profile' is the data for the current card
            return (
              <ProfileCard profile={profile} currentUser={currentUser} />
            );
          }}
          
          // 👇 This is the CORRECT set of props
          cardIndex={cardIndex} // 1. Tell the swiper which index to show
          onSwipedRight={(index) => {
            handleSwipeRight(index);
            setCardIndex(index + 1); // 2. Advance index
          }}
          onSwipedLeft={(index) => {
            handleSwipeLeft(index);
            setCardIndex(index + 1); // 3. Advance index
          }}
          
          // 🚨 DELETE the 3 duplicate lines that were here
          
          onSwipedAll={() => console.log("No more profiles")}
          backgroundColor={"#f5f5f5"} // Background of the screen
          stackSize={3}
          stackSeparation={15}
          animateCardOpacity
          verticalSwipe={false}
          containerStyle={styles.swiperContainer}
        />

        <View style={styles.bottomBar}>
          {/* This <View> will ONLY appear if there are matches */}
          {currentMatches.length > 0 && (
            <View style={styles.rectangle8}> 
              <Text style={styles.matchText}>
                <Text style={styles.bold}>Match:</Text>{" "}
                <Text style={styles.italic}>
                  {currentMatches.join(", ")}
                </Text>
              </Text>
            </View>
          )}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  image2: {
    marginLeft: 5, // space between text and icon
    width: 22,
    height: 22,
    
  },
    rectangle8: {
    backgroundColor: "#fefefe",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    paddingVertical: 12,   
    paddingHorizontal: 16,
    marginBottom: 15,     
    alignItems: 'center',
    width: Platform.OS === "ios" ? "85%" : "82%",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 15,
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    alignSelf: "center",  // centers the card horizontally
  height: Platform.OS === "ios" ? "95.5%" : "97%",
  top: Platform.OS === "ios" ? -40 : -20,
  },
  cardBack: {
    position: "absolute",
    backgroundColor: "#f7f7f7",
    height: Platform.OS === "ios" ? "95.5%" : "97%",
    width: "100%",  // 👈 ADD THIS
  },
  image1: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  overlay: {
    position: "absolute",
    bottom: 70,
    left: 20,
  },
  overlayBack: {
  position: "absolute",
  backgroundColor: "rgba(0,0,0,0.4)", // translucent overlay
  borderRadius: 15,
  padding: 16,
  alignSelf: "center",  // centers the card horizontally
  width: "100%",  // 👈 ADD THIS
  height: "100%",  // 👈 ADD THIS
},
  companyName: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "700",
    textShadowColor: "#00000080",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
    companyBackName: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "700",
    textShadowColor: "#00000080",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 10,
  },
  jobTitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#fff",
    textShadowColor: '#000000ff',
    textShadowOffset: { width: 0.5, height: 0.5 }, // offset of shadow
    textShadowRadius: 1, // blur radius
  },
  location: {
    marginTop: 6,
    fontSize: 15,
    color: "#fff",
    textShadowColor: '#000000ff',
    textShadowOffset: { width: 0.5, height: 0.5 }, // offset of shadow
    textShadowRadius: 1, // blur radius
  },


  bottomBar: {
    position: 'absolute', 
    bottom: Platform.OS === "ios" ? -772 : -680,           
    zIndex: 10,           
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },

  swiperContainer: {
    flex: 1,
    width: '100%',
  },

matchText: {
    fontSize: 12.5,
    color: "#000000ff",
    // NO position: "absolute"
    // NO marginTop
  },
  
  bold: { fontWeight: "700" },
  italic: { fontStyle: "italic" },

  hrText: {
  fontSize: 14,
  color: "#e0e0e0",
  marginBottom: 15,
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: Platform.OS === "ios" ? 10 : 7,   
    marginBottom: 20,
  },
  sectionTitle: {
  fontWeight: "700",
  color: "#fff",
  fontSize: 14,
  marginBottom: 4,
},

sectionContent: {
  color: "#e8e8e8",
  fontSize: 13,
  lineHeight: Platform.OS === "ios" ? 18 : 15,   
},
rolesContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
},

role: {
  backgroundColor: "rgba(255,255,255,0.2)",
  borderRadius: 8,
  paddingHorizontal: 8,
  paddingVertical: 4,
  color: "#fff",
  fontSize: 13,
  marginRight: 6,
  marginBottom: 6,
},
// ADD THIS STYLE
  iconLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6, // space between lines
  },

  // ADD THIS STYLE
  icon: {
    width: 18,
    height: 18,
    marginRight: 6,

  },
bulletLine: {
    flexDirection: "row",
    alignItems: "flex-start", 
    marginBottom: 5,
    paddingHorizontal: 5, 
  },
  bullet: {
    color: "#e8e8e8",
    fontSize: 13,
    lineHeight: 18,
    marginRight: 8,
    fontWeight: 'bold',
  },
  number: {
    color: "#e8e8e8",
    fontSize: 13,
    lineHeight: 18,
    marginRight: 8,
  },
});
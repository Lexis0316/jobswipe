// chats.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Header } from "../../src/components/header";
import { COLORS } from "../../src/styles/theme";

// --- Firebase Imports ---
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../src/data/firebaseConfig"; // 👈 Make sure this path is correct

// --- Types ---
// This is the shape of your user object from DiscoverPage
type CurrentUser = {
  uid: string;
  type: "applicant" | "company";
  firstName?: string;
  lastName?: string;
  companyName?: string;
  profileImage?: string;
  // ... any other fields
};

type UserProfile = {
  name?: string; // For applicants
  companyName?: string; // For companies
  profileImage: string | null;
  // ... other fields might be here, but we only need these
};

// This is the shape of the document we created in Step 1
type Match = {
  id: string; // The document ID (e.g., "uid1_uid2")
  users: string[];
  userProfiles: {
    [key: string]: UserProfile; // 👈 UPDATE THIS LINE
  };
  lastMessage: {
    text: string;
    timestamp: any; // Firestore timestamp
  };
};

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: any; // Firestore timestamp
};

// --- Main Component ---
export default function ChatApp() {
  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Get the logged-in user (similar to DiscoverPage)
  useEffect(() => {
    const fetchUser = async () => {
      const userAuth = auth.currentUser;
      if (!userAuth) {
        // Fallback to AsyncStorage if auth is not ready
        const userData = await AsyncStorage.getItem("currentUser");
        if (userData) {
          const parsedData = JSON.parse(userData);
          setCurrentUser({ ...parsedData, uid: userAuth?.uid || parsedData.uid });
        } else {
          setLoading(false);
        }
        return;
      }

      const userDocRef = doc(db, "users", userAuth.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const liveUserData = docSnap.data();
          setCurrentUser({ ...liveUserData, uid: userAuth.uid });
        }
        setLoading(false);
      });
      return () => unsubscribe();
    };

    fetchUser();
  }, []);

  // 2. Fetch all matches for this user
  useEffect(() => {
    if (!currentUser || !auth.currentUser) return;

    setLoading(true);
    const matchesRef = collection(db, "matches");
    // Query for all matches where the 'users' array contains the current user's ID
    const q = query(
      matchesRef,
      where("users", "array-contains", currentUser.uid),
      orderBy("lastMessage.timestamp", "desc") // Show newest conversations first
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMatches: Match[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMatches.push({ id: doc.id, ...doc.data() } as Match);
      });
      setMatches(fetchedMatches);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]); // Re-run if user changes

  // --- Step 1: Chat List ---
  const renderChatList = () => {
    if (loading) {
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
          <Text style={styles.headerText}>Chats</Text>
          <Text style={styles.sectionTitle}>Your Matches</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {matches.length === 0 && !loading && (
              <Text style={styles.placeholder}>
                No matches yet. Keep swiping!
              </Text>
            )}
            {matches.map((match) => {
              // Figure out who the *other* user is
              const otherUserId = match.users.find(
                (uid) => uid !== currentUser!.uid
              );
              if (!otherUserId) return null; // Should not happen

              const otherUser = match.userProfiles[otherUserId];

              const displayName = otherUser.name || otherUser.companyName || "Match";

              return (
                <TouchableOpacity
                  key={match.id}
                  style={styles.chatCard}
                  onPress={() => {
                    setSelectedMatch(match);
                    setStep(2);
                  }}
                >
                  <View style={styles.chatInfo}>
                    <Image
                      source={
                        otherUser.profileImage
                          ? { uri: otherUser.profileImage }
                          : require("../../assets/images/profile.png") // Fallback image
                      }
                      style={styles.avatar}
                    />
                    <View>
                      <Text style={styles.chatName}>{displayName}</Text>
                      <Text style={styles.chatPreview} numberOfLines={1}>
                        {match.lastMessage.text}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  // --- Step 2: Individual Chat ---
  const renderChatRoom = () => (
    <ChatRoom
      match={selectedMatch!}
      currentUser={currentUser!}
      onBack={() => {
        setStep(1);
        setSelectedMatch(null);
      }}
    />
  );

  return <>{step === 1 ? renderChatList() : renderChatRoom()}</>;
}

// --- Chat Room Component ---
type ChatRoomProps = {
  match: Match;
  currentUser: CurrentUser;
  onBack: () => void;
};

// 👇 UPDATED COMPONENT
const ChatRoom: React.FC<ChatRoomProps> = ({ match, currentUser, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  // Get the other user's info
  const otherUserId = match.users.find((uid) => uid !== currentUser.uid)!;
  const otherUser = match.userProfiles[otherUserId];

  const displayName = otherUser.name || otherUser.companyName || "Match";

  // 1. Listen for messages in this chat's subcollection
  useEffect(() => {
    // Path: /matches/{matchId}/messages
    const messagesRef = collection(db, "matches", match.id, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [match.id]);

  // 2. Handle sending a new message
  const handleSend = async () => {
    if (!input.trim()) return;
    const trimmedInput = input.trim();
    setInput(""); // Clear input immediately

    try {
      // A. Add the new message to the subcollection
      const messagesRef = collection(db, "matches", match.id, "messages");
      await addDoc(messagesRef, {
        text: trimmedInput,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
        matchUsers: [currentUser.uid, otherUserId]
      });

      // B. Update the 'lastMessage' on the parent match document
      const matchDocRef = doc(db, "matches", match.id);
      await updateDoc(matchDocRef, {
        lastMessage: {
          text: trimmedInput,
          timestamp: serverTimestamp(),
        },
      });
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const d = timestamp.toDate(); // Convert Firestore timestamp to JS Date
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    // 👇 CHANGED from <View> to <KeyboardAvoidingView>
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 15} // Adjust this value if your header height is different
    >
      <Header />
      <View style={[styles.container, { paddingTop: 15 }]}>
        {/* --- Chat Header --- */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <View style={styles.chatHeaderCenter}>
            <Text style={styles.chatHeaderTitle}>{displayName}</Text>
          </View>
        </View>

        {/* --- Messages --- */}
        <ScrollView
          style={styles.body}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 && (
            <Text style={styles.placeholder}>
              Say hi — start the conversation!
            </Text>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.uid;
            return (
              <View
                key={msg.id}
                style={[styles.message, isMe ? styles.me : styles.other]}
              >
                <Text>{msg.text}</Text>
                <Text style={styles.time}>{formatTime(msg.createdAt)}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* --- Input Box --- */}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Aa"
            value={input}
            onChangeText={setInput}
            multiline={true} // 👈 ADD THIS
            // onSubmitEditing={handleSend} // 👈 REMOVE THIS
          />
          <TouchableOpacity onPress={handleSend} disabled={!input.trim()}>
            <Image
              source={require("../../assets/icons/send.png")}
              style={{
                width: 20,
                height: 20,
                marginLeft: 8,
                marginRight: -8,
                opacity: !input.trim() ? 0.3 : 1.0,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView> // 👈 Don't forget to close it
  );
};

const styles = StyleSheet.create({

  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS?.lightGreyBackground || "#f5f5f5",
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
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS?.lightGreyCard || "#f6f6f6",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  chatInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // 👈 ADD THIS
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 12,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS?.textDark || "#000",
  },
  chatPreview: {
    color: COLORS?.grayText || "gray",
    fontSize: 14,
    flexShrink: 1, // 👈 ADD THIS
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    marginBottom: 10,
  },

  backButton: {
    fontSize: 20,
    color: "#002D72",
    zIndex: 2,
    padding: 4, // 👈 Make it easier to tap
  },

  chatHeaderCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },

  body: {
    flex: 1,
  },
  placeholder: {
    textAlign: "center",
    color: COLORS?.grayText || "#888",
    marginTop: 20,
  },
  message: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 12,
    maxWidth: "80%",
  },
  me: {
    backgroundColor: "#aedafdff",
    alignSelf: "flex-end",
  },
  other: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
  },
  time: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
    alignSelf: 'flex-end' // 👈 Make time align right
  },
  inputBox: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8, // 👈 Add vertical padding
    height: 40,
    marginLeft: -15,
  },
});
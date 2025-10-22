import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";

// ✅ Use your current LAN IP (same as backend)
const BASE_URL = "http://192.168.1.8:8000";

export default function ViewProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        const token =
          (await AsyncStorage.getItem("access")) ||
          (await AsyncStorage.getItem("userToken"));

        if (!storedUsername || !token) {
          console.error("No username or token found in storage");
          Alert.alert("Session expired", "Please log in again.");
          setLoading(false);
          router.replace("/login");
          return;
        }

        const res = await axios.get(`${BASE_URL}/api/user_profile/`, {
          params: { username: storedUsername },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.success) {
          setUser(res.data.data);
        } else {
          console.error("Error fetching profile:", res.data?.message);
          Alert.alert("Error", res.data?.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err.response?.data || err.message);
        Alert.alert("Error", "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#555" }}>No profile found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F5F5F5" />
        </TouchableOpacity>
        <Text style={styles.header}>View Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={
            user.image
              ? { uri: user.image.startsWith("http") ? user.image : `${BASE_URL}${user.image}` }
              : require("../assets/default_profile.jpg")
          }
          style={styles.profileImage}
        />

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
      </View>

      {/* Info Section */}
      <View style={styles.infoCard}>
        <Text style={styles.label}>Full Name</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{user.username}</Text>

        <Text style={styles.label}>Contact Number</Text>
        <Text style={styles.value}>{user.contactNumber}</Text>

        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>{user.address}</Text>
      </View>

      {/* Edit Button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push("(drawer)/Edit_Profile")}
      >
        <Ionicons name="create-outline" size={18} color="#fff" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ================= Styles =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#97c6d2",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  header: {
    color: "#F5F5F5",
    fontSize: 20,
    fontWeight: "700",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  username: {
    fontSize: 14,
    color: "#f0f0f0",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: "#222",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

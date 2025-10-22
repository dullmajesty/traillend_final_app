import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.8:8000";

export default function EditProfile() {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const absUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${BASE_URL}${u}`);

  const fetchProfile = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem("username");
      const token =
        (await AsyncStorage.getItem("access")) ||
        (await AsyncStorage.getItem("userToken"));

      if (!storedUsername || !token) {
        Alert.alert("Session", "Please log in again.");
        return;
      }

      const res = await fetch(
        `${BASE_URL}/api/user_profile/?username=${encodeURIComponent(storedUsername)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.success) {
        const d = data.data || {};
        setName(d.name || "");
        setUsername(d.username || "");
        setMobile(d.contactNumber || "");
        setAddress(d.address || "");
        setImage(d.image ? absUrl(d.image) : null);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch profile.");
      }
    } catch (err) {
      console.error("fetchProfile:", err);
      Alert.alert("Error", "Failed to fetch profile.");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    try {
      if (newPassword && newPassword !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }

      const token =
        (await AsyncStorage.getItem("access")) ||
        (await AsyncStorage.getItem("userToken"));

      if (!token) {
        Alert.alert("Session", "Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("username", username);
      formData.append("name", name);
      formData.append("contactNumber", mobile);
      formData.append("address", address);
      if (newPassword) formData.append("password", newPassword);

      // Only append a *new* local image (not an existing http URL)
      if (image && !image.startsWith("http")) {
        formData.append("profile_image", {
          uri: image,
          name: "profile.jpg",
          type: "image/jpeg",
        });
      }

      const res = await fetch(`${BASE_URL}/api/update_profile/`, {
        method: "POST",
        headers: {
          // IMPORTANT: don't set Content-Type for FormData; fetch will set the boundary
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        // Show backend message if available
        Alert.alert("Error", data?.message ? String(data.message) : `Update failed (${res.status})`);
        return;
      }

      if (data.success) {
        Alert.alert("Success", "Profile updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
        fetchProfile(); // refresh to get the new image URL, etc.
      } else {
        Alert.alert("Error", data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("handleSave:", err);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
        <Image
          source={image ? { uri: image } : require("../../assets/default_profile.jpg")}
          style={styles.profileImage}
        />
        <View style={styles.editIconContainer}>
          <Ionicons name="create-outline" size={18} color="#fff" />
        </View>
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Username" value={username} editable={false} />
      <TextInput style={styles.input} placeholder="Contact Number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />

      <TextInput
        style={styles.input}
        placeholder="New Password (optional)"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#97c6d2" },
  profileImage: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: "#fff",
    alignSelf: "center", marginBottom: 20,
  },
  editIconContainer: {
    position: "absolute", bottom: 15, right: 120, width: 28, height: 28,
    alignItems: "center", justifyContent: "center", backgroundColor: "#4A90E2",
    borderRadius: 14, borderWidth: 1, borderColor: "#fff",
  },
  input: {
    backgroundColor: "#fff", padding: 10, borderRadius: 8, marginVertical: 5,
  },
  saveButton: {
    backgroundColor: "#4A90E2", padding: 12, borderRadius: 8, marginTop: 10, alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "600" },
});

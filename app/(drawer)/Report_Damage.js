import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "../../lib/authStorage"; // ✅ use your helper

export default function DamageReport() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("");
  const [quantityAffected, setQuantityAffected] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!location || !quantityAffected || !description || !image) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    if (parseInt(quantityAffected) <= 0) {
      Alert.alert("Error", "Quantity affected must be at least 1.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Get access token from AsyncStorage
      const auth = await getAuth();
      const token = auth?.accessToken;

      if (!token) {
        Alert.alert("Not logged in", "Please log in again.");
        setLoading(false);
        return;
      }

      // ✅ Use your direct Django API URL here
      const apiURL = "http://10.178.38.115:8000/api/damage-report/"; // change IP to match your PC

      const formData = new FormData();
      formData.append("location", location);
      formData.append("quantity_affected", quantityAffected);
      formData.append("description", description);
      formData.append("image", {
        uri: image,
        name: "damage.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log("📩 Server response:", data);

      if (data.status === "success") {
        Alert.alert("✅ Success", "Damage report submitted successfully!");
        setImage(null);
        setLocation("");
        setQuantityAffected("");
        setDescription("");
      } else {
        Alert.alert("Error", data.message || "Submission failed.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert("Network Error", "Unable to submit report. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#4FC3F7", "#1E88E5"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Ionicons name="warning-outline" size={28} color="#fff" />
            <Text style={styles.subtitle}>
              Please report any damaged or missing items accurately.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.note}>
              ⚠️ Be detailed — include location, quantity, and description of the issue.
            </Text>

            <Text style={styles.label}>Upload Damage Image</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="cloud-upload-outline" size={18} color="#1976D2" />
              <Text style={styles.uploadText}>
                {image ? "Change Image" : "Choose Image"}
              </Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={styles.preview} />}

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5 chairs in front row"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.label}>Quantity Affected</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3"
              placeholderTextColor="#999"
              value={quantityAffected}
              onChangeText={setQuantityAffected}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Describe the Damage</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: "top" }]}
              placeholder="e.g. Chairs are broken and need repair"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={["#64B5F6", "#1976D2"]}
                style={styles.submitGradient}
              >
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitText}>
                  {loading ? "Submitting..." : "Submit Report"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 20 },
  subtitle: {
    color: "#e3f2fd",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  note: {
    color: "#1976D2",
    fontSize: 13,
    marginBottom: 15,
    fontWeight: "500",
  },
  label: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 6 },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#90CAF9",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#E3F2FD",
    marginBottom: 10,
  },
  uploadText: { color: "#1976D2", fontWeight: "600" },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#F7F9FC",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 14,
    color: "#000",
  },
  submitButton: { marginTop: 5, borderRadius: 12, overflow: "hidden" },
  submitGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    gap: 8,
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

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

export default function DamageReport() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("");
  const [quantityAffected, setQuantityAffected] = useState("");
  const [description, setDescription] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!location || !quantityAffected || !description || !image) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    if (parseInt(quantityAffected) <= 0) {
      Alert.alert("Error", "Quantity affected must be at least 1.");
      return;
    }

    Alert.alert("Success", "Damage report submitted successfully!");
    setImage(null);
    setLocation("");
    setQuantityAffected("");
    setDescription("");
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

          {/* Card Form */}
          <View style={styles.card}>
            <Text style={styles.note}>
              ⚠️ Note: Be detailed — include location, quantity, and description
              of the issue.
            </Text>

            {/* Upload */}
            <Text style={styles.label}>Upload Damage Image</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="cloud-upload-outline" size={18} color="#1976D2" />
              <Text style={styles.uploadText}>
                {image ? "Change Image" : "Choose Image"}
              </Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={styles.preview} />}

            {/* Location */}
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5 chairs in front row"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
            />

            {/* Quantity */}
            <Text style={styles.label}>Quantity Affected</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3"
              placeholderTextColor="#999"
              value={quantityAffected}
              onChangeText={setQuantityAffected}
              keyboardType="numeric"
            />

            {/* Description */}
            <Text style={styles.label}>Describe the Damage</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: "top" }]}
              placeholder="e.g. Chairs are broken and need repair"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Submit */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <LinearGradient
                colors={["#64B5F6", "#1976D2"]}
                style={styles.submitGradient}
              >
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitText}>Submit Report</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ================== STYLES ==================
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 6,
  },
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
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
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
  uploadText: {
    color: "#1976D2",
    fontWeight: "600",
  },
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
  submitButton: {
    marginTop: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
  submitGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    gap: 8,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

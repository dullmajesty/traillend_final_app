import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(
        "http://192.168.1.8:8000/api/register/",
        { name, username, contactNumber, address, password, confirmPassword },
        { headers: { "Content-Type": "application/json" } }
      );
      Alert.alert(res.data.message);
      if (res.data.success) router.replace("/login");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Registration failed. Please try again.");
    }
  };

  return (
    <LinearGradient colors={["#4FC3F7", "#1E88E5"]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header / Logo */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>TrailLend</Text>
            <Text style={styles.subtitle}>
              Join our growing community 🌿
            </Text>
          </View>

          {/* Registration Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Your Account</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Address / Purok / Street"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#999"
            />

            {/* Password */}
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#1976D2"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirm(!showConfirm)}
              >
                <Ionicons
                  name={showConfirm ? "eye-off" : "eye"}
                  size={22}
                  color="#1976D2"
                />
              </TouchableOpacity>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity activeOpacity={0.9} onPress={handleSignUp}>
              <LinearGradient
                colors={["#64B5F6", "#1976D2"]}
                start={[0, 0]}
                end={[1, 0]}
                style={styles.button}
              >
                <Ionicons name="person-add-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Sign Up</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Already have account */}
            <View style={styles.loginRow}>
              <Text style={{ color: "#333" }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.loginText}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require("../assets/community.png")}
              style={styles.illustration}
              resizeMode="contain"
            />
            <Text style={styles.communityText}>
              Lending, Sharing, and Growing Together 💫
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    width: "100%",
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1976D2",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 15,
    color: "#333",
  },
  passwordWrapper: {
    position: "relative",
    marginBottom: 15,
  },
  inputPassword: {
    width: "100%",
    height: 50,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingRight: 40,
    fontSize: 15,
    color: "#333",
  },
  eyeIcon: { position: "absolute", right: 15, top: 13 },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
  loginRow: { flexDirection: "row", justifyContent: "center" },
  loginText: { color: "#1976D2", fontWeight: "700" },
  illustrationContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  illustration: {
    width: 220,
    height: 60,
    opacity: 0.9,
  },
  communityText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuth } from "../lib/authStorage";
import { LinearGradient } from "expo-linear-gradient";

const BASE_URL = "http://10.178.38.115:8000";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Remember me Load saved credentials when component mounts
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem("savedUsername");
        const savedPassword = await AsyncStorage.getItem("savedPassword");
        const savedRemember = await AsyncStorage.getItem("rememberMe");

        if (savedRemember === "true" && savedUsername && savedPassword) {
          setUsername(savedUsername);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (err) {
        console.warn("Error loading saved credentials:", err);
      }
    };
    loadSavedCredentials();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Missing fields", "Please enter both username and password.");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/api/login/`,
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      const { access, refresh } = data;

      if (!access || !refresh) {
        Alert.alert("Error", "Login failed: No tokens received");
        return;
      }

      await setAuth({ access, refresh, username });

      // Handle Remember Me
      if (rememberMe) {
        await AsyncStorage.multiSet([
          ["savedUsername", username],
          ["savedPassword", password],
          ["rememberMe", "true"],
        ]);
      } else {
        await AsyncStorage.multiRemove(["savedUsername", "savedPassword", "rememberMe"]);
      }


      //Fetch borrower info
      try {
        const borrowerRes = await fetch(`${BASE_URL}/api/me_borrower/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (borrowerRes.ok) {
          const borrowerData = await borrowerRes.json();
          await AsyncStorage.multiSet([
            ["borrowerUserID", String(borrowerData.user_id || "")],
            ["fullName", borrowerData.full_name || ""],
            ["contactNumber", borrowerData.contact_number || ""],
            ["address", borrowerData.address || ""],
          ]);
        }
      } catch (err) {
        console.warn("Error fetching borrower info:", err);
      }

      Alert.alert("Success", "Login successful!");
      router.replace("/(drawer)/AdminDashboard");
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert(
        "Login failed",
        err.response?.data?.message || "Invalid username or password"
      );
    }
  };

  return (
    <LinearGradient colors={["#4FC3F7", "#1E88E5"]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Logo + Title */}
          <View style={styles.logoContainer}>
    
            <Text style={styles.title}>TrailLend</Text>
            <Text style={styles.subtitle}>
              Empowering the Community Together 🌿
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Log In to Your Account</Text>

            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
            />

            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
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

            <View style={styles.row}>
              <View style={styles.rememberMe}>
                <Switch
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  thumbColor={rememberMe ? "#1976D2" : "#ccc"}
                />
                <Text style={{ marginLeft: 8, color: "#333" }}>Remember Me</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity activeOpacity={0.9} onPress={handleLogin}>
              <LinearGradient
                colors={["#64B5F6", "#1976D2"]}
                start={[0, 0]}
                end={[1, 0]}
                style={styles.loginButton}
              >
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Log In</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.signup}>
              <Text style={{ color: "#333" }}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={styles.signupText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Community Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require("../assets/community.png")} // 👈 optional local image (replace if needed)
              style={styles.illustration}
              resizeMode="contain"
            />
            <Text style={styles.communityText}>
              Together, we build a stronger community.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logoContainer: {
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberMe: { flexDirection: "row", alignItems: "center" },
  forgotPassword: {
    color: "#1976D2",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  loginButton: {
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
  signup: { flexDirection: "row", justifyContent: "center" },
  signupText: { color: "#1976D2", fontWeight: "700" },
  illustrationContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  illustration: {
    width: 220,
    height: 120,
    opacity: 0.9,
  },
  communityText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const res = await axios.post(
        "http://192.168.151.115:8000/api/login/",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;

      const accessToken = data.access; // JWT access token
      const refreshToken = data.refresh;

      if (!accessToken) {
        alert("Login failed: No token received");
        return;
      }

      // ✅ Save tokens to AsyncStorage
      await AsyncStorage.multiSet([
        ["accessToken", accessToken],
        ["refreshToken", refreshToken],
      ]);

      // ✅ Try fetching borrower info using the access token
      try {
        const borrowerRes = await fetch(
          "http://192.168.151.115:8000/api/me_borrower/",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (borrowerRes.ok) {
          const borrowerData = await borrowerRes.json();

          // Store borrower info for later use (optional but recommended)
          await AsyncStorage.multiSet([
            ["userID", String(borrowerData.user_id || "")],
            ["fullName", borrowerData.full_name || ""],
            ["contactNumber", borrowerData.contact_number || ""],
            ["address", borrowerData.address || ""],
          ]);
        } else {
          console.warn("Failed to fetch borrower info:", borrowerRes.status);
        }
      } catch (borrowerError) {
        console.warn("Error fetching borrower info:", borrowerError);
      }

      alert("Login successful!");
      router.replace("/(drawer)/AdminDashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>TrailLend</Text>
      <Text style={styles.subtitle}>Log In to Your Account</Text>

      {/* Username */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      {/* Password with toggle inside input */}
      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Password"
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
            size={24}
            color="#97c6d2"
          />
        </TouchableOpacity>
      </View>

      {/* Remember Me & Forgot Password */}
      <View style={styles.row}>
        <View style={styles.rememberMe}>
          <Switch value={rememberMe} onValueChange={setRememberMe} />
          <Text style={{ marginLeft: 8 }}>Remember Me</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      {/* Create Account */}
      <View style={styles.signup}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.signupText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 50, fontWeight: "bold", color: "#97c6d2" },
  subtitle: { fontSize: 16, color: "#333", marginBottom: 20 },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  passwordWrapper: { width: "100%", position: "relative", marginBottom: 15 },
  inputPassword: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 45,
  },
  eyeIcon: { position: "absolute", right: 15, top: 13 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberMe: { flexDirection: "row", alignItems: "center" },
  forgotPassword: { color: "#97c6d2", textDecorationLine: "underline" },
  button: {
    backgroundColor: "#97c6d2",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  signup: { flexDirection: "row", alignItems: "center" },
  signupText: { color: "#97c6d2", fontWeight: "bold" },
});

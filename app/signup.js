import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";


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

  const handleSignUp = () => {
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  axios.post("http://192.168.1.8:8000/api/api_register/", {
    name,
    username,
    contactNumber,
    address,
    password,
    confirmPassword
  })
  .then((res) => {
    alert(res.data.message);   // show success
    if (res.data.success) {
    router.replace("/login");  
    }
  })

  .catch((err) => {
  console.log("Error response:", err.response?.data);
  if (err.response) {
    alert(err.response.data.message);
  } else {
    alert("Something went wrong");
  }
});


};

  return (
    <View style={styles.container}>

      {/* Title */}
      <Text style={styles.title}>TrailLend</Text>
      <Text style={styles.subtitle}>Create Your Account</Text>

      {/* Name */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      {/* Username */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      {/* Contact Number */}
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={contactNumber}
        onChangeText={setContactNumber}
        keyboardType="phone-pad"
      />

      {/* Address */}
      <TextInput
        style={styles.input}
        placeholder="Address / Purok / Street"
        value={address}
        onChangeText={setAddress}
      />

      {/* Password */}
      <View style={styles.passwordWrapper}>
        <TextInput
          style={[styles.inputPassword]}
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

      {/* Confirm Password */}
      <View style={styles.passwordWrapper}>
        <TextInput
          style={[styles.inputPassword]}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirm}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirm(!showConfirm)}
        >
          <Ionicons
            name={showConfirm ? "eye-off" : "eye"}
            size={24}
            color="#97c6d2"
          />
        </TouchableOpacity>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Already have account */}
      <View style={styles.signup}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.signupText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 30, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 50, fontWeight: "bold", color: "#97c6d2" },
  subtitle: { fontSize: 16, color: "#333", marginBottom: 20 },
  input: { width: "100%", height: 50, borderColor: "#ccc", borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
  passwordWrapper: { width: "100%", position: "relative", marginBottom: 15 },
  inputPassword: { width: "100%", height: 50, borderColor: "#ccc", borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, paddingRight: 45 },
  eyeIcon: { position: "absolute", right: 15, top: 13 },
  button: { backgroundColor: "#97c6d2", width: "100%", paddingVertical: 15, borderRadius: 8, marginBottom: 20 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  signup: { flexDirection: "row", alignItems: "center" },
  signupText: { color: "#97c6d2", fontWeight: "bold" },
});

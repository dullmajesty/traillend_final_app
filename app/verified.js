import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function VerifiedRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2500); // smooth 2.5s delay before redirect
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={["#4FC3F7", "#1E88E5"]} style={styles.gradient}>
      <View style={styles.container}>
        {/* App Logo */}
        <Image
          source={require("../assets/TRAILLEND-ICON.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Check Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-done-outline" size={48} color="#fff" />
        </View>

        {/* Text */}
        <Text style={styles.title}>Email Verified!</Text>
        <Text style={styles.subtitle}>
          Your account has been successfully activated.
        </Text>

        <Text style={styles.redirectText}>
          Redirecting you to the login page...
        </Text>

        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    paddingHorizontal: 25,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 25,
  },
  iconCircle: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 60,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 25,
  },
  redirectText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 10,
  },
});

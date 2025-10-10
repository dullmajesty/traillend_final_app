import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ReservationReceipt() {
  const { date, transactionId, item, quantity } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Reservation Receipt</Text>
        <Text style={styles.detail}>{date}</Text>
        <Text style={styles.detail}>Transaction ID: {transactionId}</Text>
        <Text style={styles.detail}>Item: {item}</Text>
        <Text style={styles.detail}>Quantity: {quantity}</Text>
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Note:</Text>
        <Text style={styles.noteText}>
          Item condition check before borrowing → Borrowers must inspect the item
          before use (e.g., for scratches, missing parts, etc.)
        </Text>
        <Text style={styles.noteText}>
          Damage reporting → If an item is already damaged before use, the
          borrower must notify the officer-in-charge.
        </Text>
      </View>

      {/* DONE BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/AdminDashboard")} // navigate back
      >
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#97c6d2", padding: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 150,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#000" },
  detail: { fontSize: 14, color: "#333", marginTop: 4 },
  noteBox: {
    backgroundColor: "#FFA500",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  noteTitle: { fontWeight: "bold", color: "red", marginBottom: 8 },
  noteText: { color: "#fff", fontSize: 13, marginBottom: 5 },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ReservationReceipt() {
  const { start_date, end_date, transactionId, item, quantity } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservation Receipt</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Receipt Card */}
        <View style={styles.card}>
          <Ionicons name="receipt-outline" size={42} color="#FFA500" style={{ marginBottom: 8 }} />
          <Text style={styles.title}>Reservation Submitted</Text>
          <Text style={styles.subtitle}>Your reservation has been recorded successfully!</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.value}>{transactionId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Item</Text>
            <Text style={styles.value}>{item}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quantity</Text>
            <Text style={styles.value}>{quantity}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Borrow Date</Text>
            <Text style={styles.value}>{start_date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Return Date</Text>
            <Text style={styles.value}>{end_date}</Text>
          </View>

        </View>

        {/* Status Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#FFA500" style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>
            This reservation is <Text style={{ fontWeight: "bold" }}>pending</Text> and requires admin approval.{"\n\n"}
            Once approved, a <Text style={{ fontWeight: "bold", color: "#FFA500" }}>QR code</Text> will be sent to your notifications. 
            Please present that QR code to claim your item at the barangay office.
          </Text>
        </View>

        {/* Reminders */}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Important Reminders:</Text>
          <Text style={styles.noteText}>• Inspect the item for any damage before borrowing.</Text>
          <Text style={styles.noteText}>• Report any existing damage to the officer-in-charge.</Text>
          <Text style={styles.noteText}>• Return the item on or before the due date.</Text>
          <Text style={styles.noteText}>• Handle all borrowed items responsibly.</Text>
        </View>

        {/* Done Button */}
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.push("/(drawer)/AdminDashboard")}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4FC3F7" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#4FC3F7",
    zIndex: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    right: 15,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: 8,
    borderRadius: 8,
  },
  content: {
    marginTop: 110,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#ffffffee",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#555", textAlign: "center", marginBottom: 8 },
  divider: {
    width: "90%",
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  row: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "90%",
  marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
    flex: 1,
},
  value: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
},

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff5e6",
    borderLeftWidth: 5,
    borderColor: "#FFA500",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  infoText: { color: "#333", flex: 1, fontSize: 13, lineHeight: 18 },
  noteCard: {
    backgroundColor: "#ffffff22",
    borderRadius: 14,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ffffff33",
  },
  noteTitle: { color: "#fff", fontWeight: "700", marginBottom: 6, fontSize: 14 },
  noteText: { color: "#f0f0f0", fontSize: 13, marginBottom: 4, lineHeight: 18 },
  doneBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFA500",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  doneText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 6 },
});

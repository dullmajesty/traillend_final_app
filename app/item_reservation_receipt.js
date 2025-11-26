import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ReservationReceipt() {
  const {
    start_date,
    end_date,
    transactionId,
    main_item_name,
    main_item_qty,
    added_items_json,
  } = useLocalSearchParams();

  const router = useRouter();

  // Parse added items
  let addedItems = [];
  try {
    addedItems = added_items_json ? JSON.parse(added_items_json) : [];
  } catch (e) {
    addedItems = [];
  }

  // Total qty computation
  const totalQty =
    Number(main_item_qty) +
    addedItems.reduce((sum, itm) => sum + Number(itm.qty), 0);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservation Receipt</Text>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* MAIN RECEIPT CARD */}
        <View style={styles.card}>
          <Ionicons name="receipt-outline" size={42} color="#FFA500" style={{ marginBottom: 8 }} />
          <Text style={styles.title}>Reservation Submitted</Text>
          <Text style={styles.subtitle}>Your reservation has been successfully recorded!</Text>

          <View style={styles.divider} />

          {/* Transaction ID */}
          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.value}>{transactionId}</Text>
          </View>

          {/* ITEM LIST */}
          <View style={[styles.row, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>Items Reserved</Text>
          </View>

          {/* MAIN ITEM */}
          <View style={styles.row}>
            <Text style={styles.itemName}>{main_item_name}</Text>
            <Text style={styles.itemQty}>x{main_item_qty}</Text>
          </View>

          {/* ADDED ITEMS */}
          {addedItems.map((itm, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.itemName}>{itm.name}</Text>
              <Text style={styles.itemQty}>x{itm.qty}</Text>
            </View>
          ))}

          {/* TOTAL */}
          <View style={[styles.row, { marginTop: 10 }]}>
            <Text style={styles.totalLabel}>Total Items</Text>
            <Text style={styles.totalValue}>{totalQty}</Text>
          </View>

          <View style={styles.divider} />

          {/* Dates */}
          <View style={styles.row}>
            <Text style={styles.label}>Borrow Date</Text>
            <Text style={styles.value}>{start_date}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Return Date</Text>
            <Text style={styles.value}>{end_date}</Text>
          </View>
        </View>

        {/* PENDING STATUS + NOTES (SAME STYLE AS OLD) */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#FFA500" style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>
            This reservation is <Text style={{ fontWeight: "bold" }}>pending</Text> and requires admin approval.{"\n\n"}
            Once approved, a <Text style={{ fontWeight: "bold", color: "#FFA500" }}>QR code</Text> will appear in your notifications.{"\n\n"}
            Bring your valid ID and letter when claiming your reserved items.
          </Text>
        </View>

        {/* REMINDERS (OLD STYLE) */}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Important Reminders:</Text>
          <Text style={styles.noteText}>• Inspect items before borrowing.</Text>
          <Text style={styles.noteText}>• Report any existing damage immediately.</Text>
          <Text style={styles.noteText}>• Return items on or before the due date.</Text>
          <Text style={styles.noteText}>• Handle all borrowed items responsibly.</Text>
        </View>

        {/* DONE BUTTON */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.push("/(drawer)/AdminDashboard")}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: "#4FC3F7",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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

  scrollArea: { flex: 1 },
  scrollContent: {
    paddingTop: 110,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  card: {
    backgroundColor: "#ffffffee",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  title: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#555", textAlign: "center", marginBottom: 8 },

  divider: { width: "90%", height: 1, backgroundColor: "#ddd", marginVertical: 10 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginVertical: 4,
  },

  label: { fontSize: 14, color: "#444", fontWeight: "500" },
  value: { fontSize: 14, color: "#000", fontWeight: "600" },

  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#333" },

  itemName: { fontSize: 14, color: "#333" },
  itemQty: { fontSize: 14, fontWeight: "700", color: "#000" },

  totalLabel: { fontSize: 14, fontWeight: "700", color: "#444" },
  totalValue: { fontSize: 14, fontWeight: "800", color: "#000" },

  infoBox: {
    flexDirection: "row",
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
  noteTitle: { color: "#000", fontWeight: "700", marginBottom: 6, fontSize: 14 },
  noteText: { color: "#000", fontSize: 13, marginBottom: 4, lineHeight: 18 },

  doneBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFA500",
    padding: 15,
    borderRadius: 10,
    elevation: 6,
  },
  doneText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 6 },
});

import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ReservationSummary() {
  const router = useRouter();
  const { name, qty, date, image } = useLocalSearchParams(); // values passed from ItemDetails

  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPhone, setAcceptPhone] = useState(false);

  const handleConfirm = () => {
  if (!acceptPhone || !acceptTerms || !phone) {
    alert("Please complete phone number and agree to terms.");
    return;
  }

  // Generate a dummy transaction ID
  const transactionId = "T" + Date.now().toString().slice(-8);

  // Navigate to ReservationReceipt and pass details
  router.push({
    pathname: "/item_reservation_receipt",
    params: {
      date: date || "N/A",
      transactionId,
      item: name || "Item",
      quantity: qty || "0",
    },
  });
};

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={28} color="#fff" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Reservation Summary</Text>
      </View>

      <ScrollView style={{ marginTop: 100 }} contentContainerStyle={{ padding: 20 }}>
        {/* Reservation Info */}
        <View style={styles.row}>
          <Text style={styles.label}>Reserve Date</Text>
          <Text style={styles.value}>{date || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Quantity</Text>
          <Text style={styles.value}>{qty || "0"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Items</Text>
          <Text style={styles.value}>{name || "Item"}</Text>
        </View>

        {/* Item Preview + Info */}
        <View style={styles.itemBox}>
          <Image source={{ uri: image }} style={styles.itemImage} resizeMode="contain" />
          <Text style={styles.itemText}>
            This item is still pending and requires admin approval. To verify its approval status, please select the checkbox and provide your contact number so the admin can call you.
          </Text>
        </View>

        {/* Phone Checkbox */}
        <View style={styles.checkboxRow}>
          <TouchableOpacity onPress={() => setAcceptPhone(!acceptPhone)}>
            <Ionicons
              name={acceptPhone ? "checkbox" : "square-outline"}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
          <Text style={styles.checkboxText}>Phone Number</Text>
        </View>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="numeric"
          placeholderTextColor="#aaa"
        />

        {/* Terms & Conditions */}
        <View style={styles.checkboxRow}>
          <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)}>
            <Ionicons
              name={acceptTerms ? "checkbox" : "square-outline"}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
          <Text style={styles.checkboxText}>Terms & Condition:</Text>
        </View>
        <Text style={styles.termsText}>
          By borrowing an item, the user agrees to return it in good condition and accepts full responsibility for any loss or damage incurred during the borrowing period. Failure to comply may result in penalties, including suspension of borrowing privileges or reimbursement for damaged or lost items.
        </Text>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#97c6d2" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: "#97c6d2",
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    right: 15,
  },

  scrollWrapper: { marginTop: 70, padding: 20 },

  // Reservation Info Card
  rowCard: {
    backgroundColor: "#2A2060",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: { color: "#f5f5f5ff", fontSize: 13 },
  value: { color: "#fff", fontWeight: "600", fontSize: 14 },

  // Item Box
  itemBox: {
    backgroundColor: "#2A2060",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginRight: 12,
  },
  itemText: { flex: 1, color: "#fff", fontSize: 13, lineHeight: 18 },

  // Checkbox & Input
  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 15 },
  checkboxText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 14,
  },

  termsText: {
    color: "#040404ff",
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },

  // Confirm Button
  confirmBtn: {
    backgroundColor: "#FFA500",
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

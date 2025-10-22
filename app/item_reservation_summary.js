import React, { useState } from "react";
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ReservationSummary() {
  const router = useRouter();

  const {
    name,
    qty,
    date,            // single-day date (YYYY-MM-DD)
    message,
    priority,
    itemID,
    letterPhoto,
    idPhoto,
  } = useLocalSearchParams();

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [letterPreview, setLetterPreview] = useState(false);
  const [idPreview, setIdPreview] = useState(false);

  const prettyPriority = (p) => {
    if (!p) return "N/A";
    const t = String(p).toLowerCase();
    if (t === "high") return "High — Bereavement Request";
    if (t === "medium") return "Medium — Event Request";
    if (t === "low") return "Low — General Request";
    return p;
  };

  const fetchUserIdSilently = async (accessToken) => {
    // Try cache first
    const cached = await AsyncStorage.getItem("borrowerUserID");
    if (cached) return Number(cached);

    // Fallback: query backend silently (no UI)
    const res = await fetch("http://192.168.1.8:8000/api/me_borrower/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok || !data?.user_id) {
      throw new Error(data?.error || "Unable to resolve user id");
    }
    await AsyncStorage.setItem("borrowerUserID", String(data.user_id));
    return Number(data.user_id);
  };

 const handleConfirm = async () => {
  if (!acceptTerms) return alert("Please agree to Terms and Conditions first.");

  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (!accessToken) return Alert.alert("Not signed in", "Please log in again.");

    const parsedItemID = parseInt(itemID, 10);
    const parsedQty = parseInt(qty, 10);
    const contactNumber = (await AsyncStorage.getItem("contactNumber")) || "";

    // Build FormData
    const form = new FormData();
    form.append("itemID", String(parsedItemID));
    form.append("quantity", String(parsedQty));
    form.append("date", date);
    form.append("message", message || "");
    form.append("priority", priority || "Low");
    form.append("contact", contactNumber);

    // Only append if present
    if (letterPhoto) {
      form.append("letter_image", {
        uri: letterPhoto,             // e.g. file:///... or content://...
        name: "letter.jpg",           // any filename
        type: "image/jpeg",           // best guess; adjust if you know the type
      });
    }
    if (idPhoto) {
      form.append("valid_id_image", {
        uri: idPhoto,
        name: "valid_id.jpg",
        type: "image/jpeg",
      });
    }

    const res = await fetch("http://192.168.1.8:8000/api/create_reservation/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // DO NOT set Content-Type; fetch will set it with multipart boundary
      },
      body: form,
    });

    const ct = res.headers.get("content-type") || "";
    const raw = await res.text();
    let data = null;
    if (ct.includes("application/json")) {
      try { data = JSON.parse(raw); } catch {}
    }

    if (res.status === 201) {
      Alert.alert("Success", "Reservation created successfully!");
      return router.push({
        pathname: "/item_reservation_receipt",
        params: {
          date: date || "N/A",
          transactionId: data?.transaction_id || "N/A",
          item: name || "Item",
          quantity: String(parsedQty || 0),
        },
      });
    }

    console.log("Create reservation failed", { status: res.status, contentType: ct, body: raw?.slice(0, 500) });
    if (res.status === 401) return Alert.alert("Unauthorized", "Your session may have expired. Please log in again.");
    if (res.status === 409 && data) return Alert.alert("Unavailable", data.detail || "Selected date just filled up.");
    if (ct.includes("text/html")) return Alert.alert("Server error", "Server returned an HTML page. Check the server logs.");
    return Alert.alert("Error", data?.detail || data?.error || "Failed to create reservation.");
  } catch (err) {
    console.error("❌ Reservation Error:", err);
    Alert.alert("Network error", "Please check your connection.");
  }
};



  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={28} color="#fff" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Reservation Summary</Text>
      </View>

      <ScrollView style={{ marginTop: 100 }} contentContainerStyle={{ padding: 20 }}>
        {/* Item Info */}
        <View style={styles.section}>
          <View className="row" style={styles.row}>
            <Text style={styles.label}>Item Name</Text>
            <Text style={styles.value}>{name || "Item"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Quantity</Text>
            <Text style={styles.value}>{qty || "0"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Reserve Date</Text>
            <Text style={styles.value}>{date || "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Priority</Text>
            <Text style={styles.value}>{prettyPriority(priority)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Message</Text>
            <Text style={styles.value}>{message || "N/A"}</Text>
          </View>
        </View>

        {/* Uploaded Images */}
        <View style={styles.section}>
          {!!letterPhoto && (
            <View style={[styles.imageRow, { paddingTop: 8 }]}>
              <Text style={[styles.label, { marginBottom: 5 }]}>Letter Image</Text>
              <TouchableOpacity onPress={() => setLetterPreview(true)}>
                <Image source={{ uri: letterPhoto }} style={styles.imagePreview} />
              </TouchableOpacity>
            </View>
          )}
          {!!idPhoto && (
            <View style={[styles.imageRow, { paddingTop: 8 }]}>
              <Text style={[styles.label, { marginBottom: 5 }]}>Valid ID Image</Text>
              <TouchableOpacity onPress={() => setIdPreview(true)}>
                <Image source={{ uri: idPhoto }} style={styles.imagePreview} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Terms & Confirm */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>

          <View style={styles.checkboxRow}>
            <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)}>
              <Ionicons name={acceptTerms ? "checkbox" : "square-outline"} size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.checkboxText}>Agree to Terms & Conditions</Text>
          </View>

          <Text style={styles.termsText}>
            By borrowing an item, you agree to return it in good condition and accept full
            responsibility for any damage or loss during the borrowing period. Violations may
            result in penalties, suspension, or replacement costs.
          </Text>

          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: acceptTerms ? "#FFA500" : "#ccc" }]}
            onPress={handleConfirm}
            disabled={!acceptTerms}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Letter Preview Modal */}
      <Modal visible={letterPreview} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {!!letterPhoto && <Image source={{ uri: letterPhoto }} style={styles.fullImage} />}
          <TouchableOpacity onPress={() => setLetterPreview(false)} style={styles.closeIcon}>
            <Ionicons name="close-circle" size={35} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ID Preview Modal */}
      <Modal visible={idPreview} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {!!idPhoto && <Image source={{ uri: idPhoto }} style={styles.fullImage} />}
          <TouchableOpacity onPress={() => setIdPreview(false)} style={styles.closeIcon}>
            <Ionicons name="close-circle" size={35} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#97c6d2" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50, paddingBottom: 15, paddingHorizontal: 16,
    backgroundColor: "#97c6d2", position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
  },
  headerTitle: {
    color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center", flex: 1, right: 15,
  },
  section: { borderRadius: 12, padding: 15, marginBottom: 20 },
  sectionTitle: { color: "#fff", fontSize: 15, fontWeight: "bold", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  label: { color: "#f5f5f5ff", fontSize: 13, width: "50%", flexDirection: "row", justifyContent: "space-between" },
  value: { color: "#fff", fontWeight: "600", fontSize: 14, textAlign: "right", flex: 1 },
  imageRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 },
  imagePreview: { width: 100, height: 100, borderRadius: 10, backgroundColor: "#fff", marginLeft: 10 },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  checkboxText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
  termsText: { color: "#e1e1e1", fontSize: 12, marginTop: 8, lineHeight: 18 },
  confirmBtn: { padding: 15, borderRadius: 10, marginTop: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  confirmText: { color: "#fff", fontWeight: "bold", textAlign: "center", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
  fullImage: { width: "90%", height: "70%", borderRadius: 10 },
  closeIcon: { position: "absolute", top: 60, right: 25 },
});

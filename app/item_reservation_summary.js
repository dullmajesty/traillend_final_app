import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ReservationSummary() {
  const router = useRouter();

  const {
    name,
    qty,
    start_date,
    end_date,
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

  const handleConfirm = async () => {
    if (!acceptTerms) return alert("Please agree to Terms and Conditions first.");

    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) return Alert.alert("Not signed in", "Please log in again.");

      const parsedItemID = parseInt(itemID, 10);
      const parsedQty = parseInt(qty, 10);
      const contactNumber = (await AsyncStorage.getItem("contactNumber")) || "";

      const form = new FormData();
      form.append("itemID", String(parsedItemID));
      form.append("quantity", String(parsedQty));
      form.append("start_date", start_date);
      form.append("end_date", end_date);
      form.append("message", message || "");
      form.append("priority", priority || "Low");
      form.append("contact", contactNumber);

      if (letterPhoto) {
        form.append("letter_image", {
          uri: letterPhoto,
          name: "letter.jpg",
          type: "image/jpeg",
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
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });

      const raw = await res.text();
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        console.warn("Invalid JSON from backend:", raw);
      }

      if (res.status === 201) {
        Alert.alert("✅ Success", "Reservation created successfully!");
        return router.push({
          pathname: "/item_reservation_receipt",
          params: {
            start_date: start_date || "N/A",
            end_date: end_date || "N/A",
            transactionId: data?.transaction_id || "N/A",
            item: name || "Item",
            quantity: String(parsedQty || 0),
          },
        });
      }

      if (res.status === 409)
        return Alert.alert("Unavailable", data?.detail || "Item just got reserved by another user.");
      if (res.status === 401)
        return Alert.alert("Unauthorized", "Your session may have expired. Please log in again.");
      if (res.status >= 500)
        return Alert.alert("Server Error", "A server issue occurred. Try again later.");

      Alert.alert("Error", data?.detail || data?.error || "Failed to create reservation.");
    } catch (err) {
      console.error("❌ Reservation Error:", err);
      Alert.alert("Network error", "Please check your connection.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservation Summary</Text>
      </View>

      <ScrollView style={{ marginTop: 100 }} contentContainerStyle={{ padding: 20 }}>
        {/* Pending Info */}
        <View style={styles.pendingBox}>
          <Ionicons name="information-circle" size={22} color="#FFA500" />
          <Text style={styles.pendingText}>
            This reservation is <Text style={{ fontWeight: "bold" }}>pending</Text> and requires admin approval. 
            Please wait for confirmation before collecting the item.
          </Text>
        </View>

        {/* Item Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reservation Details</Text>
          <View style={styles.row}><Text style={styles.label}>Item Name</Text><Text style={styles.value}>{name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Quantity</Text><Text style={styles.value}>{qty}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Borrow Date</Text><Text style={styles.value}>{start_date}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Return Date</Text><Text style={styles.value}>{end_date}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Priority</Text><Text style={styles.value}>{prettyPriority(priority)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Message</Text><Text style={[styles.value, { textAlign: "left" }]}>{message || "N/A"}</Text></View>
        </View>

        {/* Uploaded Images */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Uploaded Documents</Text>
          {!!letterPhoto && (
            <TouchableOpacity style={styles.imageBox} onPress={() => setLetterPreview(true)}>
              <Image source={{ uri: letterPhoto }} style={styles.imagePreview} />
              <Text style={styles.imageLabel}>Letter Image</Text>
            </TouchableOpacity>
          )}
          {!!idPhoto && (
            <TouchableOpacity style={styles.imageBox} onPress={() => setIdPreview(true)}>
              <Image source={{ uri: idPhoto }} style={styles.imagePreview} />
              <Text style={styles.imageLabel}>Valid ID</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Terms */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <View style={styles.checkboxRow}>
            <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)}>
              <Ionicons
                name={acceptTerms ? "checkbox" : "square-outline"}
                size={22}
                color="#FFA500"
              />
            </TouchableOpacity>
            <Text style={styles.checkboxText}>I agree to the Terms & Conditions</Text>
          </View>

          <Text style={styles.termsText}>
            By submitting this reservation, you confirm that you will handle the borrowed item responsibly 
            and return it in its original condition. You will be held accountable for any loss or damage.
          </Text>

          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: acceptTerms ? "#FFA500" : "#ccc" }]}
            disabled={!acceptTerms}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>Confirm Reservation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Modals */}
      <Modal visible={letterPreview} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {!!letterPhoto && <Image source={{ uri: letterPhoto }} style={styles.fullImage} />}
          <TouchableOpacity onPress={() => setLetterPreview(false)} style={styles.closeIcon}>
            <Ionicons name="close-circle" size={35} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

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
  pendingBox: {
    backgroundColor: "#fff5e6",
    borderLeftWidth: 5,
    borderColor: "#FFA500",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  pendingText: { color: "#333", flex: 1, fontSize: 13, lineHeight: 18 },
  card: {
    backgroundColor: "#ffffff22",
    borderRadius: 14,
    padding: 15,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ffffff33",
  },
  sectionTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ffffff55",
    paddingBottom: 4,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: 8,
    borderRadius: 8,

  },

  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  label: { color: "#eee", fontSize: 13, width: "45%" },
  value: { color: "#fff", fontWeight: "600", fontSize: 14, textAlign: "right", flex: 1 },
  imageBox: { alignItems: "center", marginVertical: 8 },
  imagePreview: { width: 120, height: 120, borderRadius: 10, backgroundColor: "#fff" },
  imageLabel: { color: "#fff", marginTop: 5, fontWeight: "600" },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  checkboxText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
  termsText: { color: "#f0f0f0", fontSize: 12, marginTop: 8, lineHeight: 18 },
  confirmBtn: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmText: { color: "#fff", fontWeight: "bold", textAlign: "center", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: { width: "90%", height: "70%", borderRadius: 10 },
  closeIcon: { position: "absolute", top: 60, right: 25 },
});

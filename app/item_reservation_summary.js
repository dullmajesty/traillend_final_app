import React, { useState, useEffect } from "react";
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
    date,
    message,
    priority,
    userID,
    itemID,
    letterPhoto,
    idPhoto,
  } = useLocalSearchParams();

  const [borrower, setBorrower] = useState(null);
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

  useEffect(() => {
    const fetchBorrower = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (!accessToken) {
          console.warn("No access token found.");
          return;
        }

        const res = await fetch("http://192.168.151.115:8000/api/me_borrower/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();
        console.log("Borrower info:", data);

        if (res.ok) {
          setBorrower(data);
          if (data.user_id) {
            await AsyncStorage.setItem("borrowerUserID", String(data.user_id));
          }
        } else Alert.alert("Error", data?.error || "Borrower info not found");
      } catch (error) {
        console.error("❌ Error fetching borrower info:", error);
        Alert.alert("Error", "Failed to load borrower info");
      }
    };

    fetchBorrower();
  }, []);

  const handleConfirm = async () => {
    if (!acceptTerms) {
      alert("Please agree to Terms and Conditions first.");
      return;
    }

    try {
      const savedUserID =
        (await AsyncStorage.getItem("borrowerUserID")) || userID;

      if (!savedUserID) {
        Alert.alert("Error", "User ID not found. Please log in again.");
        return;
      }

      // 🧠 Log everything being sent
      console.log("📦 Sending Reservation Request:", {
        userID: savedUserID,
        itemID,
        qty,
        date,
        message,
        priority,
      });

      // Ensure itemID is numeric (Django expects integer)
      const parsedItemID = parseInt(itemID, 10);

      const res = await fetch("http://192.168.151.115:8000/api/create_reservation/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: savedUserID,
          itemID: parsedItemID,
          quantity: qty,
          reserve_date: date,
          message: message,
          priority: priority,
          letter_image: letterPhoto,
          valid_id_image: idPhoto,
        }),
      });

      const data = await res.json();
      console.log("Reservation Response:", data);

      if (res.ok) {
        Alert.alert("Success", "Reservation created successfully!");
        router.push({
          pathname: "/item_reservation_receipt",
          params: {
            date: date || "N/A",
            transactionId: data.transaction_id || "N/A",
            item: name || "Item",
            quantity: qty || "0",
          },
        });
      } else {
        console.error("❌ Reservation creation failed:", data);
        Alert.alert("Error", data?.error || "Failed to create reservation");
      }
    } catch (error) {
      console.error("❌ Reservation Error:", error);
      Alert.alert("Error", "Something went wrong while creating the reservation.");
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
          <View style={styles.row}>
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

        {/* Borrower Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Borrower Info</Text>
          {borrower ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Full Name</Text>
                <Text style={styles.value}>{borrower.full_name || "N/A"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.value}>{borrower.address || "N/A"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Contact Number</Text>
                <Text style={styles.value}>{borrower.contact_number || "N/A"}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.loadingText}>Loading borrower info...</Text>
          )}
        </View>

        {/* Terms & Confirm */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>

          <View style={styles.checkboxRow}>
            <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)}>
              <Ionicons
                name={acceptTerms ? "checkbox" : "square-outline"}
                size={22}
                color="#fff"
              />
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
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: "#97c6d2",
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
  section: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    color: "#f5f5f5ff",
    fontSize: 13,
    width: "50%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  value: { color: "#fff", fontWeight: "600", fontSize: 14, textAlign: "right", flex: 1 },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginLeft: 10,
  },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  checkboxText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
  termsText: {
    color: "#e1e1e1",
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
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
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: { width: "90%", height: "70%", borderRadius: 10 },
  closeIcon: {
    position: "absolute",
    top: 60,
    right: 25,
  },
  loadingText: { color: "#fff", textAlign: "center" },
});

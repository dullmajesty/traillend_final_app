import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";

export default function ItemDetails() {
  const router = useRouter();
  const { name, qty, image, description, location } = useLocalSearchParams();

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reserveModal, setReserveModal] = useState(false); // NEW modal state

  const markedDates = {
    "2025-05-21": { selected: true, selectedColor: "#ccc" },
    "2025-05-22": { disabled: true, disableTouchEvent: true, marked: true, dotColor: "red" },
    "2025-05-23": { disabled: true, disableTouchEvent: true, marked: true, dotColor: "red" },
    "2025-05-27": { selected: true, selectedColor: "green" },
    "2025-05-28": { selected: true, selectedColor: "green" },
  };

  const handleReserve = () => {
    // simulate conflict check
    if (selectedDate === "2025-05-22" || selectedDate === "2025-05-23") {
      setReserveModal(true);
    } else {
      alert("Reservation successful ✅");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#97c6d2" }}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={28} color="#fff" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Item</Text>
      </View>

      {/* Scrollable Body */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: image }} style={styles.itemImage} resizeMode="contain" />
        </View>

        {/* Item Info */}
        <View style={styles.infoBox}>
          <View style={styles.rowBetween}>
            <Text style={styles.itemName}>{name || "Item Name"}</Text>
            <Text style={styles.itemQty}>Qty: {qty || "0"}</Text>
          </View>
          <Text style={styles.location}>{location || "Barangay Kauswagan"}</Text>

          <Text style={styles.detailsTitle}>Description:</Text>
          <Text style={styles.detailsText}>{description || "No details provided"}</Text>

          {/* Note + Calendar */}
          <Text style={styles.note}>note: Tap icon to Reserve Date</Text>
          <TouchableOpacity style={styles.calendarBtn} onPress={() => setShowCalendar(true)}>
            <Ionicons name="calendar-outline" size={28} color="#fff" />
          </TouchableOpacity>
          {selectedDate && (
            <Text style={{ color: "#fff", textAlign: "center" }}>Selected: {selectedDate}</Text>
          )}
        </View>

        {/* Quantity Input */}
        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter quantity"
          placeholderTextColor="#888"
          keyboardType="numeric"
        />

        {/* Upload buttons */}
        <TouchableOpacity style={styles.uploadBtn}>
          <Text style={styles.uploadText}>Take photo of letter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadBtn}>
          <Text style={styles.uploadText}>Take photo of valid ID</Text>
        </TouchableOpacity>

        {/* Message */}
        <Text style={styles.label}>What are you borrowing this for?</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Message"
          placeholderTextColor="#888"
          multiline
          numberOfLines={3}
        />

        {/* Reserve Button */}
        <TouchableOpacity
        style={styles.reserveBtn}
        onPress={() =>
            router.push({
            pathname: "/item_reservation_summary",
            params: {
                name,
                qty,
                date: selectedDate,
                image,
            },
            })
        }
    >
    <Text style={styles.reserveText}>Reserve</Text>
        </TouchableOpacity>
    </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <Calendar
            onDayPress={(day) => {
              if (!markedDates[day.dateString]?.disabled) {
                setSelectedDate(day.dateString);
                setShowCalendar(false);
              }
            }}
            markedDates={{
              ...markedDates,
              ...(selectedDate
                ? { [selectedDate]: { selected: true, selectedColor: "blue" } }
                : {}),
            }}
          />
          <TouchableOpacity
            style={{ padding: 15, backgroundColor: "orange" }}
            onPress={() => setShowCalendar(false)}
          >
            <Text style={{ textAlign: "center", color: "#fff" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Reserve Conflict Modal */}
      <Modal transparent={true} visible={reserveModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Item Already Reserved</Text>
            <Text style={styles.modalSubtitle}>
              This item has already been reserved by another user.
            </Text>

            <Text style={styles.suggestText}>Suggested Reschedule Date:</Text>
            <Text style={{ fontWeight: "bold", marginBottom: 15 }}>May 28, 2025</Text>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "green" }]}
                onPress={() => {
                  setReserveModal(false);
                  alert("Rescheduled ✅");
                }}
              >
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "red" }]}
                onPress={() => setReserveModal(false)}
              >
                <Text style={styles.btnText}>Decline</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => {
                setReserveModal(false);
                alert("Browse other slots");
              }}
            >
              <Text style={styles.browseText}>Browse other slots</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
    right: 15,
    flex: 1,
  },
  scrollContainer: { flex: 1, marginTop: 90, padding: 16 },
  imageWrapper: { alignItems: "center", marginBottom: 15 },
  itemImage: { width: 220, height: 220, borderRadius: 12, backgroundColor: "#fff" },
  infoBox: { marginBottom: 15 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemName: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  itemQty: { fontSize: 16, color: "#fff" },
  location: { fontSize: 14, color: "#ddd", marginTop: 4, marginBottom: 10 },
  detailsTitle: { fontSize: 16, fontWeight: "600", color: "#fff" },
  detailsText: { fontSize: 14, color: "#ccc", marginBottom: 10 },
  note: { fontSize: 12, color: "red", marginBottom: 6, fontStyle: "italic" },
  calendarBtn: { alignItems: "center", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#fff", marginBottom: 6 },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 10, marginBottom: 15 },
  textarea: { backgroundColor: "#fff", borderRadius: 8, padding: 10, minHeight: 80, marginBottom: 15 },
  uploadBtn: { backgroundColor: "#555", padding: 12, borderRadius: 8, marginBottom: 10 },
  uploadText: { color: "#fff", textAlign: "center" },
  reserveBtn: {
    backgroundColor: "#FFA500",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 30,
  },
  reserveText: { color: "#fff", fontWeight: "bold", textAlign: "center", fontSize: 16 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: { color: "red", fontWeight: "bold", fontSize: 18, marginBottom: 10 },
  modalSubtitle: { textAlign: "center", marginBottom: 15 },
  suggestText: { fontWeight: "600", marginBottom: 8 },

  btnRow: { flexDirection: "row", marginTop: 5 },
  btn: { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 8 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

  browseBtn: {
    marginTop: 15,
    backgroundColor: "yellow",
    padding: 12,
    borderRadius: 8,
    width: "100%",
  },
  browseText: { textAlign: "center", fontWeight: "bold", color: "#000" },
});

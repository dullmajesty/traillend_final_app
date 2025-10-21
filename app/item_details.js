import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import * as ImagePicker from "expo-image-picker";

export default function ItemDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reserveModal, setReserveModal] = useState(false);
  const [message, setMessage] = useState("");
  const [letterPhoto, setLetterPhoto] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);
  const [borrowQty, setBorrowQty] = useState("");
  const [priority, setPriority] = useState("Low"); // Low | Medium | High

  const markedDates = {
    "2025-05-22": { disabled: true, disableTouchEvent: true, marked: true, dotColor: "red" },
    "2025-05-23": { disabled: true, disableTouchEvent: true, marked: true, dotColor: "red" },
  };

  const URGENCY_OPTIONS = [
    { key: "High", label: "Bereavement Request", display: "High — Bereavement", description: "Immediate priority for bereavement-related requests." },
    { key: "Medium", label: "Event Request", display: "Medium — Event", description: "For scheduled programs/activities; moderate urgency." },
    { key: "Low", label: "General Request", display: "Low — General", description: "Standard borrowing; normal queue." },
  ];

  // ✅ Fetch item details
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const response = await fetch(`http://192.168.151.115:8000/api/api_inventory_list/`);
        const data = await response.json();
        const selectedItem = data.find((i) => i.item_id === parseInt(id));
        if (selectedItem) setItem(selectedItem);
        else console.warn("⚠️ Item not found with ID:", id);
      } catch (error) {
        console.error("❌ Error fetching item details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItemDetails();
  }, [id]);

  // ✅ Image picker
  const pickImage = async (setImage) => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Camera access is needed to take or choose photos.");
        return;
      }

      Alert.alert("Upload Photo", "Choose an option", [
        {
          text: "Take Photo",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.7,
            });
            if (!result.canceled) setImage(result.assets[0].uri);
          },
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.7,
            });
            if (!result.canceled) setImage(result.assets[0].uri);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } catch (error) {
      console.error("❌ Error picking image:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#fff" }}>Loading item details...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#fff" }}>Item not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#97c6d2" }}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={28} color="#fff" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Item Details</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri: item.image
                ? item.image
                : "https://via.placeholder.com/150?text=No+Image",
            }}
            style={styles.itemImage}
            resizeMode="contain"
          />
        </View>

        {/* Info Section */}
        <Text style={styles.itemName}>{item.name || "Item Name"}</Text>
        <Text style={styles.itemOwner}>Owner: {item.owner || "Barangay Kauswagan"}</Text>

        <Text style={styles.detailsTitle}>Description:</Text>
        <Text style={styles.detailsText}>{item.description || "No description provided."}</Text>

        {/* ✅ Available + Quantity Input */}
        <View style={styles.availableContainer}>
          <Text style={styles.availableText}>Available: {item.qty || "0"}</Text>
          <TextInput
            style={styles.qtyInput}
            placeholder="Enter quantity"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={borrowQty}
            onChangeText={setBorrowQty}
          />
        </View>

        {/* Select Date */}
        <Text style={styles.label}>Select Date:</Text>
        <TouchableOpacity style={styles.calendarBtn} onPress={() => setShowCalendar(true)}>
          <Ionicons name="calendar-outline" size={28} color="#fff" />
        </TouchableOpacity>
        {selectedDate && (
          <Text style={{ color: "#fff", textAlign: "center", marginBottom: 15 }}>
            Selected: {selectedDate}
          </Text>
        )}

        {/* Upload Letter */}
        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setLetterPhoto)}>
          <Text style={styles.uploadText}>Take picture of letter</Text>
        </TouchableOpacity>
        {letterPhoto && <Image source={{ uri: letterPhoto }} style={styles.previewImage} />}

        {/* Upload Valid ID */}
        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setIdPhoto)}>
          <Text style={styles.uploadText}>Take picture of valid ID</Text>
        </TouchableOpacity>
        {idPhoto && <Image source={{ uri: idPhoto }} style={styles.previewImage} />}

        {/* Priority / Urgency */}
        <Text style={styles.label}>Priority</Text>
        <View style={styles.pillRow}>
          {URGENCY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setPriority(opt.key)}
              style={[styles.pill, priority === opt.key && styles.pillSelected]}
            >
              <Text style={[styles.pillText, priority === opt.key && styles.pillTextSelected]}>
                {opt.display}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.helperText}>
          {priority === "High"
            ? "Bereavement Request: immediate attention by Admin."
            : priority === "Medium"
            ? "Event Request: moderate urgency handled by Admin/Officer."
            : "General Request: handled in normal queue time."}
        </Text>

        {/* Message */}
        <Text style={styles.label}>Message:</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Write a message"
          placeholderTextColor="#666"
          multiline
          numberOfLines={3}
          value={message}
          onChangeText={setMessage}
        />

        {/* Reserve Button */}
        <TouchableOpacity
          style={styles.reserveBtn}
          onPress={() =>
            router.push({
              pathname: "/item_reservation_summary",
              params: {
                name: item.name,
                qty: borrowQty,
                date: selectedDate,
                message: message,
                priority,
                image: item.image,
                letterPhoto,
                idPhoto,
                itemID: item.item_id, // ✅ FIXED: now sends the correct item_id
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
    </View>
  );
}

/* ============ STYLES ============ */
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#97c6d2" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: "#97c6d2",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center", flex: 1, right: 15 },
  scrollContainer: { flex: 1, padding: 16 },
  imageWrapper: { alignItems: "center", marginBottom: 15 },
  itemImage: { width: 220, height: 220, borderRadius: 12, backgroundColor: "#fff" },
  itemName: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 3 },
  itemOwner: { color: "#eee", marginBottom: 10 },
  detailsTitle: { color: "#fff", fontWeight: "bold", marginBottom: 5 },
  detailsText: { color: "#eee", marginBottom: 15, lineHeight: 20 },
  availableContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: "space-between",
    marginBottom: 15,
  },
  availableText: { color: "#000", fontWeight: "600" },
  qtyInput: {
    backgroundColor: "#f1f1f1",
    borderRadius: 6,
    padding: 8,
    width: 100,
    textAlign: "center",
    color: "#000",
  },
  label: { fontSize: 14, fontWeight: "600", color: "#fff", marginBottom: 6 },
  calendarBtn: {
    backgroundColor: "#555",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  uploadBtn: { backgroundColor: "#555", padding: 12, borderRadius: 8, marginBottom: 10 },
  uploadText: { color: "#fff", textAlign: "center" },
  previewImage: { width: "100%", height: 180, borderRadius: 10, marginBottom: 15 },
  textarea: { backgroundColor: "#fff", borderRadius: 8, padding: 10, minHeight: 80, marginBottom: 15 },
  reserveBtn: { backgroundColor: "#FFA500", padding: 15, borderRadius: 8, marginTop: 10, marginBottom: 30 },
  reserveText: { color: "#fff", fontWeight: "bold", textAlign: "center", fontSize: 16 },
  pillRow: { flexDirection: "row", gap: 8, marginBottom: 10, flexWrap: "wrap" },
  pill: { borderWidth: 1, borderColor: "#ddd", backgroundColor: "#fff", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  pillSelected: { borderColor: "#FFA500", backgroundColor: "#FFE9CC" },
  pillText: { color: "#333", fontWeight: "600", fontSize: 12 },
  pillTextSelected: { color: "#D46B08" },
  helperText: { color: "#eee", fontSize: 12, marginBottom: 10 },
});

import React, { useState, useEffect, useMemo } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import * as ImagePicker from "expo-image-picker";

export default function ItemDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // item_id from list screen

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calendar / reservation state
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]); // ["YYYY-MM-DD", ...]
  const [checking, setChecking] = useState(false);

  // Conflict modal state
  const [conflictModal, setConflictModal] = useState(false);
  const [conflictInfo, setConflictInfo] = useState({ blocked: [], suggestions: [] });

  // Form fields
  const [message, setMessage] = useState("");
  const [letterPhoto, setLetterPhoto] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);
  const [borrowQty, setBorrowQty] = useState("");
  const [priority, setPriority] = useState("Low"); // "Low" | "Medium" | "High"

  const URGENCY_OPTIONS = [
    { key: "High", display: "High — Bereavement" },
    { key: "Medium", display: "Medium — Event" },
    { key: "Low", display: "Low — General" },
  ];

  // Build markedDates from blocked + selected
  const computedMarked = useMemo(() => {
    const md = {};
    blockedDates.forEach((d) => {
      md[d] = { disabled: true, disableTouchEvent: true, marked: true, dotColor: "red" };
    });
    if (selectedDate) {
      md[selectedDate] = { ...(md[selectedDate] || {}), selected: true, selectedColor: "blue" };
    }
    return md;
  }, [blockedDates, selectedDate]);

  // Fetch item details (you already have this list endpoint)
  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://192.168.1.8:8000/api/inventory_list/`);
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

  // Fetch fully-booked (blocked) dates for this item (next 90 days)
  useEffect(() => {
    const fetchBlocked = async () => {
      try {
        const res = await fetch(`http://192.168.1.8:8000/api/items/${id}/blocked-dates/?days_ahead=90`);
        const json = await res.json();
        setBlockedDates(Array.isArray(json.blocked) ? json.blocked : []);
      } catch (e) {
        console.warn("Failed to fetch blocked dates", e);
      }
    };
    if (id) fetchBlocked();
  }, [id]);

  // Image picker helper
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

  // PRE-FLIGHT CHECK ONLY (no saving here)
  const preflightAndGoToSummary = async (overrideDates) => {
    const reserve_date = overrideDates?.reserve_date || selectedDate;

    if (!reserve_date) return Alert.alert("Select date", "Please choose a date first.");
    if (!borrowQty) return Alert.alert("Quantity required", "Please enter how many you need.");

    setChecking(true);
    try {
      const res = await fetch(`http://192.168.1.8:8000/api/reservations/check/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: Number(id),
          qty: Number(borrowQty),
          date: reserve_date, // single day
        }),
      });

      if (res.status === 200) {
        // ✅ available — go to summary; NO saving here
        router.push({
          pathname: "/item_reservation_summary",
          params: {
            name: item?.name,
            qty: String(borrowQty),
            date: reserve_date,
            message,
            priority,
            image: item?.image,
            letterPhoto,
            idPhoto,
            itemID: String(item?.item_id),
          },
        });
      } else if (res.status === 409) {
        const data = await res.json();
        setConflictInfo({ blocked: data.blocked || [], suggestions: data.suggestions || [] });
        setConflictModal(true);
        // refresh blocked dates
        try {
          const re = await fetch(`http://192.168.1.8:8000/api/items/${id}/blocked-dates/?days_ahead=90`);
          const js = await re.json();
          setBlockedDates(Array.isArray(js.blocked) ? js.blocked : []);
        } catch {}
      } else {
        const text = await res.text();
        let data; try { data = JSON.parse(text); } catch { data = { detail: text || "Unknown error" }; }
        Alert.alert("Error", data.detail || "Could not check availability.");
      }
    } catch (e) {
      Alert.alert("Network error", "Please check your connection.");
    } finally {
      setChecking(false);
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
              uri: item.image ? item.image : "https://via.placeholder.com/150?text=No+Image",
            }}
            style={styles.itemImage}
            resizeMode="contain"
          />
        </View>

        {/* Info */}
        <Text style={styles.itemName}>{item.name || "Item Name"}</Text>
        <Text style={styles.itemOwner}>Owner: {item.owner || "Barangay Kauswagan"}</Text>

        <Text style={styles.detailsTitle}>Description:</Text>
        <Text style={styles.detailsText}>{item.description || "No description provided."}</Text>

        {/* Available + Quantity */}
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
        {letterPhoto ? <Image source={{ uri: letterPhoto }} style={styles.previewImage} /> : null}

        {/* Upload Valid ID */}
        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setIdPhoto)}>
          <Text style={styles.uploadText}>Take picture of valid ID</Text>
        </TouchableOpacity>
        {idPhoto ? <Image source={{ uri: idPhoto }} style={styles.previewImage} /> : null}

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

        {/* Continue to Summary (check-only) */}
        <TouchableOpacity
          style={[styles.reserveBtn, checking && { opacity: 0.6 }]}
          disabled={checking}
          onPress={() => preflightAndGoToSummary()}
        >
          {checking ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.reserveText}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <Calendar
            onDayPress={(day) => {
              const ds = day.dateString;
              if (!blockedDates.includes(ds)) {
                setSelectedDate(ds);
                setShowCalendar(false);
              } else {
                Alert.alert("Unavailable", "That date is already fully reserved.");
              }
            }}
            markedDates={computedMarked}
            minDate={new Date().toISOString().slice(0, 10)}
          />
          <TouchableOpacity
            style={{ padding: 15, backgroundColor: "orange" }}
            onPress={() => setShowCalendar(false)}
          >
            <Text style={{ textAlign: "center", color: "#fff" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Conflict / Suggestions Modal */}
      <Modal visible={conflictModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, width: "100%" }}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
              Item already reserved for that date
            </Text>
            {conflictInfo.blocked?.length ? (
              <Text style={{ marginBottom: 8 }}>
                Unavailable: {conflictInfo.blocked.join(", ")}
              </Text>
            ) : null}
            <Text style={{ fontWeight: "600", marginBottom: 8 }}>Try these dates:</Text>
            {conflictInfo.suggestions?.length ? (
              conflictInfo.suggestions.map((sug, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                  onPress={() => {
                    setConflictModal(false);
                    preflightAndGoToSummary({ reserve_date: sug.date });
                  }}
                >
                  <Text>{sug.date}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ color: "#555", marginBottom: 8 }}>
                No alternatives found in the next 30 days for this quantity.
              </Text>
            )}

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
              <TouchableOpacity onPress={() => setConflictModal(false)} style={{ padding: 12 }}>
                <Text style={{ color: "#555" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
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

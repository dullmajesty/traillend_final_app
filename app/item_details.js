import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import * as ImagePicker from "expo-image-picker";
import Modal from "react-native-modal";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

export default function ItemDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowDate, setBorrowDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [availableQty, setAvailableQty] = useState(null);
  const [borrowQty, setBorrowQty] = useState("");
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showProceedModal, setShowProceedModal] = useState(false);
  const [selectingType, setSelectingType] = useState("borrow");
  const [markedDates, setMarkedDates] = useState({});
  const [checking, setChecking] = useState(false);
  const [priority, setPriority] = useState("Low");
  const [message, setMessage] = useState("");
  const [letterPhoto, setLetterPhoto] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);
  const [calendarMap, setCalendarMap] = useState({});
  const [calendarLoading, setCalendarLoading] = useState(false);

  const URGENCY_OPTIONS = [
    { key: "High", display: "High - For urgent family loss or critical need" },
    { key: "Medium", display: "Medium - For events, barangay activities, or school programs" },
    { key: "Low", display: "Low - For normal or general borrowing needs" },
  ];

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch("http://192.168.43.118:8000/api/inventory_list/");
        const data = await res.json();
        const found = data.find((i) => i.item_id === parseInt(id));
        setItem(found);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

 const fetchAvailabilityMap = async () => {
  try {
    setCalendarLoading(true);

    //  Fetch the 60-day map directly from backend
    const res = await fetch(`http://192.168.43.118:8000/api/items/${id}/availability-map/`);
    const json = await res.json();

    const map = json.calendar || {};
    setCalendarMap(map);

    const marks = {};
    Object.entries(map).forEach(([date, info]) => {
    if (info.status === "blocked") {
      // Gray for admin-blocked dates
      marks[date] = {
        disabled: true,
        disableTouchEvent: true,
        customStyles: {
          container: { backgroundColor: "#d3d3d3" },
          text: { color: "#555", fontWeight: "bold" },
        },
      };
    } else if (info.status === "fully_reserved") {
      // Red for fully reserved
      marks[date] = {
        disabled: true,
        disableTouchEvent: true,
        customStyles: {
          container: { backgroundColor: "#ffcccc" },
          text: { color: "#a00", fontWeight: "bold" },
        },
      };
    } else {
      // Green for available
      marks[date] = {
        customStyles: {
          container: { backgroundColor: "#e6ffe6" },
          text: { color: "#008000", fontWeight: "600" },
        },
      };
    }
  });

    setMarkedDates(marks);
  } catch (e) {
    console.warn("Failed to fetch map:", e);
  } finally {
    setCalendarLoading(false);
  }
};



  useEffect(() => {
    if (showCalendarModal) fetchAvailabilityMap();
  }, [showCalendarModal]);

  const fetchAvailability = async (date) => {
    try {
      const res = await fetch(
        `http://192.168.43.118:8000/api/items/${id}/availability/?date=${date}`
      );
      if (!res.ok) return null;
      const data = await res.json();
      const qty = data.available_qty ?? data.remaining_qty ?? data.available ?? 0;
      setAvailableQty(qty);
      return data;
    } catch (e) {
      console.warn("Availability fetch error:", e);
      return null;
    }
  };

  const handleSaveDate = () => {
    if (!availableQty && availableQty !== 0) return Alert.alert("Select a date first.");
    if (!borrowQty) return Alert.alert("Enter quantity to borrow.");
    if (parseInt(borrowQty) > availableQty)
      return Alert.alert("Quantity exceeds available items.");
    setShowCalendarModal(false);
  };

  const pickImage = async (setImage) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Toast.show({
        type: "error",
        text1: "Permission Denied",
        text2: "Please allow gallery access to upload a photo.",
      });
      return;
    }

    Alert.alert("Upload Photo", "Choose an option", [
      {
        text: "Take Photo",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: [ImagePicker.MediaType.Image],

            allowsEditing: true,
            quality: 0.7,
          });
          if (!result.canceled) setImage(result.assets[0].uri);
           Toast.show({
            type: "success",
            text1: "Photo Added",
            text2: "Your photo was captured successfully.",
          });
        },
      },
      {
        text: "Choose from Gallery",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: [ImagePicker.MediaType.Image],

            allowsEditing: true,
            quality: 0.7,
          });
          if (!result.canceled) setImage(result.assets[0].uri);
          Toast.show({
            type: "success",
            text1: "Photo Added",
            text2: "Your photo has been selected.",
          });
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };


const preflightAndGoToSummary = async () => {
  if (!borrowDate || !returnDate) {
    Toast.show({
      type: "error",
      text1: "Missing Dates",
      text2: "Please select both borrow and return dates before continuing.",
    });
    return;
  }

  if (!borrowQty) {
    Toast.show({
      type: "error",
      text1: "Missing Quantity",
      text2: "Enter how many items you want to borrow.",
    });
    return;
  }

  setChecking(true);
  try {
    const res = await fetch("http://192.168.43.118:8000/api/reservations/check/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: Number(id),
        qty: Number(borrowQty),
        start_date: borrowDate,
        end_date: returnDate,
      }),
    });

    if (res.status === 200) {
      Toast.show({
        type: "success",
        text1: "Checking Completed",
        text2: "Item is available. Redirecting to summary...",
      });

      setTimeout(() => {
        router.push({
          pathname: "/item_reservation_summary",
          params: {
            name: item?.name,
            qty: String(borrowQty),
            start_date: borrowDate,
            end_date: returnDate,
            message,
            priority,
            image: item?.image,
            letterPhoto,
            idPhoto,
            itemID: String(item?.item_id),
          },
        });
      }, 800);
    } else if (res.status === 409) {
      const data = await res.json();
      Alert.alert(
        "Unavailable",
        `Sorry, this item is unavailable for your selected date.\nNext available: ${
          data.suggestions?.[0]?.date || "N/A"
        }`,
        [{ text: "OK", style: "default" }]
      );
    } else {
      const data = await res.json();
      Toast.show({
        type: "error",
        text1: "Error Checking Availability",
        text2: data.detail || "Could not check item availability.",
      });
    }
  } catch {
    Toast.show({
      type: "error",
      text1: "Network Error",
      text2: "Please check your internet connection.",
    });
  } finally {
    setChecking(false);
  }
};



  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#fff" />
      </View>
    );

  return (
    <LinearGradient colors={["#4FC3F7", "#4FC3F7"]} style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Item Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.image || "https://via.placeholder.com/200" }}
            style={styles.itemImage}
          />
        </View>

        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemOwner}>Owner: {item.owner}</Text>
        <Text style={styles.itemDesc}>{item.description}</Text>

        {/* Date Selection */}
        <View style={styles.dateRow}>
          {["borrow", "return"].map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.dateBox}
              onPress={() => {
                setSelectingType(type);
                setShowCalendarModal(true);
              }}
            >
              <Ionicons name="calendar-outline" size={20} color="#555" />
              <Text style={styles.dateText}>
                {type === "borrow" ? borrowDate || "Borrow Date" : returnDate || "Return Date"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {availableQty !== null && (
          <Text style={styles.availableText}>Available: {availableQty} item(s)</Text>
        )}

        <View style={styles.qtyDisplay}>
          <Text style={styles.qtyText}>Borrow Qty: {borrowQty || "—"}</Text>
        </View>

        {/* Upload Buttons */}
        <View style={styles.uploadSection}>
          {/* Upload Letter */}
          <TouchableOpacity
            style={styles.uploadCard}
            onPress={() => pickImage(setLetterPhoto)}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={26} color="#1976D2" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.uploadTitle}>Upload Authorization Letter</Text>
              <Text style={styles.uploadHint}>
                Must include the <Text style={styles.uploadEmphasis}>signature of the Barangay Captain</Text>.
              </Text>
            </View>
          </TouchableOpacity>

          {letterPhoto && <Image source={{ uri: letterPhoto }} style={styles.preview} />}

          {/* Upload Valid ID */}
          <TouchableOpacity
            style={styles.uploadCard}
            onPress={() => pickImage(setIdPhoto)}
            activeOpacity={0.8}
          >
            <Ionicons name="id-card-outline" size={26} color="#1976D2" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.uploadTitle}>Upload Valid ID</Text>
              <Text style={styles.uploadHint}>
                Accepted IDs: <Text style={styles.uploadEmphasis}>Government-issued, Student ID, or Birth Certificate</Text>.
              </Text>
            </View>
          </TouchableOpacity>

          {idPhoto && <Image source={{ uri: idPhoto }} style={styles.preview} />}
        </View>

        {/* Priority Pills */}
        <Text style={styles.label}>Priority:</Text>
        <View style={styles.priorityRow}>
          {URGENCY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.pill, priority === opt.key && styles.pillSelected]}
              onPress={() => setPriority(opt.key)}
            >
              <Text
                style={[
                  styles.pillText,
                  priority === opt.key && styles.pillTextSelected,
                ]}
              >
                {opt.display}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Message:</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Write your message"
          value={message}
          onChangeText={setMessage}
        />

        {/* Reserve Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.reserveBtn}
          disabled={checking}
          onPress={() => {
              if (!letterPhoto) {
                Toast.show({
                  type: "error",
                  text1: "Authorization Letter Required",
                  text2: "Please upload your authorization letter.",
                });
                return;
              }

              if (!idPhoto) {
                Toast.show({
                  type: "error",
                  text1: "Valid ID Required",
                  text2: "Please upload your valid ID.",
                });
                return;
              }

              setShowProceedModal(true);
          }}
        >
          <LinearGradient
            colors={["#FFA500", "#FFA500"]}
            start={[0, 0]}
            end={[1, 0]}
            style={styles.reserveGradient}
          >
            {checking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.reserveText}>Continue</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        isVisible={showCalendarModal}
        backdropOpacity={0.4}
        onBackdropPress={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalCard}>
          {calendarLoading ? (
            <ActivityIndicator size="large" color="#1E88E5" />
          ) : (
            <>
              <Calendar
                markingType="custom"
                markedDates={markedDates}
                onDayPress={async (day) => {
                const date = day.dateString;
                const info = calendarMap[date];

                // Block fully reserved dates
                if (info?.status === "fully_reserved") {
                  Alert.alert("Unavailable", "That date is fully reserved.");
                  return;
                }

                // Update available qty
                if (info && info.available_qty !== undefined) {
                  setAvailableQty(info.available_qty);
                } else {
                  const data = await fetchAvailability(date);
                  if (!data) return;
                  setAvailableQty(data.available_qty || 0);
                }

                // Set borrow or return date
                if (selectingType === "borrow") setBorrowDate(date);
                else if (borrowDate && date < borrowDate)
                  return Alert.alert("Invalid", "Return date must be after borrow date.");
                else setReturnDate(date);

                // Reset all previous blue highlights, keep default map colors
                const newMarks = {};

                Object.entries(calendarMap).forEach(([key, info]) => {
                  if (info.status === "fully_reserved") {
                    newMarks[key] = {
                      ...markedDates[key],
                      customStyles: {
                        container: { backgroundColor: "#ffcccc" },
                        text: { color: "#a00", fontWeight: "bold" },
                      }
                    };
                  } else if (info.status === "blocked") {
                    newMarks[key] = {
                      ...markedDates[key],
                      disabled: true,
                      disableTouchEvent: true,
                      customStyles: {
                        container: { backgroundColor: "#d3d3d3" },
                        text: { color: "#555", fontWeight: "bold" },
                      }
                    };
                  } else {
                    newMarks[key] = {
                      ...markedDates[key],
                      customStyles: {
                        container: { backgroundColor: "#e6ffe6" },
                        text: { color: "#008000", fontWeight: "600" },
                      }
                    };
                  }
                });

                // Mark the user-selected date as blue
                newMarks[date] = {
                  ...newMarks[date],
                  customStyles: {
                    container: { backgroundColor: "#1E88E5" },
                    text: { color: "#fff", fontWeight: "bold" }
                  }
                };

                setMarkedDates(newMarks);
              }}

                minDate={new Date().toISOString().slice(0, 10)}
                theme={{ todayTextColor: "#FFA500", arrowColor: "#1E88E5" }}
              />

              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#e6ffe6" }]} />
                  <Text style={styles.legendText}>Available</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#ffcccc" }]} />
                  <Text style={styles.legendText}>Fully Reserved</Text>
                </View>
                <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#d3d3d3" }]} />
                  <Text style={styles.legendText}>Blocked (Admin)</Text>
                </View>

              </View>

              <Text style={styles.modalAvail}>
                {availableQty === null
                  ? "Tap a date to check availability"
                  : `Available: ${availableQty}`}
              </Text>

              <TextInput
                style={styles.modalQtyInput}
                placeholder="Enter quantity"
                keyboardType="numeric"
                value={borrowQty}
                onChangeText={setBorrowQty}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#4CAF50" }]}
                  onPress={handleSaveDate}
                >
                  <Text style={styles.modalBtnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#E53935" }]}
                  onPress={() => setShowCalendarModal(false)}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
  
     {/* Proceed Notice Modal */}
      <Modal
        isVisible={showProceedModal}
        backdropOpacity={0.5}
        animationIn="fadeInUp"
        animationOut="fadeOutDown"
        onBackdropPress={() => setShowProceedModal(false)}
      >
        <View style={styles.noticeCard}>
          {/* Header */}
          <View style={styles.noticeHeader}>
            <Ionicons name="alert-circle-outline" size={28} color="#64B5F6" />
            <Text style={styles.noticeTitle}>Before You Proceed</Text>
          </View>

          <Text style={styles.noticeSubtitle}>
            Please review the following reminders carefully before submitting your reservation request.
          </Text>

          {/* Content */}
          <ScrollView
            style={{ maxHeight: 420 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          >
            {[
              {
                title: "Reservation Recording",
                text:
                  "All reservation details — including your name, contact information, and selected items — will be recorded in the system for proper documentation and verification.",
              },
              {
                title: "Accuracy of Information",
                text:
                  "Ensure all details you provide are true and complete. False or misleading information may result in cancellation or account suspension.",
              },
              {
                title: "Identification Requirement",
                text:
                  "A valid government-issued ID is required. A Student ID or Birth Certificate may also be accepted. Fake or expired IDs will result in immediate suspension.",
              },
              {
                title: "Claiming Policy",
                text:
                  "Items must be claimed on the scheduled date. Failure to claim will result in 1 warning. Accumulating 3 warnings will mark your account as a bad borrower and may result in a ban.",
              },
              {
                title: "Late Return Policy",
                text:
                  "Late returns will be recorded and may result in warnings. Repeated late returns will mark you as a bad borrower.",
              },
              {
                title: "Unreturned or Lost Items",
                text:
                  "Failure to return an item within 7 days after the due date is a serious violation. You may be required to replace the item or face suspension. Repeated cases can lead to permanent banning.",
              },
              {
                title: "Damaged Items",
                text:
                  "Any damage must be reported immediately. Borrowers are responsible for repair or replacement. Three recorded damages will result in borrowing suspension.",
              },
              {
                title: "Privacy Policy",
                text:
                  "All personal data is handled confidentially and used only for official TrailLend and Barangay Kauswagan purposes, following the Data Privacy Act.",
              },
            ].map((item, index) => (
              <View key={index} style={styles.noticeItem}>
                <View style={styles.noticeDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.noticeHeading}>{item.title}</Text>
                  <Text style={styles.noticeText}>{item.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.noticeBtnRow}>
            <TouchableOpacity
              style={[styles.noticeBtn, styles.noticeCancelBtn]}
              onPress={() => setShowProceedModal(false)}
            >
              <Ionicons name="close-circle-outline" size={18} color="#555" />
              <Text style={[styles.noticeBtnText, { color: "#333" }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.noticeBtn, styles.noticeContinueBtn]}
              onPress={() => {
                setShowProceedModal(false);
                preflightAndGoToSummary();
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={[styles.noticeBtnText, { color: "#fff" }]}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// ==================== Styles ====================
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#4FC3F7" },
  header: { flexDirection: "row", alignItems: "center", paddingTop: 50, paddingHorizontal: 16, marginBottom: 10 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700", flex: 1, textAlign: "center", right: 15 },
  scrollContent: { padding: 16, paddingBottom: 60 },
  imageWrapper: { alignItems: "center", marginBottom: 10 },
  itemImage: { width: 220, height: 220, borderRadius: 18, backgroundColor: "#fff", elevation: 6 },
  itemName: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 8, textAlign: "center" },
  itemOwner: { color: "#E0F7FA", textAlign: "center", marginBottom: 4 },
  itemDesc: { color: "#E0F7FA", marginBottom: 14, textAlign: "center" },
  dateRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    flex: 0.48,
    justifyContent: "center",
    elevation: 3,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: 8,
    borderRadius: 8,
  },
  dateText: { color: "#333", fontWeight: "600", marginLeft: 6 },
  availableText: { color: "#fff", textAlign: "center", marginVertical: 6 },
  qtyDisplay: {
    backgroundColor: "#FFD55A",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  qtyText: { color: "#333", fontWeight: "700" },
  uploadSection: {
  marginTop: 10,
  marginBottom: 20,
},

uploadCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  borderRadius: 14,
  borderWidth: 1.5,
  borderColor: "#1976D2",
  padding: 14,
  marginBottom: 12,
  elevation: 4,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 5,
  shadowOffset: { width: 0, height: 2 },
},

uploadTitle: {
  fontSize: 14,
  fontWeight: "700",
  color: "#1976D2",
  marginBottom: 2,
},

uploadHint: {
  fontSize: 12,
  color: "#555",
  fontStyle: "italic",
  lineHeight: 16,
},

uploadEmphasis: {
  color: "#E65100",
  fontWeight: "600",
},

preview: {
  width: "100%",
  height: 180,
  borderRadius: 12,
  marginBottom: 10,
  marginTop: -2,
},

  preview: { width: "100%", height: 180, borderRadius: 12, marginBottom: 10 },
  label: { color: "#fff", fontWeight: "600", marginBottom: 6 },
  priorityRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  pill: { borderWidth: 1, borderColor: "#ddd", backgroundColor: "#fff", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  pillSelected: { borderColor: "#FFC107", backgroundColor: "#FFF8E1" },
  pillText: { color: "#333", fontSize: 12, fontWeight: "600" },
  pillTextSelected: { color: "#E65100" },
  textArea: { backgroundColor: "#fff", borderRadius: 10, minHeight: 80, padding: 10, marginBottom: 15 },
  reserveBtn: { borderRadius: 10, overflow: "hidden", elevation: 5, marginBottom: 20 },
  reserveGradient: { paddingVertical: 16, alignItems: "center" },
  reserveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  modalCard: { backgroundColor: "#fff", borderRadius: 20, padding: 16 },
  modalAvail: { textAlign: "center", fontWeight: "600", marginVertical: 8 },
  modalQtyInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    textAlign: "center",
    marginBottom: 12,
  },
  modalBtnRow: { flexDirection: "row", justifyContent: "space-between" },
  modalBtn: { flex: 0.48, borderRadius: 10, padding: 12 },
  modalBtnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  legendRow: { flexDirection: "row", justifyContent: "center", gap: 15, marginTop: 5 },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 5 },
  legendText: { fontSize: 13, color: "#333" },
noticeCard: {
  backgroundColor: "#fff",
  borderRadius: 18,
  padding: 20,
  elevation: 10,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
},

noticeHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 8,
},

noticeTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#64B5F6",
  marginLeft: 8,
},

noticeSubtitle: {
  fontSize: 13,
  color: "#555",
  textAlign: "center",
  marginBottom: 12,
  lineHeight: 18,
},

noticeItem: {
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: 10,
},

noticeDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "#64B5F6",
  marginRight: 10,
  marginTop: 6,
},

noticeHeading: {
  fontWeight: "700",
  fontSize: 13.5,
  color: "#1976D2",
  marginBottom: 2,
},

noticeText: {
  color: "#444",
  fontSize: 13,
  lineHeight: 18,
},

noticeBtnRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 15,
},

noticeBtn: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  flex: 0.48,
  paddingVertical: 10,
  borderRadius: 10,
  elevation: 2,
},

noticeCancelBtn: {
  backgroundColor: "#eee",
},

noticeContinueBtn: {
  backgroundColor: "#64B5F6",
},

noticeBtnText: {
  fontWeight: "600",
  fontSize: 14,
  marginLeft: 5,
},


});

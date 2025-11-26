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
import Toast from "react-native-toast-message";

export default function ReservationSummary() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // MAIN ITEM
  const mainItem = {
    id: params.main_item_id,
    name: params.main_item_name,
    qty: params.main_item_qty,
    image: params.main_item_image,
  };

  // ADDED ITEMS
  const addedItems = params.added_items ? JSON.parse(params.added_items) : [];

  const start_date = params.start_date;
  const end_date = params.end_date;

  // ⭐ NEW — REAL Reason
  const reason = params.priorityDetail || "N/A";

  const letterPhoto = params.letterPhoto;
  const idPhoto = params.idPhoto;

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [letterPreview, setLetterPreview] = useState(false);
  const [idPreview, setIdPreview] = useState(false);
  const [suggestModal, setSuggestModal] = useState(false);
  const [showRanges, setShowRanges] = useState(false);
  const [suggestedRanges, setSuggestedRanges] = useState([]);

  // SUBMIT RESERVATION ==================================================
  const handleConfirm = async () => {
    if (!acceptTerms) {
      Toast.show({
        type: "error",
        text1: "Terms Not Accepted",
        text2: "Please agree to the Terms and Conditions before proceeding.",
      });
      return;
    }

    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const contactNumber = (await AsyncStorage.getItem("contactNumber")) || "";

      const form = new FormData();

      // Main Item
      form.append("main_item_id", mainItem.id);
      form.append("main_item_qty", mainItem.qty);

      // Added Items
      form.append(
        "added_items",
        JSON.stringify(
          addedItems.map((i) => ({
            id: i.item_id,
            qty: i.qty || "0",
          }))
        )
      );

      form.append("start_date", start_date);
      form.append("end_date", end_date);

      // Priority fields
      form.append("priority", params.priority);
      form.append("priority_detail", params.priorityDetail);

      form.append("message", reason);
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

      // Show loading (allowed)
      Toast.show({
        type: "info",
        text1: "Submitting Request",
        text2: "Please wait...",
      });

      const res = await fetch("http://10.147.69.115:8000/api/create_reservation/", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });

      const raw = await res.text();
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {}

      // ⭐⭐⭐ IF FULLY RESERVED → SHOW MODAL, NOT TOAST ⭐⭐⭐
      if (res.status === 409 && data?.suggest_next === true) {
        Toast.hide(); // remove loading toast instantly

        setSuggestedRanges(data.suggested_ranges);
        setSuggestModal(true);  // show modal
        setShowRanges(false);   // reset range view
        return;                 // STOP HERE - do not show toast
      }

      // ⭐ SUCCESS
      if (res.status === 201) {
        Toast.show({
          type: "success",
          text1: "Reservation Successful",
          text2: "Your reservation has been created!",
        });

        setTimeout(() => {
          router.push({
            pathname: "/item_reservation_receipt",
            params: {
              transactionId: data.transaction_id,
              start_date: start_date,
              end_date: end_date,
              main_item_name: mainItem.name,
              main_item_qty: String(mainItem.qty),
              added_items_json: JSON.stringify(addedItems),
            },
          });
        }, 900);
        return;
      }

      // ⭐ GENERIC ERROR (not suggested dates)
      Toast.show({
        type: "error",
        text1: "Reservation Failed",
        text2: data?.detail || "Something went wrong.",
      });

    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Please check your internet connection.",
      });
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

      <ScrollView
        style={{ marginTop: 100 }}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Status */}
        <View style={styles.pendingBox}>
          <Ionicons name="information-circle" size={22} color="#FFA500" />
          <Text style={styles.pendingText}>
            This reservation is <Text style={{ fontWeight: "bold" }}>pending</Text>{" "}
            and requires admin approval.
          </Text>
        </View>

        {/* ITEMS CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items Reserved</Text>

          {/* Main Item */}
          <View style={styles.itemSummaryRow}>
            <Image
              source={{ uri: mainItem.image }}
              style={styles.itemSummaryImg}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemSummaryName}>{mainItem.name}</Text>
              <Text style={styles.itemSummaryQty}>Qty: {mainItem.qty}</Text>
            </View>
          </View>

          {/* Added Items */}
          {addedItems.length > 0 &&
            addedItems.map((itm, index) => (
              <View key={index} style={styles.itemSummaryRow}>
                <Image
                  source={{ uri: itm.image }}
                  style={styles.itemSummaryImg}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemSummaryName}>{itm.name}</Text>
                  <Text style={styles.itemSummaryQty}>Qty: {itm.qty || "0"}</Text>
                </View>
              </View>
            ))}
        </View>


        {/* RESERVATION DETAILS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reservation Details</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Borrow Date</Text>
            <Text style={styles.value}>{start_date}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Return Date</Text>
            <Text style={styles.value}>{end_date}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Reason</Text>
            <Text style={styles.value}>{reason}</Text>
          </View>
        </View>

        {/* DOCUMENTS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Uploaded Documents</Text>

          <View style={styles.docsRow}>
            {!!letterPhoto && (
              <TouchableOpacity
                style={styles.docItem}
                onPress={() => setLetterPreview(true)}
              >
                <Image source={{ uri: letterPhoto }} style={styles.docImage} />
                <Text style={styles.imageLabel}>Request Letter</Text>
              </TouchableOpacity>
            )}

            {!!idPhoto && (
              <TouchableOpacity
                style={styles.docItem}
                onPress={() => setIdPreview(true)}
              >
                <Image source={{ uri: idPhoto }} style={styles.docImage} />
                <Text style={styles.imageLabel}>Valid ID</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* TERMS */}
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
            <Text style={styles.checkboxText}>
              I agree to the Terms & Conditions
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmBtn,
              { backgroundColor: acceptTerms ? "#FFA500" : "#ccc" },
            ]}
            disabled={!acceptTerms}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>Confirm Reservation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* LETTER PREVIEW */}
      <Modal visible={letterPreview} transparent>
        <View style={styles.modalOverlay}>
          <Image source={{ uri: letterPhoto }} style={styles.fullImage} />
          <TouchableOpacity
            onPress={() => setLetterPreview(false)}
            style={styles.closeIcon}
          >
            <Ionicons name="close-circle" size={35} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ID PREVIEW */}
      <Modal visible={idPreview} transparent>
        <View style={styles.modalOverlay}>
          <Image source={{ uri: idPhoto }} style={styles.fullImage} />
          <TouchableOpacity
            onPress={() => setIdPreview(false)}
            style={styles.closeIcon}
          >
            <Ionicons name="close-circle" size={35} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
      
      {/* 🔵 SUGGESTION MODAL */}
      <Modal visible={suggestModal} transparent animationType="fade">
        <View style={styles.suggestOverlay}>
          <View style={styles.suggestBox}>

            {!showRanges ? (
              <>
                <Text style={styles.suggestTitle}>Item Fully Reserved</Text>

                <Text style={styles.suggestMessage}>
                  This item is fully reserved on your selected dates.{"\n"}
                  Would you like to see available date ranges with the same duration?
                </Text>

                <View style={styles.suggestButtons}>
                  <TouchableOpacity
                    style={[styles.suggestBtn, { backgroundColor: "#4FC3F7" }]}
                    onPress={() => setShowRanges(true)}
                  >
                    <Text style={styles.suggestBtnText}>Yes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.suggestBtn, { backgroundColor: "#bbb" }]}
                    onPress={() => {
                      setSuggestModal(false);
                      router.push("/dashboard");
                    }}
                  >
                    <Text style={styles.suggestBtnText}>No</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.suggestTitle}>Available Date Ranges</Text>

                {suggestedRanges.map((r, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.rangeItem}
                    onPress={() => {
                      setSuggestModal(false);
                      router.push({
                        pathname: "/item_details",
                        params: {
                          id: mainItem.id,
                          start_date: r.start,
                          end_date: r.end,
                        },
                      });
                    }}
                  >
                    <Ionicons name="calendar" size={20} color="#4FC3F7" />
                    <Text style={styles.rangeText}>
                      {r.start} → {r.end}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.suggestBtn, { backgroundColor: "#bbb", marginTop: 15 }]}
                  onPress={() => setSuggestModal(false)}
                >
                  <Text style={styles.suggestBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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

  backButton: {
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: 8,
    borderRadius: 8,
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
    gap: 10,
    marginBottom: 20,
  },

  pendingText: { flex: 1, color: "#333", fontSize: 13 },

  card: {
    backgroundColor: "#ffffff22",
    borderRadius: 14,
    padding: 15,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ffffff33",
  },

  docsRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 10,
},

docItem: {
  width: "48%",
  alignItems: "center",
  backgroundColor: "#ffffff55",
  borderRadius: 12,
  padding: 10,
},

docImage: {
  width: "100%",
  height: 130,
  borderRadius: 10,
  backgroundColor: "#fff",
  marginBottom: 6,
},


  sectionTitle: {
    color: "#0d0d0dff",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: { color: "#060606ff", fontSize: 13, width: "45%" },
  value: {
    color: "#060606ff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "right",
    flex: 1,
  },

  itemSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff99",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  itemSummaryImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#fff",
  },

  itemSummaryName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  suggestOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.6)",
  justifyContent: "center",
  alignItems: "center",
},

suggestBox: {
  width: "85%",
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 12,
  elevation: 10,
},

suggestTitle: {
  fontSize: 18,
  fontWeight: "700",
  textAlign: "center",
  marginBottom: 12,
  color: "#333",
},

suggestMessage: {
  textAlign: "center",
  color: "#666",
  fontSize: 14,
  marginBottom: 18,
},

suggestButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
},

suggestBtn: {
  paddingVertical: 10,
  width: "48%",
  borderRadius: 8,
},

suggestBtnText: {
  textAlign: "center",
  fontWeight: "700",
  color: "#fff",
},

rangeItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderColor: "#eee",
},

rangeText: {
  marginLeft: 10,
  fontSize: 15,
  fontWeight: "600",
},

  itemSummaryQty: { fontSize: 13, color: "#333" },

  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },

  imageBox: { alignItems: "center", marginVertical: 8 },

  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: "#060606ff",
  },
  imageLabel: { marginTop: 5, fontWeight: "700", color: "#000" },

  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },

  checkboxText: { marginLeft: 8, fontWeight: "600", color: "#000" },

  confirmBtn: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  confirmText: { fontWeight: "bold", textAlign: "center", fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },

  fullImage: { width: "90%", height: "70%", borderRadius: 10 },

  closeIcon: { position: "absolute", top: 60, right: 25 },
  
});

import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import { NotificationProvider, NotificationContext } from "../context/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";

function Notifications() {
  const router = useRouter();
  const { notifications, markAsRead, setNotifications, fetchNotifications } =
    useContext(NotificationContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, is_read: true }));
    setNotifications(updated);
    Alert.alert("All notifications marked as read");
  };

  const groupNotifications = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const groups = { Today: [], Yesterday: [], Earlier: [] };
    notifications.forEach((n) => {
      const notifDate = new Date(n.created_at).toDateString();
      if (notifDate === today) groups.Today.push(n);
      else if (notifDate === yesterday) groups.Yesterday.push(n);
      else groups.Earlier.push(n);
    });
    return groups;
  };

  const grouped = groupNotifications();

  const openNotifModal = (notif) => {
    markAsRead(notif.id);
    setSelectedNotif(notif);
    setModalVisible(true);
  };

  const saveImageToGallery = async (imageUrl) => {
    try {
      const filename = imageUrl.split("/").pop();
      const localPath = `${FileSystem.documentDirectory}${filename}`;
      const { uri } = await FileSystem.downloadAsync(imageUrl, localPath);
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("TrailLend QRs", asset, false);
      Alert.alert("QR saved to gallery!");
    } catch (err) {
      Alert.alert("Error saving image", err.message);
    }
  };

  // 🔹 Notification Card UI
  const renderNotification = ({ item }) => {
    let iconName = "notifications-outline";
    let iconColor = "#4A90E2";
    switch (item.type) {
      case "approval":
        iconName = "checkmark-circle-outline";
        iconColor = "#4CAF50";
        break;
      case "cancelled":
        iconName = "close-circle-outline";
        iconColor = "#E57373";
        break;
      case "claimed":
        iconName = "hand-left-outline";
        iconColor = "#42A5F5";
        break;
      case "returned":
        iconName = "repeat-outline";
        iconColor = "#9C27B0";
        break;
      case "pending":
        iconName = "time-outline";
        iconColor = "#FFB300";
        break;
      case "rejection":
        iconName = "alert-circle-outline";
        iconColor = "#E53935";
        break;
    }

    return (
      <TouchableOpacity
        style={[styles.card, item.is_read ? styles.read : styles.unread]}
        onPress={() => openNotifModal(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Ionicons name={iconName} size={20} color={iconColor} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
          {item.qr_code && <Ionicons name="qr-code-outline" size={20} color="#1E88E5" />}
        </View>
        <Text style={styles.cardMessage}>{item.message}</Text>
        <Text style={styles.date}>{item.created_at}</Text>
      </TouchableOpacity>
    );
  };

  const renderGroup = (title, data, showMarkAll = false) =>
    data.length > 0 && (
      <View style={styles.groupContainer}>
        <View style={styles.groupHeaderRow}>
          <Text style={styles.groupHeader}>{title}</Text>
          {showMarkAll && (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotification}
          scrollEnabled={false}
        />
      </View>
    );

  return (
    <LinearGradient colors={["#4FC3F7", "#1E88E5"]} style={styles.gradient}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Notifications</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.iconButton}>
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {notifications.length === 0 ? (
        <View style={styles.noNotificationsContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#fff" />
          <Text style={styles.noNotificationsText}>No notifications yet</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {renderGroup("Today", grouped.Today, true)}
          {renderGroup("Yesterday", grouped.Yesterday)}
          {renderGroup("Earlier", grouped.Earlier)}
        </ScrollView>
      )}

      {/* 🔷 MODAL (Professional UI with Icons) */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* 🔹 STATUS BANNER */}
            <View
              style={[
                styles.statusBanner,
                selectedNotif?.type === "approval"
                  ? { backgroundColor: "#E8F5E9" }
                  : selectedNotif?.type === "rejection"
                  ? { backgroundColor: "#FFEBEE" }
                  : selectedNotif?.type === "pending"
                  ? { backgroundColor: "#FFF8E1" }
                  : selectedNotif?.type === "cancelled"
                  ? { backgroundColor: "#FFEBEE" }
                  : { backgroundColor: "#E3F2FD" },
              ]}
            >
              <Ionicons
                name={
                  selectedNotif?.type === "approval"
                    ? "checkmark-circle"
                    : selectedNotif?.type === "rejection"
                    ? "close-circle"
                    : selectedNotif?.type === "pending"
                    ? "time"
                    : selectedNotif?.type === "claimed"
                    ? "hand-left"
                    : selectedNotif?.type === "returned"
                    ? "repeat"
                    : selectedNotif?.type === "cancelled"
                    ? "close-circle"
                    : "notifications"
                }
                size={22}
                color={
                  selectedNotif?.type === "approval"
                    ? "#43A047"
                    : selectedNotif?.type === "rejection"
                    ? "#E53935"
                    : selectedNotif?.type === "pending"
                    ? "#FB8C00"
                    : selectedNotif?.type === "cancelled"
                    ? "#E53935"
                    : "#1E88E5"
                }
                style={{ marginRight: 6 }}
              />
              <Text style={styles.bannerText}>
                {selectedNotif?.type === "approval"
                  ? "Approved"
                  : selectedNotif?.type === "rejection"
                  ? "Declined"
                  : selectedNotif?.type === "pending"
                  ? "Pending"
                  : selectedNotif?.type === "claimed"
                  ? "Claimed"
                  : selectedNotif?.type === "returned"
                  ? "Returned"
                  : selectedNotif?.type === "cancelled"
                  ? "Cancelled"
                  : "Notification"}
              </Text>
            </View>

            {/* 🔹 HEADER TITLE (DIFFERENT ICON) */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name={
                    selectedNotif?.type === "approval"
                      ? "document-text-outline"
                      : selectedNotif?.type === "rejection"
                      ? "alert-circle-outline"
                      : selectedNotif?.type === "pending"
                      ? "hourglass-outline"
                      : selectedNotif?.type === "claimed"
                      ? "briefcase-outline"
                      : selectedNotif?.type === "returned"
                      ? "arrow-undo-outline"
                      : "notifications-outline"
                  }
                  size={22}
                  color="#1E88E5"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.modalTitle}>{selectedNotif?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#1E88E5" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {/* 🔹 Date, Transaction, and Item */}
              <Text style={styles.detailText}>
                Date & Time:{" "}
                <Text style={styles.detailValue}>{selectedNotif?.created_at}</Text>
              </Text>
              <Text style={styles.detailText}>
                Transaction ID:{" "}
                <Text style={[styles.detailValue, { fontWeight: "700" }]}>
                  {selectedNotif?.transaction_id && selectedNotif.transaction_id !== "null"
                    ? selectedNotif.transaction_id
                    : "Not Available"}
                </Text>
              </Text>
              <Text style={styles.detailText}>
                Item:{" "}
                <Text style={[styles.detailValue, { fontWeight: "700" }]}>
                  {selectedNotif?.item_name || "No item info"}
                </Text>
              </Text>

              <View style={styles.divider} />

              {/* 🔹 Dynamic modal content */}
              {selectedNotif?.type === "pending" && (
                <>
                  {selectedNotif?.image_url && (
                    <Image source={{ uri: selectedNotif.image_url }} style={styles.itemImage} />
                  )}
                  <Text style={styles.statusText}>
                    Status:{" "}
                    <Text style={{ color: "#1E88E5" }}>
                      Pending – waiting for admin approval
                    </Text>
                  </Text>
                </>
              )}

              {selectedNotif?.type === "approval" && (
                <>
                  <Text style={styles.messageText}>
                    Your reservation has been approved by the admin.
                  </Text>
                  {selectedNotif?.qr_code && (
                    <>
                      <Image source={{ uri: selectedNotif.qr_code }} style={styles.qrImage} />
                      <TouchableOpacity onPress={() => saveImageToGallery(selectedNotif.qr_code)}>
                        <Text style={styles.saveText}>Save QR to Gallery</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <Text style={styles.noteText}>
                    Show this QR code to the admin to verify your reservation.
                  </Text>
                </>
              )}

              {selectedNotif?.type === "claimed" && (
                <>
                  <Text style={styles.policyHeader}>Item Borrowing & Return Policy</Text>
                  <View style={styles.policyList}>
                    <Text>• Borrowers must use the item only within their chosen time frame.</Text>
                    <Text>• Returning the item late three (3) times will mark you as a bad borrower and restrict future borrowing.</Text>
                    <Text>• Any damages must be reported immediately through the Damage Report page.</Text>
                    <Text>• Failure to report damage, loss, or unclaimed items will result in being marked as a bad borrower.</Text>
                    <Text>• Please ensure all items are returned on time and in good condition.</Text>
                  </View>
                </>
              )}

              {selectedNotif?.type === "returned" && (
                <Text style={styles.messageText}>
                  Item has been successfully returned. We hope to see you borrow again soon!
                </Text>
              )}

              {selectedNotif?.type === "rejection" && (
                <>
                  <Text style={styles.messageText}>
                    Your reservation for this item was declined.
                  </Text>
                  {selectedNotif?.reason && (
                    <Text style={styles.reasonText}>Reason: {selectedNotif.reason}</Text>
                  )}
                </>
              )}
              {selectedNotif?.type === "cancelled" && (
                <>
                  <Text style={styles.messageText}>
                    {selectedNotif?.title?.includes("Admin")
                      ? "Your reservation was cancelled by the admin."
                      : "You cancelled your reservation."}
                  </Text>

                  {selectedNotif?.item_name && (
                    <Text style={styles.detailText}>
                      Item: <Text style={styles.detailValue}>{selectedNotif.item_name}</Text>
                    </Text>
                  )}
                  <Text style={[styles.noteText, { color: "#E53935" }]}>
                    The reserved slot has been released. Please contact the administrator if this was a mistake.
                  </Text>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

export default function NotificationBellScreen() {
  return (
    <NotificationProvider>
      <Notifications />
    </NotificationProvider>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  gradient: { flex: 1, paddingHorizontal: 16, paddingTop: 45 },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  header: { color: "#fff", fontSize: 20, fontWeight: "700" },
  iconButton: { backgroundColor: "rgba(255,255,255,0.2)", padding: 8, borderRadius: 10 },
  groupContainer: { marginBottom: 20 },
  groupHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, marginTop: 8 },
  groupHeader: { fontSize: 15, fontWeight: "700", color: "#fff" },
  markAllText: { color: "#FFD54F", fontSize: 13, fontWeight: "700" },
  card: { backgroundColor: "#fff", borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  unread: { borderLeftWidth: 4, borderLeftColor: "#4FC3F7" },
  read: { opacity: 0.8 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#1E88E5" },
  cardMessage: { fontSize: 13, color: "#555", marginBottom: 5, lineHeight: 18 },
  date: { fontSize: 11, color: "#999", textAlign: "right" },
  noNotificationsContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  noNotificationsText: { color: "#fff", fontSize: 16, marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalCard: { backgroundColor: "#fff", borderRadius: 18, width: width * 0.9, padding: 20 },
  statusBanner: { flexDirection: "row", alignItems: "center", padding: 8, borderRadius: 10, marginBottom: 10 },
  bannerText: { fontWeight: "600", color: "#333" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1E88E5" },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 10 },
  detailText: { fontSize: 13, color: "#333", marginBottom: 3 },
  detailValue: { color: "#111" },
  messageText: { fontSize: 14, color: "#333", lineHeight: 20, marginVertical: 8 },
  noteText: { fontSize: 12, color: "#777", textAlign: "center", marginTop: 6 },
  reasonText: { color: "#E53935", fontWeight: "600" },
  policyHeader: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  policyList: { gap: 4, marginLeft: 6 },
  statusText: { marginTop: 10, fontSize: 13 },
  itemImage: { width: 120, height: 120, borderRadius: 10, alignSelf: "center", marginVertical: 10 },
  qrImage: { width: 200, height: 200, alignSelf: "center", marginVertical: 10 },
  saveText: { color: "#1E88E5", textAlign: "center", marginTop: 6, fontWeight: "600" },
});

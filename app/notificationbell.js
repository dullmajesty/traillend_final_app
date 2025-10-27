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
  const [selectedQR, setSelectedQR] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, is_read: true }));
    setNotifications(updated);
    Alert.alert("All notifications marked as read ✅");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const openQRModal = (qr) => {
    setSelectedQR(qr);
    setModalVisible(true);
  };

  const saveImageToGallery = async (imageUrl) => {
    try {
      const filename = imageUrl.split("/").pop();
      const localPath = `${FileSystem.documentDirectory}${filename}`;
      const { uri } = await FileSystem.downloadAsync(imageUrl, localPath);
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("TrailLend QRs", asset, false);
      Alert.alert("✅ QR saved to gallery!");
    } catch (err) {
      Alert.alert("Error saving image", err.message);
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        markAsRead(item.id);
        if (item.qr_code) openQRModal(item.qr_code);
      }}
      style={[styles.card, item.is_read ? styles.read : styles.unread]}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Ionicons
            name={
              item.type === "approval"
                ? "checkmark-circle-outline"
                : item.type === "cancelled"
                ? "close-circle-outline"
                : item.type === "received"
                ? "cube-outline"
                : item.type === "returned"
                ? "repeat-outline"
                : "notifications-outline"
            }
            size={20}
            color={
              item.type === "approval"
                ? "#4CAF50"
                : item.type === "cancelled"
                ? "#E57373"
                : item.type === "received"
                ? "#2196F3"
                : item.type === "returned"
                ? "#9C27B0"
                : "#4A90E2"
            }
            style={{ marginRight: 8 }}
          />
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
        {item.qr_code && <Ionicons name="qr-code-outline" size={20} color="#1E88E5" />}
      </View>
      <Text style={styles.cardMessage}>{item.message}</Text>
      <Text style={styles.date}>{item.created_at}</Text>
    </TouchableOpacity>
  );

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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {renderGroup("Today", grouped.Today, true)}
          {renderGroup("Yesterday", grouped.Yesterday)}
          {renderGroup("Earlier", grouped.Earlier)}
        </ScrollView>
      )}

      {/* QR MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QR Code</Text>
            {selectedQR && (
              <Image
                source={{ uri: selectedQR }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => saveImageToGallery(selectedQR)}
              style={styles.saveButtonWrapper}
            >
              <LinearGradient
                colors={["#64B5F6", "#1976D2"]}
                start={[0, 0]}
                end={[1, 0]}
                style={styles.saveGradient}
              >
                <Ionicons name="download-outline" size={18} color="#fff" />
                <Text style={styles.saveText}>Save to Gallery</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
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
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 45,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  header: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  iconButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 10,
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8,
  },
  groupHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  markAllText: {
    color: "#FFD54F",
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: "#4FC3F7",
  },
  read: {
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E88E5",
  },
  cardMessage: {
    fontSize: 13,
    color: "#555",
    marginBottom: 5,
    lineHeight: 18,
  },
  date: {
    fontSize: 11,
    color: "#999",
    textAlign: "right",
  },
  noNotificationsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noNotificationsText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    width: width * 0.8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E88E5",
    marginBottom: 10,
  },
  qrImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 10,
  },
  saveButtonWrapper: {
    width: "100%",
    borderRadius: 10,
    marginTop: 15,
    overflow: "hidden",
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  closeButton: {
    marginTop: 12,
  },
  closeText: {
    color: "#1976D2",
    fontWeight: "700",
    fontSize: 15,
  },
});

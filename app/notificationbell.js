import React, { useContext, useState } from 'react';
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
} from 'react-native';
import { NotificationProvider, NotificationContext } from '../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

function Notifications() {
  const router = useRouter();
  const { notifications, markAsRead, setNotifications, fetchNotifications } = useContext(NotificationContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Group notifications by date
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
    Alert.alert('All notifications marked as read ✅');
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
      const filename = imageUrl.split('/').pop();
      const localPath = `${FileSystem.documentDirectory}${filename}`;
      const { uri } = await FileSystem.downloadAsync(imageUrl, localPath);
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('TrailLend QRs', asset, false);
      Alert.alert('QR saved to gallery 📁');
    } catch (err) {
      Alert.alert('Error saving image', err.message);
    }
  };

  // ✅ Renders each notification card
  const renderNotification = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        markAsRead(item.id);
        if (item.qr_code) openQRModal(item.qr_code);
      }}
      style={[styles.card, item.is_read ? styles.read : styles.unread]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Ionicons
            name={
              item.type === 'approval' ? 'checkmark-circle-outline' :
              item.type === 'cancelled' ? 'close-circle-outline' :
              item.type === 'received' ? 'cube-outline' :
              item.type === 'returned' ? 'repeat-outline' :
              'notifications-outline'
            }
            size={20}
            color={
              item.type === 'approval' ? '#4CAF50' :
              item.type === 'cancelled' ? '#E57373' :
              item.type === 'received' ? '#2196F3' :
              item.type === 'returned' ? '#9C27B0' :
              '#4A90E2'
            }
            style={{ marginRight: 8 }}
          />
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
        {item.qr_code && <Ionicons name="qr-code-outline" size={20} color="#4A90E2" />}
      </View>
      <Text style={styles.cardMessage}>{item.message}</Text>
      <View style={styles.dateRow}>
        <Text style={styles.date}>{item.created_at}</Text>
      </View>
    </TouchableOpacity>
  );

  // ✅ Render grouped lists
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F5F5F5" />
        </TouchableOpacity>
        <Text style={styles.header}>Notifications</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={22} color="#F5F5F5" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {notifications.length === 0 ? (
        <View style={styles.noNotificationsContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#fff" />
          <Text style={styles.noNotificationsText}>No notifications yet</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {renderGroup('Today', grouped.Today, true)}
          {renderGroup('Yesterday', grouped.Yesterday)}
          {renderGroup('Earlier', grouped.Earlier)}
        </ScrollView>
      )}

      {/* QR Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QR Code</Text>
            {selectedQR && <Image source={{ uri: selectedQR }} style={styles.qrImage} resizeMode="contain" />}
            <TouchableOpacity style={styles.saveButton} onPress={() => saveImageToGallery(selectedQR)}>
              <Ionicons name="download-outline" size={18} color="#fff" />
              <Text style={styles.saveText}>Save to Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function NotificationBellScreen() {
  return (
    <NotificationProvider>
      <Notifications />
    </NotificationProvider>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#97c6d2', paddingHorizontal: 14, paddingTop: 40 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  backButton: { padding: 5 },
  header: { color: '#F5F5F5', fontSize: 20, fontWeight: '700' },
  refreshButton: { padding: 5 },
  groupContainer: { marginBottom: 10 },
  groupHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 8 },
  groupHeader: { fontSize: 15, fontWeight: '700', color: '#1A1550' },
  markAllText: { color: '#E57373', fontSize: 15, fontWeight: '800' },
  card: { backgroundColor: '#F8F8F8', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1A1550', marginBottom: 3 },
  cardMessage: { fontSize: 13, color: '#555', marginBottom: 5, lineHeight: 18 },
  dateRow: { borderTopWidth: 0.8, borderTopColor: '#EEE', paddingTop: 5, marginTop: 4 },
  date: { fontSize: 11, color: '#888' },
  read: { opacity: 0.7 },
  unread: { opacity: 1, borderLeftWidth: 3, borderLeftColor: '#4A90E2', paddingLeft: 9 },
  noNotificationsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noNotificationsText: { fontSize: 16, color: '#fff', fontWeight: '500', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: width * 0.8, borderRadius: 14, alignItems: 'center', padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1550', marginBottom: 10 },
  qrImage: { width: width * 0.6, height: width * 0.6, borderRadius: 10 },
  saveButton: { marginTop: 12, backgroundColor: '#4A90E2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  saveText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  closeButton: { marginTop: 10 },
  closeText: { color: '#4A90E2', fontSize: 15, fontWeight: '600' },
});

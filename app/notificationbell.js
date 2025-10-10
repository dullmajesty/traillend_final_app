import React, { useContext, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { NotificationProvider, NotificationContext } from '../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

function Notifications() {
  const router = useRouter();
  const { notifications, setNotifications } = useContext(NotificationContext);

  useEffect(() => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  }, []);

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.read ? styles.read : styles.unread]}>
      <Text style={styles.cardTitle}>{item.title || "Notification"}</Text>
      <Text style={styles.cardMessage}>{item.message}</Text>
      <View style={styles.dateRow}>
        <Text style={styles.date}>{item.date || 'Today'}</Text>
        <Text style={styles.time}>{item.time || 'Now'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F5F5F5" />
        </TouchableOpacity>
        <Text style={styles.header}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Show no notifications if array is empty */}
      {notifications.length === 0 ? (
        <View style={styles.noNotificationsContainer}>
          <Text style={styles.noNotificationsText}>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#97c6d2',
    paddingHorizontal: 14,
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    padding: 5,
  },
  header: {
    color: '#F5F5F5',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1A1550',
    marginBottom: 3,
  },
  cardMessage: {
    fontSize: 13,
    color: '#555',
    marginBottom: 5,
    lineHeight: 17,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.8,
    borderTopColor: '#EEE',
    paddingTop: 5,
    marginTop: 2,
  },
  date: {
    fontSize: 11,
    color: '#999',
  },
  time: {
    fontSize: 11,
    color: '#999',
  },
  read: {
    opacity: 0.75,
  },
  unread: {
    opacity: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
    paddingLeft: 9,
  },
  noNotificationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

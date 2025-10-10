import React, { useContext } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { NotificationContext } from '../context/NotificationContext';

export default function HeaderIcons() {
  const router = useRouter();
  const { notifications = [] } = useContext(NotificationContext);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={{ flexDirection: 'row', marginRight: 10 }}>
      {/* Notification Bell */}
      <TouchableOpacity onPress={() => router.push('/notificationbell')} style={{ padding: 5 }}>
        <Ionicons name="notifications-outline" size={28} color="black" />
        {unreadCount > 0 && (
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              backgroundColor: 'red',
              borderRadius: 10,
              paddingHorizontal: 5,
              paddingVertical: 1,
            }}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Profile Icon */}
      <TouchableOpacity
        style={{ marginLeft: 15 }}
        onPress={() => router.push('/view_profile')}
      >
        <Ionicons name="person-circle-outline" size={28} color="#FFA500" />
      </TouchableOpacity>
    </View>
  );
}

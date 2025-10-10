import React, { useContext } from 'react';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { NotificationContext, NotificationProvider } from '../../context/NotificationContext';

// ========== Drawer Layout ==========
function AppDrawer() {
  const router = useRouter();
  const { notifications } = useContext(NotificationContext);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/HULAM-SIDE.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Default Drawer Items */}
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
      )}
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#97c6d2' },
        headerTitleAlign: 'center',
        drawerIcon: ({ color, size }) => {
          const icons = {
            AdminDashboard: 'grid-outline',
            Reservation_Status: 'cube-outline',
            Edit_Profile: 'people-outline',
            Report_Damage: 'cash-outline',
            logout: 'log-out-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse-outline'} size={size} color={color} />;
        },
        headerRight: () => (
          <View style={styles.headerIconsContainer}>
            {/* Notification Bell */}
            <TouchableOpacity onPress={() => router.push('/notificationbell')} style={{ padding: 5 }}>
              <Ionicons name="notifications-outline" size={28} color="#FFA500" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile Icon */}
            <TouchableOpacity onPress={() => router.push('view_profile')} style={{ padding: 5 }} >
              <Ionicons name="person-circle-outline" size={28} color="#FFA500" />
            </TouchableOpacity>
          </View>
        ),
      })}
    >
      <Drawer.Screen name="AdminDashboard" options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="Reservation_Status" options={{ title: 'Reservations' }} />
      <Drawer.Screen name="Edit_Profile" options={{ title: 'Edit Profile' }} />
      <Drawer.Screen name="Report_Damage" options={{ title: 'Report Damage' }} />
      <Drawer.Screen name="logout" options={{ title: 'Log Out' }} />
    </Drawer>
  );
}

// ========== Wrap Drawer with NotificationProvider ==========
export default function DrawerLayout() {
  return (
    <NotificationProvider>
      <AppDrawer />
    </NotificationProvider>
  );
}

// ========== Styles ==========
const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginVertical: 10, 
    padding: 10,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
  },
  headerIconsContainer: {
    flexDirection: 'row',
    marginRight: 10,
    justifyContent: 'center',
  },
  iconButton: {
    marginLeft: 15,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
  },
});

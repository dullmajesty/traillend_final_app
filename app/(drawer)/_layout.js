import React, { useContext } from "react";
import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Image, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { NotificationContext, NotificationProvider } from "../../context/NotificationContext";
import { clearAuth } from "../../lib/authStorage"; // ✅ make sure you have this helper

function AppDrawer() {
  const router = useRouter();
  const { notifications } = useContext(NotificationContext);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ✅ Logout function
  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await clearAuth(); // remove tokens from storage
            router.replace("/login"); // redirect to login page
          } catch (err) {
            console.error("Logout error:", err);
            Alert.alert("Error", "Something went wrong during logout.");
          }
        },
      },
    ]);
  };

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/TRAILLEND.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Default Drawer Items */}
          <DrawerItemList {...props} />

          {/* ✅ Custom Logout Button */}
          <DrawerItem
            label="Log Out"
            onPress={handleLogout}
            icon={({ color, size }) => (
              <Ionicons name="log-out-outline" size={size} color={color} />
            )}
          />
        </DrawerContentScrollView>
      )}
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: "#ffff" },
        headerTitleAlign: "center",
        drawerIcon: ({ color, size }) => {
          const icons = {
            AdminDashboard: "grid-outline",
            Reservation_Status: "cube-outline",
            Edit_Profile: "people-outline",
            Report_Damage: "cash-outline",
          };
          return (
            <Ionicons name={icons[route.name] || "ellipse-outline"} size={size} color={color} />
          );
        },
        headerRight: () => (
          <View style={styles.headerIconsContainer}>
            {/* Notification Bell */}
            <TouchableOpacity onPress={() => router.push("/notificationbell")} style={{ padding: 5 }}>
              <Ionicons name="notifications-outline" size={28} color="#FFA500" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile Icon */}
            <TouchableOpacity onPress={() => router.push("view_profile")} style={{ padding: 5 }}>
              <Ionicons name="person-circle-outline" size={28} color="#FFA500" />
            </TouchableOpacity>
          </View>
        ),
      })}
    >
      <Drawer.Screen name="AdminDashboard" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="Reservation_Status" options={{ title: "Reservations Status" }} />
      <Drawer.Screen name="Edit_Profile" options={{ title: "Edit Profile" }} />
      <Drawer.Screen name="Report_Damage" options={{ title: "Report Damage" }} />
    </Drawer>
  );
}

export default function DrawerLayout() {
  return (
    <NotificationProvider>
      <AppDrawer />
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginVertical: 10,
    padding: 10,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: "contain",
  },
  headerIconsContainer: {
    flexDirection: "row",
    marginRight: 10,
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
  },
});

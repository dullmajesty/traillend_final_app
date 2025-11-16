import React, { useContext, useState, useEffect, useRef } from "react";
import { Drawer } from "expo-router/drawer";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { NotificationContext, NotificationProvider } from "../../context/NotificationContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearAuth } from "../../lib/authStorage";


function AppDrawer() {
  const router = useRouter();
  const { notifications } = useContext(NotificationContext);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // RESTRICTED ACCOUNT STATE
  const [restricted, setRestricted] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await AsyncStorage.getItem("borrowerStatus");
        if (status === "Bad") {
          setRestricted(true);

          // Trigger animation
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }
      } catch (e) {
        console.log("Status check error", e);
      }
    };
    checkStatus();
  }, []);

  // LOGOUT FUNCTION
  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await clearAuth();
            router.replace("/login");
          } catch (err) {
            console.error("Logout error:", err);
            Alert.alert("Error", "Something went wrong during logout.");
          }
        },
      },
    ]);
  };

  return (
    <>
      {/* 🔥 Animated Restriction Modal */}
      {restricted && (
        <Animated.View
          style={[
            styles.restrictedOverlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <BlurView intensity={60} tint="dark" style={styles.blurBg} />

          <Animated.View
            style={[
              styles.restrictedCard,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Ionicons name="close-circle-outline" size={75} color="#B71C1C" />

            <Text style={styles.restrictedTitle}>Your Account is Restricted</Text>

            <Text style={styles.restrictedMsg}>
              Due to <Text style={{ fontWeight: "bold" }}>3 recorded late returns</Text>,
              your borrowing privileges have been locked.
            </Text>

            <Text style={styles.restrictedMsg}>
              You can still log in, but you cannot use any borrowing functions until the restriction is lifted.
            </Text>

            {/* Rules */}
            <View style={{ marginTop: 20 }}>
              <Text style={styles.resetHeader}>Monthly Reset Information</Text>
              <Text style={styles.resetDetail}>• Late return records reset every month.</Text>
              <Text style={styles.resetDetail}>
                • Restricted accounts do <Text style={{ fontWeight: "700" }}>NOT</Text> reset automatically.
              </Text>
              <Text style={styles.resetDetail}>
                • Visit or contact the GSO to restore your access.
              </Text>
            </View>

            {/* Logout */}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutBtnText}>LOG OUT</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

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

            {/* Drawer Items */}
            <DrawerItemList {...props} />

            {/* Logout */}
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
              <Ionicons
                name={icons[route.name] || "ellipse-outline"}
                size={size}
                color={color}
              />
            );
          },
          headerRight: () => (
            <View style={styles.headerIconsContainer}>
              <TouchableOpacity
                onPress={() => router.push("/notificationbell")}
                style={{ padding: 5 }}
              >
                <Ionicons
                  name="notifications-outline"
                  size={28}
                  color="#FFA500"
                />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("view_profile")}
                style={{ padding: 5 }}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={28}
                  color="#FFA500"
                />
              </TouchableOpacity>
            </View>
          ),
        })}
      >
        <Drawer.Screen name="AdminDashboard" options={{ title: "Dashboard" }} />
        <Drawer.Screen
          name="Reservation_Status"
          options={{ title: "Reservations Status" }}
        />
        <Drawer.Screen name="Edit_Profile" options={{ title: "Edit Profile" }} />
        <Drawer.Screen name="Report_Damage" options={{ title: "Report Damage" }} />
      </Drawer>
    </>
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
  },
  headerIconsContainer: {
    flexDirection: "row",
    marginRight: 10,
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

  // 🔥 RESTRICTED MODAL
  restrictedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },

  blurBg: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  restrictedCard: {
    width: "88%",
    padding: 25,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    alignItems: "center",
  },

  restrictedTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 10,
    color: "#B71C1C",
    textAlign: "center",
  },

  restrictedMsg: {
    marginTop: 10,
    fontSize: 15,
    textAlign: "center",
    color: "#444",
    lineHeight: 20,
  },

  resetHeader: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    color: "#1E88E5",
    textAlign: "center",
  },

  resetDetail: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 4,
  },

  logoutBtn: {
    marginTop: 25,
    backgroundColor: "#C62828",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 12,
  },

  logoutBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});

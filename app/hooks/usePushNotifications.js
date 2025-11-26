// app/hooks/usePushNotifications.js
import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.147.69.115:8000"; // your backend

// Configure how notifications behave
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();

  async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
      // ⭐ ANDROID NOTIFICATION CHANNEL (REQUIRED FOR RELIABLE DELIVERY)
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#1976D2",
      });

      // Request permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Permission for notifications denied.");
        return;
      }

      // ⭐ GET EXPO PUSH TOKEN (Uses correct EAS project ID)
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "ff6f68d3-15c6-430f-ab03-9a9724a1ec4a",
        })
      ).data;

      console.log("📌 EXPO TOKEN:", token);
      setExpoPushToken(token);

      await AsyncStorage.setItem("expoPushToken", token);

      // ⭐ SEND TOKEN TO BACKEND
      try {
        const access = await AsyncStorage.getItem("access_token");
        if (access) {
          await fetch(`${API_URL}/api/save_device_token/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${access}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });
          console.log("✅ Token sent to backend");
        }
      } catch (error) {
        console.log("❌ Error sending token to backend:", error);
      }
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync();

    // ⭐ FOREGROUND LISTENER
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📩 Notification received in foreground:", notification);
      });

    // ⭐ RESPONSE LISTENER (when user taps the notification)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("📨 User interacted with notification:", response);
      });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }

      if (responseListener.current) {
        Notifications.removeNotificationSubscription(
          responseListener.current
        );
      }
    };
  }, []);

  return { expoPushToken };
}

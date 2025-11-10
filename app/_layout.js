import { Stack } from "expo-router";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <>
      {/* Stack controls navigation for all screens including (drawer) */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* ✅ Global Toast: visible across all screens */}
      <Toast position="top" topOffset={60} visibilityTime={3000} />
    </>
  );
}

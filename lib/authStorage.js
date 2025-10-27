import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Save JWT tokens and username
 */
export const setAuth = async ({ access, refresh, username }) => {
  try {
    const pairs = [["accessToken", access], ["refreshToken", refresh]];
    if (username) pairs.push(["username", username]);
    await AsyncStorage.multiSet(pairs);
  } catch (err) {
    console.error("Error saving auth tokens:", err);
  }
};

/**
 * Get tokens and username
 */
export const getAuth = async () => {
  try {
    const values = await AsyncStorage.multiGet(["accessToken", "refreshToken", "username"]);
    const auth = Object.fromEntries(values);
    if (!auth.accessToken || !auth.refreshToken) {
      console.warn("⚠️ No tokens found in storage");
      return null;
    }
    return auth;
  } catch (err) {
    console.error("Error getting auth tokens:", err);
    return null;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuth = async () => {
  try {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "username"]);
  } catch (err) {
    console.error("Error clearing auth tokens:", err);
  }
};

/**
 * Check if user is logged in (used for session validation)
 */
export const isAuthenticated = async () => {
  const auth = await getAuth();
  return !!(auth && auth.accessToken);
};

// hooks/useRefresh.js
import { useState } from "react";

export default function useRefresh(fetchFunction) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchFunction();
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return { refreshing, onRefresh };
}

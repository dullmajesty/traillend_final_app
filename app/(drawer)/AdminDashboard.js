import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient"; //  Added
import useRefresh from "../../component/useRefresh";
import { authFetch } from "../../lib/authFetch";

const numColumns = 2;
const CARD_WIDTH = Dimensions.get("window").width / numColumns - 30;

export default function AdminDashboard() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  

const fetchItems = async () => {
  try {
    const response = await authFetch("/api/inventory_list/");
    if (!response.ok) throw new Error("Failed to fetch items");

    const data = await response.json();

    // ⭐ SORT ITEMS A → Z 
    const sortedItems = data.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    setItems(sortedItems);
  } catch (error) {
    console.error("Error fetching items:", error);
    if (error.message === "Session expired") {
      alert("Your session has expired. Please log in again.");
      router.replace("/login");
    }
  } finally {
    setLoading(false);
  }
};



  // Hook for pull-to-refresh
  const { refreshing, onRefresh } = useRefresh(fetchItems);

  // Auto-refresh when screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  // Filter items by search
  const filteredItems = items.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  //  Render each card
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/item_details?id=${item.item_id}`)}
    >
      <Image
        source={{
          uri: item.image
            ? item.image
            : "https://via.placeholder.com/150?text=No+Image",
        }}
        style={styles.cardImage}
        resizeMode="contain"
      />
      <Text style={styles.cardTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#4FC3F7", "#1E88E5"]} // gradient colors
      start={[0, 0]}
      end={[0, 1]}
      style={styles.container}
    >
      {/*  Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Title */}
      <Text style={styles.listTitle}>List Of Items</Text>

      {/*  Loading / Empty / List */}
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.item_id.toString()}
          renderItem={renderItem}
          numColumns={numColumns}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </LinearGradient>
  );
}

//  Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 45,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: "#000" },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    width: "47%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: { fontSize: 16, color: "#fff" },
});

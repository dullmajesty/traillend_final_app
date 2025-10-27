import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    key: "1",
    title: "Borrow Barangay Equipment Hassle-Free",
    description: "Easily borrow items like sports gear, lab equipment, or event supplies with just a few taps. Track your requests instantly!",
    image: require("../assets/onboard1.png"),
  },
  {
    key: "2",
    title: "Lend and Manage Items Efficiently",
    description: "Administrators can quickly lend and monitor inventory. Stay updated with real-time item availability and return status.",
    image: require("../assets/onboard2.png"),
  },
  {
    key: "3",
    title: "Track Everything with QR Codes",
    description: "Scan QR codes to borrow or return items. TrailLend ensures a secure, fast, and reliable lending experience for everyone.",
    image: require("../assets/onboard3.png"),
  },
];


export default function App() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push("/login");
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
  if (viewableItems.length > 0) {
    setCurrentIndex(viewableItems[0].index);
  }
}).current;


  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        ref={flatListRef}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? "Continue" : "Next"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  slide: { width, alignItems: "center", padding: 20, justifyContent: "center" },
  image: { width: 250, height: 250, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10, color: "#64B5F6" },
  description: { fontSize: 16, textAlign: "center", color: "#333" },
  dotsContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ccc", marginHorizontal: 5 },
  activeDot: { backgroundColor: "#64B5F6" },
  button: { backgroundColor: "#64B5F6", paddingVertical: 12, marginHorizontal: 40, borderRadius: 8, marginBottom: 50 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
});

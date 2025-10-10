import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';


export default function ReservationStatus() {
  const [selectedFilter, setSelectedFilter] = useState('Pending');

  const filters = ['Pending', 'Upcoming', 'Past', 'Cancelled'];

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>FILTER</Text>
        <View style={styles.buttonsContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.selectedButton,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedFilter === filter && styles.selectedText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reservation Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.noData}>No reservations yet</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' }, // match dark background
  filterContainer: { marginBottom: 20 },
  filterLabel: { color: '#fffff', fontWeight: 'bold', marginBottom: 10, fontSize: 16 },
  buttonsContainer: { flexDirection: 'row', gap: 5 },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#97c6d2',
  },
  selectedButton: { backgroundColor: '#FFC107', borderColor: '#FFC107' }, // yellow for selected
  buttonText: { color: '#fff', fontWeight: '600' },
  selectedText: { color: '#1B1B4D' }, // text color for selected
  statusContainer: { marginTop: 30 },
  noData: { color: '#97c6d2', textAlign: 'center', fontSize: 16 },
});

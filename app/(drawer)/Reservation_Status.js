import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  ActivityIndicator, Modal, Image, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReservationStatus() {
  const [selectedFilter, setSelectedFilter] = useState('Pending');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filters = ['Pending', 'Upcoming', 'Past', 'Cancelled'];

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError('');

      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setError('No access token found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://192.168.151.115:8000/api/user_reservations/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setReservations(data.reservations);
      } else {
        setError('No reservations found.');
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('accessToken');
              const res = await fetch(`http://192.168.151.115:8000/api/reservations/${id}/cancel/`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });
              const data = await res.json();
              if (data.success) {
                Alert.alert('Success', 'Your reservation has been successfully cancelled.');
                setModalVisible(false);
                fetchReservations(); // refresh list
              } else {
                Alert.alert('Error', data.message || 'Unable to cancel reservation.');
              }
            } catch (error) {
              console.error('Cancel error:', error);
              Alert.alert('Error', 'Something went wrong.');
            }
          },
        },
      ]
    );
  };

  const filteredReservations = reservations.filter((r) => {
    if (selectedFilter === 'Pending') return r.status === 'pending';
    if (selectedFilter === 'Upcoming') return r.status === 'approved';
    if (selectedFilter === 'Past') return r.status === 'returned';
    if (selectedFilter === 'Cancelled') return r.status === 'cancelled' || r.status === 'rejected';
    return false;
  });

  const renderReservation = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedReservation(item);
        setModalVisible(true);
      }}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, { backgroundColor: '#ddd' }]} />
      )}
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.itemName}>{item.item_name}</Text>
        <Text style={styles.detail}>Date: {item.date}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFC107';
      case 'approved': return '#4BB543';
      case 'rejected': return '#D32F2F';
      case 'cancelled': return '#888';
      case 'returned': return '#97c6d2';
      default: return '#555';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>FILTER</Text>
        <View style={styles.buttonsContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, selectedFilter === filter && styles.selectedButton]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.buttonText, selectedFilter === filter && styles.selectedText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statusContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#97c6d2" />
        ) : error ? (
          <Text style={styles.noData}>{error}</Text>
        ) : filteredReservations.length === 0 ? (
          <Text style={styles.noData}>No {selectedFilter.toLowerCase()} reservations found.</Text>
        ) : (
          <FlatList
            data={filteredReservations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderReservation}
          />
        )}
      </View>

      {/* Reservation Details Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedReservation && (
              <>
                <Text style={styles.modalTitle}>{selectedReservation.item_name}</Text>
                <Text>Date: {selectedReservation.date}</Text>
                <Text>Quantity: {selectedReservation.quantity}</Text>
                <Text>Status: {selectedReservation.status.toUpperCase()}</Text>
                <Text>Message: {selectedReservation.message || 'N/A'}</Text>
                {selectedReservation.image_url && (
                  <Image source={{ uri: selectedReservation.image_url }} style={styles.modalImage} />
                )}
                {selectedReservation.status === 'pending' && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => cancelReservation(selectedReservation.id)}
                  >
                    <Text style={styles.cancelText}>Cancel Reservation</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: '#fff' }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  filterContainer: { marginBottom: 20 },
  filterLabel: { color: '#000', fontWeight: 'bold', marginBottom: 10, fontSize: 16 },
  buttonsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#97c6d2',
    backgroundColor: '#97c6d2',
    marginRight: 5,
    marginBottom: 5,
  },
  selectedButton: { backgroundColor: '#FFC107', borderColor: '#FFC107' },
  buttonText: { color: '#fff', fontWeight: '600' },
  selectedText: { color: '#1B1B4D' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  image: { width: 70, height: 70, borderRadius: 8 },
  itemName: { fontWeight: 'bold', fontSize: 16, color: '#1B1B4D' },
  detail: { fontSize: 14, color: '#555' },
  status: { fontSize: 14, fontWeight: '700', marginTop: 3 },
  noData: { color: '#97c6d2', textAlign: 'center', fontSize: 16, marginTop: 30 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalImage: { width: 200, height: 200, borderRadius: 10, marginVertical: 10 },
  cancelButton: {
    marginTop: 15,
    backgroundColor: '#D32F2F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelText: { color: '#fff', fontWeight: 'bold' },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#97c6d2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


export default function DamageReport() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState('');
  const [quantityAffected, setQuantityAffected] = useState('');
  const [description, setDescription] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!location || !quantityAffected || !description || !image) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    if (parseInt(quantityAffected) <= 0) {
      Alert.alert('Error', 'Quantity affected must be at least 1.');
      return;
    }

    // Here you can send data to backend or API
    Alert.alert('Success', 'Report submitted successfully!');
    
    // Reset form
    setImage(null);
    setLocation('');
    setQuantityAffected('');
    setDescription('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.note}>
        ⚠️ Note: If any item is damaged or messed up, report the quantity affected, location, and describe the condition.
      </Text>

      <Text style={styles.label}>Upload Damage Image</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadText}>{image ? 'Image Selected' : 'Choose File'}</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      <Text style={styles.label}>Where is the damage?</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 5 chairs at front row"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Quantity Affected</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 5"
        value={quantityAffected}
        onChangeText={setQuantityAffected}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Describe the damage / mess</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="e.g. chairs are dirty and need cleaning"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
    padding: 20,
  },
  note: {
    color: '#0c64d8ff', 
    fontSize: 14,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  label: {
    color: '#000',
    marginBottom: 5,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#97c6d2',
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadText: {
    color: '#000',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 5,
  },
  input: {
    backgroundColor: '#97c6d2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#FFA500', 
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

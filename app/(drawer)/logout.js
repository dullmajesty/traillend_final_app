import { View, Text, StyleSheet } from 'react-native';

export default function Logout() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>You have logged out</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'red',
  },
});

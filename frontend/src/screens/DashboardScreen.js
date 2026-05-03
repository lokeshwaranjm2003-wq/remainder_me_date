import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const DashboardScreen = ({ navigation }) => {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    // In a real app we fetch with JWT token. For now, mocking.
    // fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await axios.get('http://10.0.2.2:5000/api/reminders', {
        headers: { Authorization: `Bearer MOCK_TOKEN` }
      });
      setReminders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Reminders</Text>

      <FlatList
        data={reminders}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.personName} ({item.relationship})</Text>
            <Text style={styles.date}>{new Date(item.date).toDateString()} - {item.type}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No reminders added yet.</Text>}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddReminder')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold' },
  date: { color: '#666', marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#000080', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 30, fontWeight: 'bold' }
});

export default DashboardScreen;

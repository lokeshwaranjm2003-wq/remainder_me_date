import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_BASE_URL } from '../config';

const DashboardScreen = ({ navigation }) => {
  const [reminders, setReminders] = useState([]);
  
  // Edit Modal States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [personName, setPersonName] = useState('');
  const [type, setType] = useState('DOB');
  const [relationship, setRelationship] = useState('Appa');
  const [customRelationship, setCustomRelationship] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const relationships = ['Appa', 'Amma', 'Wife', 'Husband', 'Sister', 'Brother', 'Lover', 'Friend', 'Other'];

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/api/reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(res.data);
    } catch (err) {
      console.log('Error fetching reminders:', err);
    }
  };

  const handleDelete = (id) => {
    const confirmDelete = () => {
      AsyncStorage.getItem('token').then(token => {
        axios.delete(`${API_BASE_URL}/api/reminders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
          .then(() => {
            fetchReminders();
          })
          .catch(err => {
            if (Platform.OS === 'web') window.alert('Failed to delete');
            else Alert.alert('Error', 'Failed to delete reminder');
          });
      });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this reminder?')) {
        confirmDelete();
      }
    } else {
      Alert.alert('Delete Reminder', 'Are you sure you want to delete this reminder?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete }
      ]);
    }
  };

  const openEditModal = (reminder) => {
    setEditingReminder(reminder);
    setPersonName(reminder.personName);
    setType(reminder.type);
    
    if (relationships.includes(reminder.relationship)) {
      setRelationship(reminder.relationship);
      setCustomRelationship('');
    } else {
      setRelationship('Other');
      setCustomRelationship(reminder.relationship);
    }
    
    setDate(new Date(reminder.date));
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!personName) {
      if (Platform.OS === 'web') return window.alert('Please enter a name');
      return Alert.alert('Error', 'Please enter a name');
    }
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const finalRelationship = relationship === 'Other' ? customRelationship : relationship;
      
      await axios.put(`${API_BASE_URL}/api/reminders/${editingReminder._id}`, 
        { personName, date, type, relationship: finalRelationship },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEditModalVisible(false);
      fetchReminders();
    } catch (err) {
      if (Platform.OS === 'web') window.alert('Failed to update');
      else Alert.alert('Error', 'Failed to update reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>My Reminders</Text>

        <FlatList
          data={reminders}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.name}>{item.personName} ({item.relationship})</Text>
                <Text style={styles.date}>{new Date(item.date).toDateString()} - {item.type}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                  <Text style={{ fontSize: 20 }}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionBtn}>
                  <Text style={{ fontSize: 20 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
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

        {/* Edit Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Reminder</Text>
              
              <TextInput style={styles.input} placeholder="Person Name" value={personName} onChangeText={setPersonName} />

              <Text style={styles.label}>Type</Text>
              <Picker selectedValue={type} onValueChange={setType} style={styles.picker}>
                <Picker.Item label="DOB" value="DOB" />
                <Picker.Item label="Wedding Day" value="Wedding" />
              </Picker>

              <Text style={styles.label}>Relationship</Text>
              <Picker selectedValue={relationship} onValueChange={setRelationship} style={styles.picker}>
                {relationships.map(rel => <Picker.Item key={rel} label={rel} value={rel} />)}
              </Picker>

              {relationship === 'Other' && (
                <TextInput style={styles.input} placeholder="Enter Custom Relationship" value={customRelationship} onChangeText={setCustomRelationship} />
              )}

              <Text style={styles.label}>Date: {date.toLocaleDateString()}</Text>
              {Platform.OS !== 'web' && (
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
                  <Text style={styles.dateButtonText}>Pick Date</Text>
                </TouchableOpacity>
              )}

              {Platform.OS === 'web' ? (
                React.createElement('input', {
                  type: 'date',
                  value: date.toISOString().split('T')[0],
                  onChange: (e) => setDate(new Date(e.target.value)),
                  style: { padding: 10, marginBottom: 20, borderRadius: 5, border: '1px solid #ccc', width: '100%', fontSize: 16, boxSizing: 'border-box' }
                })
              ) : showPicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowPicker(false);
                    if (event.type === 'set' && selectedDate) setDate(selectedDate);
                  }}
                />
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.button, { backgroundColor: '#aaa' }]} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardContent: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  date: { color: '#666', marginTop: 5 },
  actionButtons: { flexDirection: 'row' },
  actionBtn: { marginLeft: 15 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#000080', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  // Modal styles
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 10, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, marginTop: 5 },
  picker: { backgroundColor: '#f9f9f9', marginBottom: 10 },
  dateButton: { backgroundColor: '#ddd', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 15 },
  dateButtonText: { color: '#333', fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  button: { flex: 1, backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default DashboardScreen;

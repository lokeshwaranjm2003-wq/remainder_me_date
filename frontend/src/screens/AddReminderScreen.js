import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const API = `${API_BASE_URL}/api/reminders`;

const AddReminderScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [personName, setPersonName] = useState('');
  const [type, setType] = useState('DOB');
  const [relationship, setRelationship] = useState('Appa');
  const [customRelationship, setCustomRelationship] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const relationships = ['Appa', 'Amma', 'Wife', 'Husband', 'Sister', 'Brother', 'Lover', 'Friend', 'Other'];

  const handleSave = async () => {
    if (!personName) return Alert.alert('Error', 'Please enter a name');
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return Alert.alert('Error', 'Not logged in');
      }

      await axios.post(API, 
        { personName, date, type, relationship: relationship === 'Other' ? customRelationship : relationship },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Alert.alert('Success', 'Reminder added successfully!');
      navigation.navigate('Success');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Add New Reminder</Text>

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
            <TextInput 
              style={styles.input} 
              placeholder="Enter Custom Relationship" 
              value={customRelationship} 
              onChangeText={setCustomRelationship} 
            />
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
              style: { padding: 10, marginBottom: 20, borderRadius: 5, border: '1px solid #ccc', width: '100%', fontSize: 16 }
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

          <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('Remember_Me')}</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
  picker: { backgroundColor: '#f9f9f9', marginBottom: 15 },
  dateButton: { backgroundColor: '#ddd', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 20 },
  dateButtonText: { color: '#333', fontWeight: 'bold' },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default AddReminderScreen;

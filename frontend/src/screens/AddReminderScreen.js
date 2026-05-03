import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AddReminderScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [personName, setPersonName] = useState('');
  const [type, setType] = useState('DOB');
  const [relationship, setRelationship] = useState('Appa');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const relationships = ['Appa', 'Amma', 'Wife', 'Husband', 'Sister', 'Brother', 'Lover', 'Friend', 'Other'];

  const handleSave = async () => {
    try {
      // Mock saving - in real app, we use JWT token
      // await axios.post('http://10.0.2.2:5000/api/reminders', { personName, date, type, relationship });
      navigation.navigate('Success');
    } catch (err) {
      Alert.alert('Error', 'Failed to save reminder');
    }
  };

  return (
    <View style={styles.container}>
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

      <Text style={styles.label}>Date: {date.toLocaleDateString()}</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateButtonText}>Pick Date</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>{t('Remember_Me')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
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

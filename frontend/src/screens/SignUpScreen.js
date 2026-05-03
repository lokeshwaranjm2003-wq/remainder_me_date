import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const SignUpScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ username: '', email: '', phoneNumber: '', password: '', confirmPassword: '', otp: '' });
  const [step, setStep] = useState(1);

  const handleSendOTP = async () => {
    if (formData.password !== formData.confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }
    try {
      const res = await axios.post('http://10.0.2.2:5000/api/auth/send-otp', {
        email: formData.email,
        phoneNumber: formData.phoneNumber
      });
      Alert.alert('OTP Sent', `Mock OTP: ${res.data.mockOtp}`);
      setStep(2);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://10.0.2.2:5000/api/auth/register', formData);
      Alert.alert('Success', 'Registered successfully');
      navigation.navigate('SignIn');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('SignUp')}</Text>
      
      <TextInput style={styles.input} placeholder="Username" value={formData.username} onChangeText={(text) => setFormData({...formData, username: text})} />
      <TextInput style={styles.input} placeholder="Email" value={formData.email} onChangeText={(text) => setFormData({...formData, email: text})} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Phone Number" value={formData.phoneNumber} onChangeText={(text) => setFormData({...formData, phoneNumber: text})} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Password" value={formData.password} onChangeText={(text) => setFormData({...formData, password: text})} secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirm Password" value={formData.confirmPassword} onChangeText={(text) => setFormData({...formData, confirmPassword: text})} secureTextEntry />

      {step === 2 && (
        <TextInput style={styles.input} placeholder="4-digit OTP" value={formData.otp} onChangeText={(text) => setFormData({...formData, otp: text})} keyboardType="numeric" maxLength={4} />
      )}

      <TouchableOpacity 
        style={styles.button} 
        onPress={step === 1 ? handleSendOTP : handleRegister}
      >
        <Text style={styles.buttonText}>{step === 1 ? 'Send OTP' : t('Done')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center' }, // Green background
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default SignUpScreen;

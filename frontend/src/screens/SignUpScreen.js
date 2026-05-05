import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const API = `${API_BASE_URL}/api/auth`;

const SignUpScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ username: '', email: '', phoneNumber: '', password: '', confirmPassword: '', otp: '', referralCode: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!formData.username || !formData.email || !formData.phoneNumber || !formData.password) {
      return Alert.alert('Error', 'Please fill all fields');
    }
    if (formData.password !== formData.confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/send-otp`, {
        email: formData.email,
        phoneNumber: formData.phoneNumber
      });
      if (Platform.OS === 'web') window.alert(`OTP Sent ✅\n${res.data.message}`);
      else Alert.alert('OTP Sent ✅', res.data.message);
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      return Alert.alert('Error', 'Please enter the 6-digit OTP from your email');
    }
    setLoading(true);
    try {
      await axios.post(`${API}/register`, formData);
      if (Platform.OS === 'web') {
        window.alert('Registered successfully! Please sign in.');
      } else {
        Alert.alert('Success 🎉', 'Registered successfully! Please sign in.');
      }
      navigation.replace('SignIn');
    } catch (err) {
      if (Platform.OS === 'web') {
        window.alert(err.response?.data?.message || 'Registration failed');
      } else {
        Alert.alert('Error', err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{t('SignUp')}</Text>

          {step === 1 ? (
            <>
              <TextInput style={styles.input} placeholder="Username" value={formData.username} onChangeText={(text) => setFormData({...formData, username: text})} autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Email" value={formData.email} onChangeText={(text) => setFormData({...formData, email: text})} keyboardType="email-address" autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Phone Number" value={formData.phoneNumber} onChangeText={(text) => setFormData({...formData, phoneNumber: text})} keyboardType="phone-pad" />
              <TextInput style={styles.input} placeholder="Password" value={formData.password} onChangeText={(text) => setFormData({...formData, password: text})} secureTextEntry />
              <TextInput style={styles.input} placeholder="Confirm Password" value={formData.confirmPassword} onChangeText={(text) => setFormData({...formData, confirmPassword: text})} secureTextEntry />
              <TextInput style={styles.input} placeholder="Referral Code (Optional)" value={formData.referralCode} onChangeText={(text) => setFormData({...formData, referralCode: text})} autoCapitalize="characters" />
              <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP to Email</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.info}>📧 Check your email <Text style={{fontWeight:'bold'}}>{formData.email}</Text> for the 6-digit OTP</Text>
              <TextInput style={styles.input} placeholder="Enter 6-digit OTP" value={formData.otp} onChangeText={(text) => setFormData({...formData, otp: text})} keyboardType="numeric" maxLength={6} />
              <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('Done')}</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSendOTP} disabled={loading} style={{ marginTop: 15 }}>
                <Text style={{ textAlign: 'center', color: '#90EE90', fontWeight: 'bold', fontSize: 16 }}>Resend OTP</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep(1)}>
                <Text style={styles.resend}>← Go back</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.linkLeft}>{t('Old_User')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  info: { textAlign: 'center', color: '#555', marginBottom: 15, fontSize: 14, lineHeight: 22 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resend: { textAlign: 'center', marginTop: 15, color: '#4CAF50', fontWeight: 'bold' },
});

export default SignUpScreen;

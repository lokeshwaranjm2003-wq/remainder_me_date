import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const API = `${API_BASE_URL}/api/auth`;

const SignUpScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ username: '', email: '', phoneNumber: '', password: '', confirmPassword: '', captchaInput: '', referralCode: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [captchaText, setCaptchaText] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
  };

  React.useEffect(() => {
    generateCaptcha();
  }, []);

  const handleNextStep = () => {
    if (!formData.username || !formData.email || !formData.phoneNumber || !formData.password) {
      return Alert.alert('Error', 'Please fill all fields');
    }
    if (formData.password !== formData.confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }
    setStep(2);
  };

  const handleRegister = async () => {
    if (!formData.captchaInput || formData.captchaInput !== captchaText) {
      return Alert.alert('Error', 'Incorrect Captcha. Please try again.');
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
              <TouchableOpacity style={styles.button} onPress={handleNextStep}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.info}>To prevent bots, please type the characters shown below:</Text>
              <View style={styles.captchaContainer}>
                <Text style={styles.captchaText} selectable={false}>{captchaText}</Text>
                <TouchableOpacity onPress={generateCaptcha}>
                  <Text style={styles.refreshCaptcha}>🔄</Text>
                </TouchableOpacity>
              </View>
              <TextInput style={styles.input} placeholder="Enter Captcha" value={formData.captchaInput} onChangeText={(text) => setFormData({...formData, captchaInput: text})} autoCapitalize="none" autoCorrect={false} />
              <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('SignUp')}</Text>}
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
  captchaContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15, backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8 },
  captchaText: { fontSize: 28, fontWeight: 'bold', letterSpacing: 8, color: '#4CAF50', marginRight: 15, textDecorationLine: 'line-through', fontStyle: 'italic' },
  refreshCaptcha: { fontSize: 24 },
});

export default SignUpScreen;

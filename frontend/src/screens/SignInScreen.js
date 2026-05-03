import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const SignInScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');
  };

  const handleLoginStep1 = async () => {
    try {
      const res = await axios.post('http://10.0.2.2:5000/api/auth/login', { username, password });
      if (res.status === 206) {
        Alert.alert('OTP Sent', `Mock OTP: ${res.data.mockOtp}`);
        setStep(2);
      } else if (res.status === 200) {
        navigation.replace('Welcome', { username: res.data.user.username });
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Login failed');
    }
  };

  const handleLoginStep2 = async () => {
    try {
      const res = await axios.post('http://10.0.2.2:5000/api/auth/login', { username, password, otp });
      if (res.status === 200) {
        navigation.replace('Welcome', { username: res.data.user.username });
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('SignIn')}</Text>
      
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      
      {step === 2 && (
        <TextInput style={styles.input} placeholder="Enter OTP" value={otp} onChangeText={setOtp} keyboardType="numeric" />
      )}

      <TouchableOpacity 
        style={styles.button} 
        onPress={step === 1 ? handleLoginStep1 : handleLoginStep2}
      >
        <Text style={styles.buttonText}>{t('SignIn')}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.linkLeft}>{t('New_User')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleLanguage}>
          <Text style={styles.linkRight}>{t('How_To_SignUp')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: '#000080', padding: 15, borderRadius: 8, alignItems: 'center' }, // Navy Blue
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  linkLeft: { color: '#87CEFA', fontWeight: 'bold' }, // Light Sky Blue
  linkRight: { color: '#333', textDecorationLine: 'underline' }
});

export default SignInScreen;

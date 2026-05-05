import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const API = `${API_BASE_URL}/api/auth`;

const SignInScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');
  };

  const handleLogin = async () => {
    if (!username || !password) {
      return Alert.alert('Error', 'Please enter username and password');
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/login`, { username, password });
      
      // Save token and user info to AsyncStorage
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userId', res.data.user.id);
      await AsyncStorage.setItem('username', res.data.user.username);
      if (res.data.user.referralCode) {
        await AsyncStorage.setItem('referralCode', res.data.user.referralCode);
      }
      if (res.data.user.walletBalance !== undefined) {
        await AsyncStorage.setItem('walletBalance', res.data.user.walletBalance.toString());
      }

      navigation.replace('Welcome', { username: res.data.user.username });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{t('SignIn')}</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('SignIn')}</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.linkLeft}>{t('New_User')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleLanguage}>
              <Text style={styles.linkRight}>EN / தமிழ்</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  info: { textAlign: 'center', color: '#555', marginBottom: 15, fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: '#000080', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resend: { textAlign: 'center', marginTop: 15, color: '#000080', fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  linkLeft: { color: '#87CEFA', fontWeight: 'bold' },
  linkRight: { color: '#333', textDecorationLine: 'underline' },
});

export default SignInScreen;

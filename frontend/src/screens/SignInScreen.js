import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Modal } from 'react-native';
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

  // Forgot Password States
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [fpEmail, setFpEmail] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [fpLoading, setFpLoading] = useState(false);

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaAnswer('');
  };

  const openForgotPasswordModal = () => {
    setFpEmail('');
    setFpNewPassword('');
    setFpConfirmPassword('');
    generateCaptcha();
    setForgotPasswordModalVisible(true);
  };

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

  const handleForgotPassword = async () => {
    if (!fpEmail || !fpNewPassword || !fpConfirmPassword || !captchaAnswer) {
      return Alert.alert('Error', 'Please fill all fields');
    }
    if (fpNewPassword !== fpConfirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }
    if (parseInt(captchaAnswer) !== num1 + num2) {
      generateCaptcha();
      return Alert.alert('Error', 'Incorrect CAPTCHA');
    }

    setFpLoading(true);
    try {
      const res = await axios.post(`${API}/reset-password`, { 
        email: fpEmail, 
        newPassword: fpNewPassword 
      });
      
      Alert.alert('Success', res.data.message || 'Password reset successfully');
      setForgotPasswordModalVisible(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed';
      Alert.alert('Error', msg);
    } finally {
      setFpLoading(false);
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
          
          <TouchableOpacity onPress={openForgotPasswordModal} style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

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

      {/* Forgot Password Modal */}
      <Modal
        visible={forgotPasswordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setForgotPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalTitle}>Reset Password</Text>

              <TextInput
                style={styles.input}
                placeholder="Email ID"
                value={fpEmail}
                onChangeText={setFpEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={fpNewPassword}
                onChangeText={setFpNewPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={fpConfirmPassword}
                onChangeText={setFpConfirmPassword}
                secureTextEntry
              />

              <View style={styles.captchaContainer}>
                <Text style={styles.captchaText}>What is {num1} + {num2}?</Text>
                <TextInput
                  style={styles.captchaInput}
                  placeholder="Answer"
                  value={captchaAnswer}
                  onChangeText={setCaptchaAnswer}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setForgotPasswordModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]} 
                  onPress={handleForgotPassword}
                  disabled={fpLoading}
                >
                  {fpLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>Done</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

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
  forgotPasswordContainer: { alignItems: 'flex-end', marginBottom: 15 },
  forgotPasswordText: { color: '#90EE90', fontWeight: 'bold', fontSize: 14 }, // Light green color
  resend: { textAlign: 'center', marginTop: 15, color: '#000080', fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  linkLeft: { color: '#87CEFA', fontWeight: 'bold' },
  linkRight: { color: '#333', textDecorationLine: 'underline' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 12, maxHeight: '90%' },
  modalScroll: { padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  captchaContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  captchaText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  captchaInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, width: 80, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#FF6347' },
  submitButton: { backgroundColor: '#32CD32' },
  modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default SignInScreen;

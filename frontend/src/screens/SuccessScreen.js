import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const SuccessScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const fetchReferral = async () => {
      const code = await AsyncStorage.getItem('referralCode');
      if (code) setReferralCode(code);
    };
    fetchReferral();
  }, []);

  const shareViaWhatsApp = () => {
    // Generate a unique referral link
    // Replace API_BASE_URL with your actual domain when deploying
    const baseUrl = API_BASE_URL.replace('/api/reminders', '').replace('/api/auth', '');
    const referralLink = `${baseUrl}/share/${referralCode}`;
    const message = `Hey! Add your DOB/Wedding date so I never forget! Click here: ${referralLink}`;
    
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`).catch(() => {
      Alert.alert('Error', 'Make sure WhatsApp is installed on your device');
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.celebration}>🎉</Text>
      <Text style={styles.successText}>{t('Success_Added')}</Text>
      <Text style={styles.thankYou}>{t('Thank_You')}</Text>
      <Text style={styles.message}>{t('Success_Message')}</Text>

      <TouchableOpacity style={styles.whatsappButton} onPress={shareViaWhatsApp}>
        <Text style={styles.buttonText}>Share via WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0f7fa' },
  celebration: { fontSize: 80, marginBottom: 20 },
  successText: { fontSize: 24, fontWeight: 'bold', color: '#00796b', marginBottom: 10 },
  thankYou: { fontSize: 32, fontStyle: 'italic', color: '#ff4081', marginVertical: 15 },
  message: { fontSize: 16, textAlign: 'center', color: '#333', marginBottom: 40, paddingHorizontal: 20 },
  whatsappButton: { backgroundColor: '#25D366', padding: 15, borderRadius: 8, width: '80%', alignItems: 'center', marginBottom: 15 },
  homeButton: { backgroundColor: '#000080', padding: 15, borderRadius: 8, width: '80%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default SuccessScreen;

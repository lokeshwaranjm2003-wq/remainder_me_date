import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, Clipboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SHARE_BASE_URL } from '../config';

const SuccessScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [referralCode, setReferralCode] = useState('');
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    const fetchReferral = async () => {
      const code = await AsyncStorage.getItem('referralCode');
      if (code) {
        setReferralCode(code);
        setShareLink(`${SHARE_BASE_URL}/share/${code}`);
      }
    };
    fetchReferral();
  }, []);

  const shareViaWhatsApp = () => {
    const message = `Hey! உங்கள் பிறந்தநாள் அல்லது திருமண நாளை என்னிடம் சேர்க்கவும், நான் மறக்கவே மாட்டேன்! 🎉\n\nClick here: ${shareLink}`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`).catch(() => {
      Alert.alert('Error', 'Make sure WhatsApp is installed on your device');
    });
  };

  const copyLink = () => {
    Clipboard.setString(shareLink);
    Alert.alert('✅ Copied!', `Link copied:\n${shareLink}`);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.celebration}>🎉</Text>
      <Text style={styles.successText}>{t('Success_Added')}</Text>
      <Text style={styles.thankYou}>{t('Thank_You')}</Text>
      <Text style={styles.message}>{t('Success_Message')}</Text>

      {shareLink ? (
        <View style={styles.linkBox}>
          <Text style={styles.linkLabel}>📎 Your Share Link:</Text>
          <Text style={styles.linkText} numberOfLines={2}>{shareLink}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.whatsappButton} onPress={shareViaWhatsApp}>
        <Text style={styles.buttonText}>📲 Share via WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.copyButton} onPress={copyLink}>
        <Text style={styles.buttonText}>📋 Copy Link</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.buttonText}>🏠 Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0f7fa' },
  celebration: { fontSize: 80, marginBottom: 20 },
  successText: { fontSize: 24, fontWeight: 'bold', color: '#00796b', marginBottom: 10 },
  thankYou: { fontSize: 32, fontStyle: 'italic', color: '#ff4081', marginVertical: 15 },
  message: { fontSize: 16, textAlign: 'center', color: '#333', marginBottom: 20, paddingHorizontal: 20 },
  linkBox: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 15, width: '90%', borderWidth: 1, borderColor: '#b2dfdb' },
  linkLabel: { fontSize: 13, fontWeight: 'bold', color: '#00796b', marginBottom: 4 },
  linkText: { fontSize: 12, color: '#555', flexWrap: 'wrap' },
  whatsappButton: { backgroundColor: '#25D366', padding: 15, borderRadius: 8, width: '80%', alignItems: 'center', marginBottom: 10 },
  copyButton: { backgroundColor: '#607d8b', padding: 15, borderRadius: 8, width: '80%', alignItems: 'center', marginBottom: 10 },
  homeButton: { backgroundColor: '#000080', padding: 15, borderRadius: 8, width: '80%', alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default SuccessScreen;

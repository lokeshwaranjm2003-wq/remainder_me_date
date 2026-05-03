import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const WelcomeScreen = ({ route, navigation }) => {
  const { t, i18n } = useTranslation();
  const { username } = route.params || { username: 'User' };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleLanguage} style={styles.langToggle}>
        <Text style={styles.langText}>🌐 EN / TA</Text>
      </TouchableOpacity>

      <Text style={styles.username}>{username}</Text>
      <Text style={styles.message}>{t('Welcome_Message')}</Text>
      
      <Text style={styles.thankYou}>{t('Thank_You')}</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Dashboard')}>
        <Text style={styles.buttonText}>{t('Done')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  langToggle: { position: 'absolute', top: 50, right: 20 },
  langText: { fontSize: 16, fontWeight: 'bold' },
  username: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  message: { fontSize: 18, textAlign: 'center', marginBottom: 30, lineHeight: 26 },
  thankYou: { fontSize: 24, fontStyle: 'italic', marginBottom: 40, color: '#FF4081' }, // Stylish pink
  button: { backgroundColor: '#4CAF50', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default WelcomeScreen;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Welcome": "Welcome",
      "Welcome_Message": "Never forget birthdays or special dates of your loved ones. This app will help you.",
      "Thank_You": "Thank You",
      "Done": "Done",
      "SignIn": "Sign In",
      "SignUp": "Sign Up",
      "How_To_SignUp": "How to Sign Up?",
      "New_User": "New User? Sign Up",
      "Success_Added": "Successfully Added 😊",
      "Success_Message": "You will never forget important dates again",
      "Remember_Me": "Remember Me"
    }
  },
  ta: {
    translation: {
      "Welcome": "வரவேற்கிறோம்",
      "Welcome_Message": "உங்களுக்கு பிடித்தவர்களின் பிறந்தநாள் அல்லது திருமண நாளை மறந்துவிடாதீர்கள். இந்த செயலி உங்களுக்கு உதவும்.",
      "Thank_You": "நன்றி",
      "Done": "முடிந்தது",
      "SignIn": "உள்நுழைய",
      "SignUp": "பதிவு செய்ய",
      "How_To_SignUp": "எப்படி பதிவு செய்வது?",
      "New_User": "புதிய பயனரா? பதிவு செய்க",
      "Success_Added": "வெற்றிகரமாக சேர்க்கப்பட்டது 😊",
      "Success_Message": "இனிமேல் நீங்கள் யாருடைய முக்கிய தினங்களையும் மறக்கமாட்டீர்கள்",
      "Remember_Me": "என்னை நினைவூட்டு"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

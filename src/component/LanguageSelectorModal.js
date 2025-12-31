import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import i18n, { changeLanguage } from '../i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageSelectorModal = ({ visible, onClose, currentLang }) => {
  const setLanguage = async (lang) => {
    await AsyncStorage.setItem('userLanguage', lang);
    await changeLanguage(lang);
    onClose();
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <Text style={styles.title}>{i18n.t('selectLanguage')}</Text>

              {['en', 'hi', 'gu'].map((lng) => (
                <TouchableOpacity
                  key={lng}
                  style={[styles.option, currentLang === lng && styles.activeOption]}
                  onPress={() => setLanguage(lng)}
                >
                  <Text style={styles.optionTxt}>
                    {i18n.t(lng === 'en' ? 'english' : lng === 'hi' ? 'hindi' : 'gujarati')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default LanguageSelectorModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeOption: {
    backgroundColor: '#f8f8f8',
  },
  optionTxt: {
    fontSize: 16,
    textAlign: 'center',
  },
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n/i18n';
import { getThemeSettings } from '../component/global';
import LanguageSelectorModal from '../component/LanguageSelectorModal';

const AboutScreen = ({ navigation }) => {
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);
    const [aboutContent, setAboutContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAboutContent();
    }, []);

    const fetchAboutContent = async () => {
        try {
            const response = await getThemeSettings();
            if (response?.data?.about_us) {
                setAboutContent(response.data.about_us);
            } else {
                setAboutContent('No data found');
            }
        } catch (error) {
            console.error('Error fetching about content:', error);
            setAboutContent('No data found');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#9E1B17" />
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{i18n.t('about')}</Text>
                    <TouchableOpacity style={styles.headerRight} onPress={() => setShowLanguageModal(true)}>
                        <Icon name="language" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <Text>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9E1B17" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{i18n.t('about')}</Text>
                <TouchableOpacity style={styles.headerRight} onPress={() => setShowLanguageModal(true)}>
                    <Icon name="language" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.text}>{aboutContent}</Text>
            </ScrollView>
            <LanguageSelectorModal
                visible={showLanguageModal}
                onClose={() => setShowLanguageModal(false)}
                currentLang={currentLanguage}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#9E1B17',
        paddingVertical: 15,
        paddingHorizontal: 10,
        elevation: 3,
    },
    backButton: { padding: 5 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    headerRight: { width: 40 },
    content: { flex: 1 },
    contentContainer: { padding: 16 },
    text: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 12 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AboutScreen;

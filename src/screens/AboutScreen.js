import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
        setCurrentLanguage(i18n.locale);
    }, [i18n.locale]);

    useEffect(() => {
        fetchAboutContent();
    }, [i18n.locale]);

    const pickAbout = (res) => {
        const lang = i18n.locale;
        if (lang === 'gu') return res.data.gu_about_us;
        if (lang === 'hi') return res.data.hi_about_us;
        return res.data.about_us;          // en
    };

    const fetchAboutContent = async () => {
        try {
            setLoading(true);
            const res = await getThemeSettings();
            setAboutContent(pickAbout(res) || 'No data found');
        } catch (e) {
            console.error(e);
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
                    <Ionicons name="language" size={24} color="#fff" />
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
        backgroundColor: '#000000ff',
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

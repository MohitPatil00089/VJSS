import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import i18n, { getCurrentLanguage } from '../i18n/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import database, { getKalyanakEvents } from '../database/database'; // We'll create this function
import { convertNumber, formatJainDate } from '../utils/numberConverter';
import { getFrontPanchKalyanaks } from '../component/global';
import { useRoute } from '@react-navigation/native';
import LanguageSelectorModal from '../component/LanguageSelectorModal';

export const useLanguage = () => {
    // const [language, setLanguage] = useState(getCurrentLanguage());

    useEffect(() => {
        const interval = setInterval(() => {
            const currentLang = i18n.locale
            if (currentLang !== language) {
                setLanguage(currentLang);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [language]);

    return language;
};

const KalyanakScreen = () => {
    const [showLanguageModal, setShowLanguageModal] = useState(false);
        const [language, setLanguage] = useState(i18n.locale);

    const navigation = useNavigation();
    const route = useRoute();
    // const language = useLanguage();
    const t = (key) => i18n.t(key, { lng: language });
    const [kalyanakData, setKalyanakData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(route.params?.selectedDate || new Date().toISOString().split('T')[0]);

    useEffect(() => {
    setLanguage(i18n.locale);
        const fetchKalyanakEvents = async () => {
            try {
                setLoading(true);
                const events = await getFrontPanchKalyanaks(selectedDate);
                console.log("Kalyanak events:", events)
                setKalyanakData(events.data);

            } catch (err) {
                console.error("Error fetching kalyanak events:", err);
                setError("Failed to load kalyanak events");
            } finally {
                setLoading(false);
            }
        };

        fetchKalyanakEvents();
    }, [i18n.locale]);
    const getMonthFromJainDate = (jainDate) => {
        if (!jainDate || typeof jainDate !== 'string') return 'Other';
        const parts = jainDate.trim().split(/\s+/);
        return parts[0] || 'Other';
    };

    const groupedData = React.useMemo(() => {
        const map = new Map();
        (kalyanakData || []).forEach(evt => {

            const month = getMonthFromJainDate(language === 'gu' ? evt.guj_month_gujarati_name : language === 'hi' ? evt.hi_month_hindi_name : evt.guj_month_english_name);
            if (!map.has(month)) map.set(month, []);
            map.get(month).push(evt);
        });

        const result = [];
        Array.from(map.entries()).forEach(([month, items]) => {
            result.push({ type: 'header', id: `hdr-${month}`, title: month });
            items.forEach(it => result.push({ ...it, type: 'event' }));
        });
        return result;
    }, [kalyanakData]);


    const renderMonthSection = ({ item }) => {
        if (item?.type === 'header') {
            return (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {item.title}
                    </Text>
                </View>
            );
        }
        const event = item;
        // console.log('Event data:', event); // Debug log to check the event object
        // console.log('Tirthankar name:', event?.tirthankar_name); // Debug log to check the tirthankar_name
        return (
            <TouchableOpacity style={styles.eventCard}
                onPress={() => {
                    navigation.navigate('Home', {
                        selectedDate: event?.date_calendar,
                        scrollToKalyanak: event.id // Optional: to highlight the event in Home
                    });
                }}
            >
                <View style={styles.iconCircle}>
                    <Icon name="event" size={20} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>

                    <Text style={styles.eventTitle}>
                        {language == "gu" ? event?.tirthankar_name_gujarati : language == "hi" ? event?.hi_tirthankar_name : event?.tirthankar_name}
                    </Text>
                    <Text style={styles.eventSubtitle}>
                        {language == "gu" ? event?.event_name_gujarati : language == "hi" ? event?.event_name_hindi : event?.event_name}
                        {event?.tithi ? ` • ${convertNumber(event.tithi, i18n.locale)}` : ''}
                    </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#9E9E9E" />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#9E1B17" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#9E1B17" />
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('menu.kalyanak')}</Text>
                    <TouchableOpacity style={styles.headerRight} onPress={() => setShowLanguageModal(true)}>
                        <Icon name="language" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={groupedData}
                    renderItem={renderMonthSection}
                    keyExtractor={(item) => String(item.id || `${item.type}-${item.title}`)}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Text style={styles.emptyText}>No kalyanak events found</Text>
                        </View>
                    }
                />
            </View>
            <LanguageSelectorModal
                visible={showLanguageModal}
                onClose={() => setShowLanguageModal(false)}
                currentLang={language}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#9E1B17',
        paddingVertical: 15,
        paddingHorizontal: 10,
        elevation: 3,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    sectionHeader: {
        paddingHorizontal: 4,
        paddingVertical: 8,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#9E1B17',
        marginBottom: 8,
    },
    languageButton: {
        padding: 5,
        width: 40, // To maintain header balance
    },
    listContainer: {
        padding: 16,
        paddingBottom: 24,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#9E1B17',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    eventTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    eventSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        padding: 20,
    },
});

export default KalyanakScreen;
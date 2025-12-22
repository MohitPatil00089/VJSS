import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import i18n, { getCurrentLanguage } from '../i18n/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import database, { getKalyanakEvents } from '../database/database'; // We'll create this function
import { formatJainDate } from '../utils/numberConverter';
import { useRoute } from '@react-navigation/native';
export const useLanguage = () => {
    const [language, setLanguage] = useState(getCurrentLanguage());

    useEffect(() => {
        const interval = setInterval(() => {
            const currentLang = getCurrentLanguage();
            if (currentLang !== language) {
                setLanguage(currentLang);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [language]);

    return language;
};

const KalyanakScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const language = useLanguage();
    const t = (key) => i18n.t(key, { lng: language });
    const [kalyanakData, setKalyanakData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchKalyanakEvents = async () => {
            try {
                setLoading(true);
                const events = await getKalyanakEvents();
                console.log(events)
                setKalyanakData(events);

            } catch (err) {
                console.error("Error fetching kalyanak events:", err);
                setError("Failed to load kalyanak events");
            } finally {
                setLoading(false);
            }
        };

        fetchKalyanakEvents();
    }, []);
    const getMonthFromJainDate = (jainDate) => {
        if (!jainDate || typeof jainDate !== 'string') return 'Other';
        const parts = jainDate.trim().split(/\s+/);
        return parts[0] || 'Other';
    };

    const groupedData = React.useMemo(() => {
        const map = new Map();
        (kalyanakData || []).forEach(evt => {
            const month = getMonthFromJainDate(evt?.jain_date);
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
    const [selectedDate, setSelectedDate] = useState(route.params?.selectedDate || new Date());

    const handleEventPress = async (event) => {
        try {
            // Get the gregorian date for the selected kalyanak
            const calendarData = await getCalendarDataForJainDate(event.jain_date);

            if (calendarData && calendarData.length > 0) {
                const gregorianDate = calendarData[0].gregorian_date;
                navigation.navigate('Home', {
                    selectedDate: new Date(gregorianDate),
                    scrollToKalyanak: event.id // Optional: to highlight the event in Home
                });
            } else {
                // Fallback to current date if no matching date found
                navigation.navigate('Home', {
                    selectedDate: new Date(),
                    scrollToKalyanak: event.id
                });
            }
        } catch (error) {
            console.error('Error navigating to date:', error);
            // Navigate to home with current date as fallback
            navigation.navigate('Home', {
                selectedDate: new Date(),
                scrollToKalyanak: event.id
            });
        }
    };

    // Add this function to get calendar data for a specific jain date
    const getCalendarDataForJainDate = async (jainDate) => {
        return new Promise((resolve, reject) => {
            database.transaction(tx => {
                tx.executeSql(
                    `SELECT * FROM tblCalendar WHERE jain_date_full = ?`,
                    [jainDate],
                    (_, result) => {
                        const rows = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            rows.push(result.rows.item(i));
                        }
                        resolve(rows);
                    },
                    (_, error) => reject(error)
                );
            });
        });
    };
    const renderMonthSection = ({ item }) => {
        if (item?.type === 'header') {
            return (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {i18n.t(`date.month.${item.title.toLowerCase()}`) || item.title}
                    </Text>
                </View>
            );
        }
        const event = item;
        // console.log('Event data:', event); // Debug log to check the event object
        console.log('Tirthankar name:', event?.tirthankar_name); // Debug log to check the tirthankar_name
        return (
            <TouchableOpacity style={styles.eventCard}
                onPress={() => {
                    handleEventPress(event)
                }}
            >
                <View style={styles.iconCircle}>
                    <Icon name="event" size={20} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>

                    <Text style={styles.eventTitle}>
                        {i18n.t(`tirthankarNames.${event?.tirthankar_name?.trim()}`) ||
                            i18n.t('tirthankarNames.' + event?.tirthankar_name?.trim()?.replace(/\s+/g, '')) ||
                            event?.tirthankar_name}
                    </Text>
                    <Text style={styles.eventSubtitle}>
                        {i18n.t(
                            `kalyanak.${(event?.event_name || '')
                                .trim()
                                .toLowerCase()
                                .replace(/\s+/g, '')}`
                        )}
                        {event?.jain_date ? ` • ${formatJainDate(event.jain_date, i18n.locale)}` : ''}
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
                    <View style={styles.languageButton} />
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
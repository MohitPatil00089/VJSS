import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { getEventsForDate } from '../database/database';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n/i18n';
import { convertDateMonthsOnly, convertDigitsOnly, convertJainDateNumber, formatJainDate, formatMonthYear } from '../utils/numberConverter';
import { getAllTithiFestivals } from '../component/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LanguageSelectorModal from '../component/LanguageSelectorModal';

const TithisInMonth = ({ navigation }) => {
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [calendarData, setCalendarData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [importing, setImporting] = useState(false);
    const [language, setLanguage] = useState(i18n.locale);
    const [activeTab, setActiveTab] = useState('Tithi');

    useEffect(() => {
        let lang = i18n.locale;
        setLanguage(lang);
        loadMonthData(currentMonth);
    }, []);

    const loadMonthData = async (date) => {
        try {
            setLoading(true);
            const selectedCityStr = await AsyncStorage.getItem('selectedCity');
            const selectedCity = selectedCityStr ? JSON.parse(selectedCityStr) : {
                lat: '22.2726554',
                long: '73.1969701',
                country_code: 'IN'
            };
            const year = date.getFullYear().toString();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const response = await getFrontCalendar(
                'multiple',
                year,
                month,
                month,
                'gregorian',
                selectedCity.lat.toString(),
                selectedCity.long.toString(),
                selectedCity.country_code || 'IN',
                '2082'
            );
            if (response && response.data) {
                setCalendarData(response.data);
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const todayInMonth = response.data.some(d => d.dateString === todayStr);
                if (todayInMonth) {
                    setSelectedDate(todayStr);
                }
            }
        } catch (error) {
            console.error('Error loading month data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            loadMonthData(currentMonth);
        }
    }, [currentMonth]);

    const handlePrevMonth = () => {
        const prev = new Date(currentMonth);
        prev.setMonth(currentMonth.getMonth() - 1);
        setCurrentMonth(prev);
        loadMonthData(prev);
    };

    const handleNextMonth = () => {
        const next = new Date(currentMonth);
        next.setMonth(currentMonth.getMonth() + 1);
        setCurrentMonth(next);
        loadMonthData(next);
    };

    const loadEvents = async (date) => {
        try {
            const events = await getEventsForDate(date);
            setEvents(events || []);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    };

    const handleDateSelect = async (date) => {
        setSelectedDate(date);
        const [year, month, day] = date.split('-');
        const dateObj = new Date(Date.UTC(year, month - 1, day));
        const yyyyMmDd = dateObj.toISOString().slice(0, 10);
        navigation.navigate('Home', {
            selectedDate: yyyyMmDd
        });
    };

    const calendarGridData = useMemo(() => {
        if (!calendarData || calendarData.length === 0) return [];
        const first = new Date(calendarData[0].dateString);
        const leading = first.getDay();
        const leadingBlanks = Array.from({ length: leading }, (_, i) => ({ id: `p-${i}`, placeholder: true }));
        const total = leading + calendarData.length;
        const trailing = (7 - (total % 7)) % 7;
        const trailingBlanks = Array.from({ length: trailing }, (_, i) => ({ id: `t-${i}`, placeholder: true }));
        return [...leadingBlanks, ...calendarData, ...trailingBlanks];
    }, [calendarData]);

    const isToday = (dateString) => {
        const today = new Date().toISOString().split('T')[0];
        return dateString === today;
    };

    const renderCalendarItem = ({ item }) => {
        if (item.placeholder) {
            return <View style={styles.calendarCell} />;
        }
        const isSelected = selectedDate === item.dateString;
        const isTodayDate = isToday(item.dateString);
        const isTithiHighlighted = item.tithi === '8' || item.tithi === '14' || (item.tithi === '5' && item.paksha_type?.toLowerCase() === 'sud');
        return (
            <TouchableOpacity
                style={[
                    styles.calendarCell,
                    isSelected && styles.selectedCell,
                    isTodayDate && styles.todayCell,
                    isTithiHighlighted && styles.tithiHighlightedCell
                ]}
                onPress={() => handleDateSelect(item.dateString)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.gregorianDate,
                    isSelected && styles.selectedDateText,
                    isTodayDate && !isSelected && styles.todayText,
                    isTithiHighlighted && styles.tithiHighlightedText
                ]}>
                    {convertJainDateNumber(item.tithi, i18n.locale)}
                </Text>
                <Text style={[
                    styles.jainDateSmall,
                    isSelected && styles.selectedJainText,
                    isTithiHighlighted && styles.tithiHighlightedText
                ]}>
                    {i18n.locale == "en" ? item.guj_month_english_name : i18n.locale == "gu" ? item.guj_month_gujarati_name : item.guj_month_hindi_name}
                    {` (`}
                    {i18n.t(`date.${(item.paksha_type)?.toLowerCase()}`)}
                    {`)`}
                </Text>
                <Text style={[
                    styles.jainDateSmall,
                    isSelected && styles.selectedJainText,
                    isTithiHighlighted && styles.tithiHighlightedText
                ]}>
                    {convertJainDateNumber(item.day, i18n.locale)}/{convertJainDateNumber(item.month, i18n.locale)}
                </Text>
            </TouchableOpacity>
        );
    };

    if (loading || importing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.mainHeader}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{i18n.t('tabs.tithi')}</Text>
                <TouchableOpacity style={styles.headerRight} onPress={() => setShowLanguageModal(true)}>
                    <Ionicons name="language" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Bottom Tab Bar */}
            <View style={styles.bottomTabBar}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'Tithi' && styles.activeTab]}
                    onPress={() => setActiveTab('Tithi')}
                >
                    <Text style={[styles.tabText, activeTab === 'Tithi' && styles.activeTabText]}>
                        Tithi in Month
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'Shubh Days' && styles.activeTab]}
                    onPress={() => setActiveTab('Shubh Days')}
                >
                    <Text style={[styles.tabText, activeTab === 'Shubh Days' && styles.activeTabText]}>
                        Shubh Days
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'Events' && styles.activeTab]}
                    onPress={() => setActiveTab('Events')}
                >
                    <Text style={[styles.tabText, activeTab === 'Events' && styles.activeTabText]}>
                        Events
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <ScrollView style={styles.tabContent}>
                {activeTab === 'Tithi' && (
                    <View style={styles.tabInner}>
                        <Text style={styles.tabTitle}>
                            {i18n.locale === 'en'
                                ? `${currentMonth.toLocaleString('en', { month: 'long' })} ${currentMonth.getFullYear()}`
                                : formatMonthYear(currentMonth).month + ' ' + formatMonthYear(currentMonth).year}
                        </Text>

                        {calendarData.map((d) => (
                            <View key={d.dateString} style={styles.shubhDayCard}>
                                <Text style={styles.shubhDayText}>
                                    {i18n.locale === 'en'
                                        ? `${d.en_guj_month} ${d.en_paksha} ${d.en_tithi}`
                                        : i18n.locale === 'gu'
                                        ? `${d.gu_guj_month} ${d.gu_paksha} ${d.gu_tithi}`
                                        : `${d.hi_guj_month} ${d.hi_paksha} ${d.hi_tithi}`}{' '}
                                    {String(d.day).padStart(2, '0')}/{String(currentMonth.getMonth() + 1).padStart(2, '0')}/{currentMonth.getFullYear()}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'Shubh Days' && (
                    <View style={styles.tabInner}>
                        <Text style={styles.tabTitle}>Shubh Days – {formatMonthYear(currentMonth).month} {currentMonth.getFullYear()}</Text>

                        {calendarData
                            .filter((d) => d.shubh_din === true)
                            .map((d) => (
                                <View key={d.dateString} style={styles.shubhDayCard}>
                                    <Text style={styles.shubhDayText}>
                                        {i18n.locale === 'en'
                                            ? `${d.en_guj_month} ${d.en_paksha} ${d.en_tithi}`
                                            : i18n.locale === 'gu'
                                            ? `${d.gu_guj_month} ${d.gu_paksha} ${d.gu_tithi}`
                                            : `${d.hi_guj_month} ${d.hi_paksha} ${d.hi_tithi}`}{' '}
                                        {String(d.day).padStart(2, '0')}/{String(currentMonth.getMonth() + 1).padStart(2, '0')}/{currentMonth.getFullYear()}
                                    </Text>
                                </View>
                            ))}

                        {calendarData.filter((d) => d.shubh_din === true).length === 0 && (
                            <Text style={styles.noEventsText}>No Shubh days in this month.</Text>
                        )}
                    </View>
                )}

                {activeTab === 'Events' && (
                    <View style={styles.tabInner}>
                        <Text style={styles.tabTitle}>Events</Text>
                        {events.length > 0 ? (
                            events.map((ev, i) => (
                                <View key={i} style={styles.eventCard}>
                                    <Text style={styles.eventTitle}>{ev.title}</Text>
                                    <Text style={styles.eventDesc}>{ev.description}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noEventsText}>No events for this month.</Text>
                        )}
                    </View>
                )}
            </ScrollView>

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
        backgroundColor: '#F8F9FA',
    },
    mainHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#9E1B17',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerRight: {
        width: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8B4513',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    navButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    navButtonText: {
        fontSize: 28,
        fontWeight: '300',
        color: '#333',
    },
    monthYearContainer: {
        alignItems: 'center',
    },
    monthText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    yearText: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    weekDaysContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    weekDayCell: {
        flex: 1,
        alignItems: 'center',
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
    },
    calendarGrid: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 4,
    },
    calendarCell: {
        width: '14.28%',
        aspectRatio: 0.85,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2,
        overflow: 'hidden',
    },
    selectedCell: {
        backgroundColor: '#FF6B35',
        borderRadius: 12,
    },
    todayCell: {
        borderWidth: 2,
        borderColor: '#FF6B35',
        borderRadius: 12,
    },
    tithiHighlightedCell: {
        backgroundColor: '#48bf4cff',
        borderRadius: 12,
    },
    gregorianDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 1,
    },
    selectedDateText: {
        color: '#FFFFFF',
    },
    tithiHighlightedText: {
        color: '#FFFFFF',
    },
    todayText: {
        color: '#FF6B35',
    },
    jainDateSmall: {
        fontSize: 8,
        color: '#666',
        textAlign: 'center',
    },
    selectedJainText: {
        color: '#FFFFFF',
    },
    eventDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FF6B35',
        marginTop: 2,
    },
    eventDotSelected: {
        backgroundColor: '#FFFFFF',
    },
    eventsSection: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    eventsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    eventsSectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    selectedDateLabel: {
        fontSize: 14,
        color: '#666',
    },
    eventsScrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    eventCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    eventIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF5F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    eventIcon: {
        fontSize: 20,
    },
    eventContent: {
        flex: 1,
        justifyContent: 'center',
    },
    eventTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    eventDescription: {
        fontSize: 13,
        color: '#666',
    },
    noEventsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    noEventsEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    noEventsText: {
        fontSize: 15,
        color: '#999',
        textAlign: 'center',
    },
    bottomTabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderColor: '#E5E5E5',
        paddingVertical: 8,
        paddingHorizontal: 20,
        justifyContent: 'space-around',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
        marginHorizontal: 5,
    },
    activeTab: {
        backgroundColor: '#9E1B17',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    tabContent: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 150,
    },
    tabInner: {
        paddingBottom: 30,
    },
    tabTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#1A1A1A',
    },
    shubhDayCard: {
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        elevation: 1,
    },
    shubhDayText: {
        fontSize: 14,
        color: '#333',
    },
    eventCard: {
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        elevation: 1,
    },
    eventDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
});

export default TithisInMonth;
// src/screens/JainCalendarScreen.js
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
import { getCalendarData, getEventsForDate } from '../database/database';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n/i18n';
import { convertDateMonthsOnly, convertDigitsOnly, convertJainDateNumber, formatJainDate, formatMonthYear } from '../utils/numberConverter';
import { getFrontCalendar } from '../component/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LanguageSelectorModal from '../component/LanguageSelectorModal';

const JainCalendarScreen = ({ navigation }) => {
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    // const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);
    const [loading, setLoading] = useState(true);
    const [calendarData, setCalendarData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [importing, setImporting] = useState(false);
    const [language, setLanguage] = useState(i18n.locale);

    useEffect(() => {
        let lang = i18n.locale;
        setLanguage(lang);
        loadMonthData(currentMonth);
    }, []);



    const loadMonthData = async (date) => {
        try {
            setLoading(true);

            // Get selected city data from AsyncStorage
            const selectedCityStr = await AsyncStorage.getItem('selectedCity');
            const selectedCity = selectedCityStr ? JSON.parse(selectedCityStr) : {
                lat: '22.2726554',
                long: '73.1969701',
                country_code: 'IN'
            };

            // Get current year and month
            const year = date.getFullYear().toString();
            const month = String(date.getMonth() + 1).padStart(2, '0');

            // Fetch calendar data from API
            const response = await getFrontCalendar(
                'multiple',
                year,
                month,
                month, // month_in_gujarati - using same as month for now
                'gregorian',
                selectedCity.lat.toString(),
                selectedCity.long.toString(),
                selectedCity.country_code || 'IN',
                '2082' // vikram_samvat - hardcoded for now
            );

            if (response && response.data) {
                setCalendarData(response.data);

                // Set today's date as selected if available in the response
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const todayInMonth = response.data.some(d => d.dateString === todayStr);

                if (todayInMonth) {
                    setSelectedDate(todayStr);
                    // await loadEvents(todayStr);
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
            // For now, we'll keep the local database events
            // You can modify this to use events from the API response if needed
            const events = await getEventsForDate(date);
            setEvents(events || []);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    };

    const handleDateSelect = async (date) => {
        setSelectedDate(date);
        // Format the date as YYYY-MM-DD and create a full ISO string
        const [year, month, day] = date.split('-');

        const dateObj = new Date(Date.UTC(year, month - 1, day));
        const yyyyMmDd = dateObj.toISOString().slice(0, 10);

        console.log("yyyyMmDd", yyyyMmDd); // correct date

        navigation.navigate('Home', {
            selectedDate: yyyyMmDd // Pass as ISO string
        });
        // await loadEvents(date);
    };

    const calendarGridData = useMemo(() => {
        if (!calendarData || calendarData.length === 0) return [];
        const first = new Date(calendarData[0].dateString);
        const leading = first.getDay();
        const leadingBlanks = Array.from({ length: leading }, (_, i) => ({ id: `p-${i}`, placeholder: true }));

        const total = leading + calendarData.length;
        const trailing = (7 - (total % 7)) % 7; // fill to complete week rows
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

        return (
            <TouchableOpacity
                style={[
                    styles.calendarCell,
                    isSelected && styles.selectedCell,
                    isTodayDate && styles.todayCell
                ]}
                onPress={() => handleDateSelect(item.dateString)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.gregorianDate,
                    isSelected && styles.selectedDateText,
                    isTodayDate && !isSelected && styles.todayText
                ]}>
                    {convertJainDateNumber(item.tithi, i18n.locale)}
                </Text>
                <Text style={[
                    styles.jainDateSmall,
                    isSelected && styles.selectedJainText
                ]}>
                    {language == "en" ? item.guj_month_english_name : language == "gu" ? item.guj_month_gujarati_name : item.guj_month_hindi_name}
                    {` (`}
                    {i18n.t(`date.${(item.paksha_type)?.toLowerCase()}`)}
                    {`)`}
                </Text>
                <Text style={[
                    styles.jainDateSmall,
                    isSelected && styles.selectedJainText
                ]}>
                    {/* {language == "gu" || language == "hi" ? convertDateMonthsOnly(new Date(item.gregorian_date), i18n.locale) : convertJainDateNumber(item.jain_date, i18n.locale)} */}
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
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{i18n.t('tabs.jain_calendar')}</Text>
                <TouchableOpacity style={styles.headerRight} onPress={() => setShowLanguageModal(true)}>
                    <Icon name="language" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.header}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                    <Icon name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.monthYearContainer}>
                    <Text style={styles.monthText}>
                        {formatMonthYear(currentMonth).month}
                    </Text>
                    <Text style={styles.yearText}>
                        {formatMonthYear(currentMonth).year}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                    <Icon name="chevron-right" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Week Days Header */}
            {/* Week Days Header */}
            <View style={styles.weekDaysContainer}>
                {i18n.t('date.fullWeekDays', { returnObjects: true }).map((day, index) => (
                    <View key={index} style={styles.weekDayCell}>
                        <Text style={styles.weekDayText}>
                            {day.length > 3 ? day.substring(0, 3) : day}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Calendar Grid */}
            <FlatList
                data={calendarGridData}
                renderItem={renderCalendarItem}
                keyExtractor={(item) => (item.placeholder ? item.id : item.id.toString())}
                numColumns={7}
                scrollEnabled={false}
                contentContainerStyle={styles.calendarGrid}
            />

            {/* Events Section */}
            {/* <View style={styles.eventsSection}>
                <View style={styles.eventsSectionHeader}>
                    <Text style={styles.eventsSectionTitle}>Events</Text>
                    {selectedDate && (
                        <Text style={styles.selectedDateLabel}>
                            {new Date(selectedDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </Text>
                    )}
                </View>

                <ScrollView style={styles.eventsScrollView}>
                    {events.length > 0 ? (
                        events.map((item, index) => (
                            <View key={index}>
                                {renderEventItem({ item })}
                            </View>
                        ))
                    ) : (
                        <View style={styles.noEventsContainer}>
                            <Text style={styles.noEventsEmoji}>📭</Text>
                            <Text style={styles.noEventsText}>No events for this date</Text>
                        </View>
                    )}
                </ScrollView>
            </View> */}
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
        // paddingBottom: 8,
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
    gregorianDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 1,
    },
    selectedDateText: {
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
});

export default JainCalendarScreen;
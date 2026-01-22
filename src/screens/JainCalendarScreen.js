import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    ScrollView
} from 'react-native';
import { getEventsForDate } from '../database/database';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n/i18n';
import { convertJainDateNumber, formatMonthYear, convertDigitsOnly } from '../utils/numberConverter';
import { getFrontCalendar } from '../component/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LanguageSelectorModal from '../component/LanguageSelectorModal';

const JainCalendarScreen = ({ navigation, route }) => {
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [loading, setLoading] = useState(true);          // first full-screen load
    const [calendarLoading, setCalendarLoading] = useState(false); // month flip spinner
    const [calendarData, setCalendarData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [setEvents] = useState([]);
    const [importing, setImporting] = useState(false);
    const [language, setLanguage] = useState(i18n.locale);
    const [kshayTithiList, setKshayTithiList] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const { day, month, year } = route.params || {};
        if (day && month && year) return new Date(year, month - 1, day + 1);
        return new Date();
    });

    useEffect(() => {
        const { day, month, year } = route.params || {};
        if (day && month && year) {
            const target = new Date(year, month - 1, day + 1);
            setCurrentMonth(target);
            setSelectedDate(target.toISOString().split('T')[0]);
        }
    }, [route.params?.day, route.params?.month, route.params?.year]);

    useEffect(() => {
        let lang = i18n.locale;
        setLanguage(lang);
        loadMonthData(currentMonth, true); // first mount -> full loader
    }, []);

    const navigateToToday = () => {
        const today = new Date().toISOString().split('T')[0];
        navigation.navigate('Home', { selectedDate: today });
    };

    const loadMonthData = async (date, isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            else setCalendarLoading(true);

            const selectedCityStr = await AsyncStorage.getItem('selectedCity');
            const selectedCity = selectedCityStr
                ? JSON.parse(selectedCityStr)
                : { lat: '22.2726554', long: '73.1969701', country_code: 'IN' };

            const year = date.getFullYear().toString();
            const month = String(date.getMonth() + 1).padStart(2, '0');

            const response = await getFrontCalendar(
                'multiple', year, month, month, 'gregorian',
                selectedCity.lat.toString(), selectedCity.long.toString(),
                selectedCity.country_code || 'IN', '2082'
            );

            if (response && response.data) {
                setCalendarData(response.data);
                if (response.about_tithi && Array.isArray(response.about_tithi)) {
                    const skipped = response.about_tithi.filter(item => item.type === 'skip');
                    setKshayTithiList(skipped);
                } else setKshayTithiList([]);

                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const todayInMonth = response.data.some(d => d.dateString === todayStr);
                if (todayInMonth) setSelectedDate(todayStr);
            }
        } catch (error) {
            console.error('Error loading month data:', error);
        } finally {
            if (isInitial) setLoading(false);
            else setCalendarLoading(false);
        }
    };

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

    const jainMonthRangeHeader = (data) => {
        if (!data || !data.length) return '';
        const first = data[0], last = data[data.length - 1];
        const pick = (item) =>
            i18n.locale === 'en' ? item.guj_month_english_name
                : i18n.locale === 'gu' ? item.guj_month_gujarati_name
                    : item.guj_month_hindi_name;
        const firstMonth = pick(first), lastMonth = pick(last);
        return firstMonth === lastMonth ? firstMonth : `${firstMonth} – ${lastMonth}`;
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
        navigation.navigate('Home', { selectedDate: yyyyMmDd });
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
        if (item.placeholder) return <View style={styles.calendarCell} />;
        const isSelected = selectedDate === item.dateString;
        const isTodayDate = isToday(item.dateString);
        const isTithiHighlighted = item.tithi === '8' || item.tithi === '14' || (item.tithi === '5' && item.paksha_type?.toLowerCase() === 'sud');
        return (
            <TouchableOpacity
                style={[styles.calendarCell, isSelected && styles.selectedCell, isTodayDate && styles.todayCell]}
                onPress={() => handleDateSelect(item.dateString)}
                activeOpacity={0.7}
            >
                <View style={[styles.dateCircle, isTithiHighlighted && styles.tithiHighlightedCell]}>
                    <Text style={[styles.gregorianDate, isSelected && styles.selectedDateText, isTodayDate && !isSelected && styles.todayText]}>
                        {convertJainDateNumber(item.tithi, i18n.locale)}
                    </Text>
                </View>
                <Text style={[styles.jainDateSmall, isSelected && styles.selectedJainText]}>
                    {i18n.locale === 'en' ? item.guj_month_english_name
                        : i18n.locale === 'gu' ? item.guj_month_gujarati_name
                            : item.guj_month_hindi_name}
                    {` (`}{i18n.t(`date.${(item.paksha_type)?.toLowerCase()}`)}{`)`}
                </Text>
                <Text style={[styles.jainDateSmall, isSelected && styles.selectedJainText]}>
                    {convertJainDateNumber(item.day, i18n.locale)}/{convertJainDateNumber(item.month, i18n.locale)}
                </Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.mainHeader}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{i18n.t('tabs.jain_calendar')}</Text>
                <TouchableOpacity style={styles.headerRight} onPress={() => setShowLanguageModal(true)}>
                    <Ionicons name="language" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                        <Icon name="chevron-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                            {jainMonthRangeHeader(calendarData)}
                        </Text>
                        <Text style={styles.monthText}>
                            {formatMonthYear(currentMonth).month} {formatMonthYear(currentMonth).year}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                        <Icon name="chevron-right" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.weekDaysContainer}>
                    {i18n.t('date.fullWeekDays', { returnObjects: true }).map((day, index) => (
                        <View key={index} style={styles.weekDayCell}>
                            <Text style={styles.weekDayText}>{day.length > 3 ? day.substring(0, 3) : day}</Text>
                        </View>
                    ))}
                </View>

                {calendarLoading ? (
                    <ActivityIndicator size="large" color="#FF6B35" style={{ marginVertical: 40 }} />
                ) : (
                    <FlatList
                        data={calendarGridData}
                        renderItem={renderCalendarItem}
                        keyExtractor={(item) => (item.placeholder ? item.id : item.id.toString())}
                        numColumns={7}
                        scrollEnabled={false}
                        contentContainerStyle={styles.calendarGrid}
                        ListFooterComponent={() => (
                            <View>
                                <View style={styles.bottomBar}>
                                    <TouchableOpacity style={[styles.legendItem, styles.todayButtonStyle]} onPress={navigateToToday} activeOpacity={0.6}>
                                        <Text style={[styles.legendText, styles.todayButtonText]}>
                                            {i18n.t('jainCalendar.today')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.bottomBar}>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.smalldot, { backgroundColor: '#48bf4cff' }]} />
                                        <Text style={styles.legendText}>{i18n.t('jainCalendar.tithi')}</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <Image source={require('../assets/shubh.png')} style={styles.shubhImage} resizeMode="contain" />
                                        <Text style={styles.legendText}>{i18n.t('jainCalendar.shubh_day')}</Text>
                                    </View>
                                </View>
                                {kshayTithiList.length > 0 && (
                                    <View style={styles.kshayContainer}>
                                        <Text style={styles.kshayTitle}>{i18n.t('jainCalendar.tithiKshay')}</Text>
                                        {kshayTithiList.map((item, index) => (
                                            <View key={index} style={styles.kshayRow}>
                                                <Text style={styles.kshayText}>
                                                    {convertJainDateNumber(item.tithi, i18n.locale)} {i18n.t('jainCalendar.tithi')}
                                                </Text>
                                                <Text style={styles.kshayDate}>
                                                    {convertDigitsOnly(item.date, i18n.locale)}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    />
                )}

                <LanguageSelectorModal
                    visible={showLanguageModal}
                    onClose={() => setShowLanguageModal(false)}
                    currentLang={language}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        marginBottom: 50
    },
    mainHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#000',
        paddingVertical: 15,
        paddingHorizontal: 15
    },
    backButton: {
        padding: 5
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    headerRight: {
        width: 30
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#d8d8d8',
        borderBottomWidth: 1,
        borderBottomColor: '#d8d8d8'
    },
    navButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#F5F5F5'
    },
    monthText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A'
    },
    weekDaysContainer: {
        flexDirection: 'row',
        backgroundColor: '#d8d8d8',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    weekDayCell: {
        flex: 1,
        alignItems: 'center'
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
        textTransform: 'uppercase'
    },
    calendarGrid: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 4
    },
    calendarCell: {
        width: '13.8%',
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 1,
        marginHorizontal: 1,
        overflow: 'hidden',
        backgroundColor: '#d8d8d8'
    },
    selectedCell: {
        backgroundColor: '#fff',
        borderRadius: 1
    },
    todayCell: {
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 1
    },
    tithiHighlightedCell: {
        backgroundColor: '#48bf4cff',
        width: 25,
        height: 25,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 1
    },
    gregorianDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 1
    },
    dateCircle: {
        width: 25,
        height: 25,
        borderRadius: 16,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 1
    },
    selectedDateText: {
        color: '#fff'
    },
    tithiHighlightedText: {
        color: '#FFFFFF'
    },
    todayText: {
        color: '#fff'
    },
    jainDateSmall: {
        fontSize: 8,
        color: '#000',
        textAlign: 'center'
    },
    selectedJainText: {
        color: '#000'
    },
    bottomBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderColor: '#E5E5E5',
        paddingVertical: 8,
        paddingHorizontal: 20,
        justifyContent: 'space-around'
    },
    smalldot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#ee0909ff'
    },
    legendItem: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    todayButtonStyle: {
        backgroundColor: '#b9b9b9',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#b9b9b9',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    todayButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        marginLeft: 'auto'
    },
    legendText: {
        fontSize: 12,
        marginTop: 4,
        color: '#333'
    },
    shubhImage: {
        width: 20,
        height: 20
    },
    kshayContainer: {
        backgroundColor: '#fff',
        marginTop: 10,
        marginBottom: 20,
        borderColor: '#fff'
    },
    kshayTitle: {
        paddingStart: 10,
        backgroundColor: '#d8d8d8',
        fontSize: 13,
        fontWeight: '700',
        color: '#000',
        marginBottom: 6
    },
    kshayRow: {
        marginBottom: 6
    },
    kshayText: {
        fontSize: 12,
        marginStart: 10,
        fontWeight: '600',
        color: '#333'
    },
    kshayDate: {
        marginStart: 10,
        fontSize: 11,
        color: '#666'
    },
});

export default JainCalendarScreen;
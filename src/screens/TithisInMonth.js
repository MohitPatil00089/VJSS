import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    SectionList
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n/i18n';
import { getFrontCalendar } from '../component/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LanguageSelectorModal from '../component/LanguageSelectorModal';

const API_URL = "https://absolutewebdevelopment.in/vjss/api/public/v1/get-all-tithi-festivals";


const tabLabels = {
    en: {
        tithi: 'Tithi in Month',
        shubh: 'Shubh Days',
        events: 'Events'
    },
    gu: {
        tithi: 'મહિનાના તિથિ',
        shubh: 'શુભ દિવસો',
        events: 'ઇવેન્ટ્સ'
    },
    hi: {
        tithi: 'मास के तिथि',
        shubh: 'शुभ दिन',
        events: 'आयोजन'
    }
};


const monthToNumber = {
    January: 1, February: 2, March: 3, April: 4,
    May: 5, June: 6, July: 7, August: 8,
    September: 9, October: 10, November: 11, December: 12,
};

const TithisInMonth = ({ navigation }) => {
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [calendarData, setCalendarData] = useState([]);
    const [festivalLookup, setFestivalLookup] = useState({});
    const [activeTab, setActiveTab] = useState('Tithi');
    const [apiError, setApiError] = useState(null);
    const [festivalsData, setFestivalsData] = useState([]);
    const [festivalsLoading, setFestivalsLoading] = useState(false);
    const [festivalsError, setFestivalsError] = useState(null);
    const [shubhDaysData, setShubhDaysData] = useState([]);
    const [shubhDaysLoading, setShubhDaysLoading] = useState(false);
    const [shubhDaysError, setShubhDaysError] = useState(null);
    const currentYear = '2026';

    useEffect(() => {
        let isMounted = true;
       
        const loadAllData = async () => {
            try {
                setLoading(true);
                setApiError(null);
               
                const selectedCityStr = await AsyncStorage.getItem('selectedCity');
                const selectedCity = selectedCityStr ? JSON.parse(selectedCityStr) : {
                    lat: '22.2726554',
                    long: '73.1969701',
                    country_code: 'IN'
                };
                const allMonthsData = [];
               

                const festivalResponse = await fetch(API_URL);
                const festivalJson = await festivalResponse.json();
                const festivalData = festivalJson.data || [];
                const lookup = {};
                festivalData.forEach(item => {
                    const dateKey = `${item.year}-${String(monthToNumber[item.en_greg_month]).padStart(2, '0')}-${item.day.padStart(2, "0")}`;
                    lookup[dateKey] = {
                        en: item.en_paksha,
                        gu: item.gu_paksha,
                        hi: item.hi_paksha
                    };
                });
                if (isMounted) {
                    setFestivalLookup(lookup);
                }
               
                for (let month = 1; month <= 12; month++) {
                    const monthStr = String(month).padStart(2, '0');
                   
                    const response = await getFrontCalendar(
                        'multiple', currentYear, monthStr, monthStr, 'gregorian',
                        selectedCity.lat.toString(), selectedCity.long.toString(),
                        selectedCity.country_code || 'IN', '2082'
                    );
                   
                    if (response?.data && Array.isArray(response.data)) {
                        allMonthsData.push(...response.data);
                    }
                }
               
                if (isMounted) {
                    setCalendarData(allMonthsData);
                }
            } catch (error) {
                if (isMounted) {
                    setApiError(error.message);
                    setCalendarData([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
       
        loadAllData();
       
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (activeTab === 'Events') {
            fetchFestivalData();
        }
    }, [activeTab, i18n.locale]);

    const fetchFestivalData = async () => {
        try {
            setFestivalsLoading(true);
            setFestivalsError(null);
            const response = await fetch(API_URL);
            const json = await response.json();
            const data = json.data || [];
            setFestivalsData(formatFestivalsByMonth(data, i18n.locale));
        } catch (error) {
            console.error("Festival API Error:", error);
            setFestivalsError(error.message);
        } finally {
            setFestivalsLoading(false);
        }
    };

    const formatFestivalsByMonth = (data, lang) => {
        const monthMap = {};
        data.forEach((item) => {
            const englishMonth = item.en_greg_month;
            const monthKey = `${englishMonth} ${item.year}`;
            
            if (!monthMap[monthKey]) {
                monthMap[monthKey] = {
                    displayTitle: {
                        en: `${englishMonth} ${item.year}`,
                        gu: `${item.gu_greg_month} ${item.year}`,
                        hi: `${item.hi_greg_month} ${item.year}`
                    },
                    data: []
                };
            }
            
            let festivalName = item.en_festival;
            if (lang === 'gu') festivalName = item.gu_festival;
            else if (lang === 'hi') festivalName = item.hi_festival;
            
            monthMap[monthKey].data.push({
                title: festivalName,
                date: `${item.day.padStart(2, "0")}/${getMonthNumber(englishMonth)}/${item.year}`,
                dateString: `${item.year}-${getMonthNumber(englishMonth)}-${item.day.padStart(2, "0")}`
            });
        });
        
        const sortedKeys = Object.keys(monthMap).sort((a, b) => {
            const [monthA, yearA] = a.split(" ");
            const [monthB, yearB] = b.split(" ");
            if (yearA !== yearB) return yearA - yearB;
            return monthToNumber[monthA] - monthToNumber[monthB];
        });
        
        return sortedKeys.map(key => ({
            title: monthMap[key].displayTitle[lang],
            data: monthMap[key].data
        }));
    };

    useEffect(() => {
        if (activeTab === 'Shubh Days') {
            fetchShubhDin();
        }
    }, [activeTab, i18n.locale]);

    const fetchShubhDin = async () => {
        try {
            setShubhDaysLoading(true);
            setShubhDaysError(null);
            const response = await fetch(API_URL);
            const json = await response.json();
            const data = json.data || [];
            
            let filtered = data.filter((item) => item.shubh_din === 1) || [];
            
            filtered.sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                const monthA = monthToNumber[a.en_greg_month];
                const monthB = monthToNumber[b.en_greg_month];
                if (monthA !== monthB) return monthA - monthB;
                return parseInt(a.day) - parseInt(b.day);
            });
            
            setShubhDaysData(formatShubhDaysByMonth(filtered, i18n.locale));
        } catch (error) {
            console.error("Shubh Days API Error:", error);
            setShubhDaysError(error.message);
        } finally {
            setShubhDaysLoading(false);
        }
    };

    const formatShubhDaysByMonth = (data, lang) => {
        const monthMap = {};
        data.forEach((item) => {
            const englishMonth = item.en_greg_month;
            const monthKey = `${englishMonth} ${item.year}`;
            
            if (!monthMap[monthKey]) {
                monthMap[monthKey] = {
                    displayTitle: {
                        en: `${englishMonth} ${item.year}`,
                        gu: `${item.gu_greg_month} ${item.year}`,
                        hi: `${item.hi_greg_month} ${item.year}`
                    },
                    data: []
                };
            }
            
            const gujMonth = lang === 'gu' ? item.gu_guj_month :
                             lang === 'hi' ? item.hi_guj_month :
                             item.en_guj_month;
            
            const paksha = lang === 'gu' ? item.gu_paksha :
                           lang === 'hi' ? item.hi_paksha :
                           item.en_paksha;
            
            const tithiNumber = lang === 'gu' ? item.gu_tithi :
                                lang === 'hi' ? item.hi_tithi :
                                item.en_tithi;
            
            monthMap[monthKey].data.push({
                gujMonth,
                paksha,
                tithiNumber,
                day: String(item.day).padStart(2, '0'),
                monthNum: getMonthNumber(englishMonth),
                year: item.year,
                dateKey: `${item.year}-${getMonthNumber(englishMonth)}-${item.day.padStart(2, "0")}`,
                dateString: `${item.year}-${getMonthNumber(englishMonth)}-${item.day.padStart(2, "0")}`
            });
        });
        
        const sortedKeys = Object.keys(monthMap).sort((a, b) => {
            const [monthA, yearA] = a.split(" ");
            const [monthB, yearB] = b.split(" ");
            if (yearA !== yearB) return yearA - yearB;
            return monthToNumber[monthA] - monthToNumber[monthB];
        });
        
        return sortedKeys.map(key => ({
            title: monthMap[key].displayTitle[lang],
            data: monthMap[key].data
        }));
    };

    const getMonthNumber = (month) => {
        return monthToNumber[month] || '01';
    };

    const isTithiHighlighted = (item) => {
        return item.tithi === '8' ||
               item.tithi === '14' ||
               (item.tithi === '5' && item.paksha_type?.toLowerCase() === 'sud');
    };

    const getDisplayData = (item) => {
        const isEnglish = i18n.locale === 'en';
        const isGujarati = i18n.locale === 'gu';
       
        const gujMonth = isEnglish ? item.guj_month_english_name :
                        isGujarati ? item.guj_month_gujarati_name :
                        item.guj_month_hindi_name;
       

        const dateKey = `${item.year}-${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
        const pakshaFromApi = festivalLookup[dateKey]?.[i18n.locale];
        const paksha = pakshaFromApi || item.paksha_type || '';
       
        const tithiNumber = item.tithi;
        const monthName = isEnglish ? item.gregorian_english_month_name :
                         isGujarati ? item.gregorian_gujarati_month_name :
                         item.gregorian_hindi_month_name;
       
        return {
            gujMonth,
            paksha,
            tithiNumber,
            monthName,
            day: String(item.day).padStart(2, '0'),
            monthNum: item.month,
            year: item.year,
            dateKey: item.dateString
        };
    };

    const handleCardPress = (dateString) => {
        navigation.navigate('Home', { selectedDate: dateString });
    };

    const groupByMonth = (data) => {
        const grouped = {};
        data.forEach(item => {
            const monthKey = item.month;
            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            grouped[monthKey].push(item);
        });
        return grouped;
    };

    const getSortedMonthEntries = (groupedData) => {
        return Object.entries(groupedData)
            .sort(([monthA], [monthB]) => parseInt(monthA) - parseInt(monthB));
    };

    const tithiHighlightedData = calendarData.filter(isTithiHighlighted);
    const tithiGrouped = groupByMonth(tithiHighlightedData);
    const tithiSortedMonths = getSortedMonthEntries(tithiGrouped);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            <View style={styles.mainHeader}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{i18n.t('tabs.tithi')}</Text>
                <TouchableOpacity style={styles.headerRight} onPress={() => setShowLanguageModal(true)}>
                    <Ionicons name="language" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.bottomTabBar}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'Tithi' && styles.activeTab]}
                    onPress={() => setActiveTab('Tithi')}
                >
                    <Text style={[styles.tabText, activeTab === 'Tithi' && styles.activeTabText]}>
                        {tabLabels[i18n.locale]?.tithi || tabLabels.en.tithi}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'Shubh Days' && styles.activeTab]}
                    onPress={() => setActiveTab('Shubh Days')}
                >
                    <Text style={[styles.tabText, activeTab === 'Shubh Days' && styles.activeTabText]}>
                        {tabLabels[i18n.locale]?.shubh || tabLabels.en.shubh}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'Events' && styles.activeTab]}
                    onPress={() => setActiveTab('Events')}
                >
                    <Text style={[styles.tabText, activeTab === 'Events' && styles.activeTabText]}>
                        {tabLabels[i18n.locale]?.events || tabLabels.en.events}
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'Events' ? (
                <View style={styles.eventsContainer}>
                    {festivalsLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FF6B35" />
                            <Text style={styles.loadingText}>Loading festivals...</Text>
                        </View>
                    ) : festivalsError ? (
                        <View style={styles.errorContainer}>
                            <Icon name="error-outline" size={48} color="#FF6B35" />
                            <Text style={styles.errorText}>Failed to load festivals</Text>
                            <Text style={styles.errorDetail}>{festivalsError}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchFestivalData}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <SectionList
                            sections={festivalsData}
                            keyExtractor={(item, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.sectionListContent}
                            renderSectionHeader={({ section }) => (
                                <Text style={styles.monthHeader}>{section.title}</Text>
                            )}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.festivalCard}
                                    onPress={() => handleCardPress(item.dateString)}
                                >
                                    <View style={styles.left}>
                                        <View style={styles.greenDot} />
                                    </View>

                                    <View style={styles.center}>
                                        <Text style={styles.festivalText}>{item.title}</Text>
                                        <Text style={styles.dateText}>{item.date}</Text>
                                    </View>

                                    <View style={styles.right}>
                                        <Ionicons name="chevron-forward" size={26} color="#9E1B17" />
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            ) : activeTab === 'Shubh Days' ? (
                <View style={styles.eventsContainer}>
                    {shubhDaysLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FF6B35" />
                            <Text style={styles.loadingText}>Loading Shubh Days...</Text>
                        </View>
                    ) : shubhDaysError ? (
                        <View style={styles.errorContainer}>
                            <Icon name="error-outline" size={48} color="#FF6B35" />
                            <Text style={styles.errorText}>Failed to load Shubh Days</Text>
                            <Text style={styles.errorDetail}>{shubhDaysError}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchShubhDin}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <SectionList
                            sections={shubhDaysData}
                            keyExtractor={(item, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.sectionListContent}
                            renderSectionHeader={({ section }) => (
                                <Text style={styles.monthHeader}>{section.title}</Text>
                            )}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.shubhDayCard}
                                    onPress={() => handleCardPress(item.dateString)}
                                >
                                    <View style={styles.cardContent}>
                                        <View style={styles.greenDot} />
                                        <View style={styles.cardText}>
                                            <Text style={styles.shubhDayMainText}>
                                                {item.gujMonth} {item.paksha} {item.tithiNumber}
                                            </Text>
                                            <Text style={styles.shubhDayDateText}>
                                                {item.day}/{item.monthNum}/{item.year}
                                            </Text>
                                        </View>
                                        <Icon name="chevron-right" size={24} color="#9E1B17" style={styles.rightArrow} />
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            ) : (
                <ScrollView style={styles.tabContent}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FF6B35" />
                            <Text style={styles.loadingText}>Loading calendar data...</Text>
                        </View>
                    ) : apiError ? (
                        <View style={styles.errorContainer}>
                            <Icon name="error-outline" size={48} color="#FF6B35" />
                            <Text style={styles.errorText}>Failed to load data</Text>
                            <Text style={styles.errorDetail}>{apiError}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={() => navigation.replace('TithisInMonth')}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.tabInner}>
                            {tithiHighlightedData.length === 0 ? (
                                <Text style={styles.noEventsText}>No tithi data available.</Text>
                            ) : (
                                tithiSortedMonths.map(([monthNum, items]) => {

                                    const isEnglish = i18n.locale === 'en';
                                    const isGujarati = i18n.locale === 'gu';
                                    const monthName = isEnglish ? items[0]?.gregorian_english_month_name :
                                                    isGujarati ? items[0]?.gregorian_gujarati_month_name :
                                                    items[0]?.gregorian_hindi_month_name || 'Month';
                                    const year = items[0]?.year || currentYear;
                                    
                                    return (
                                        <View key={monthNum}>
                                            <Text style={styles.monthSectionTitle}>{monthName} {year}</Text>
                                            {items.map((d) => {
                                                const data = getDisplayData(d);
                                                return (
                                                    <TouchableOpacity
                                                        key={data.dateKey}
                                                        style={styles.shubhDayCard}
                                                        onPress={() => handleCardPress(d.dateString)}
                                                    >
                                                        <View style={styles.cardContent}>
                                                            <View style={styles.greenDot} />
                                                            <View style={styles.cardText}>
                                                                <Text style={styles.shubhDayMainText}>
                                                                    {data.gujMonth} {data.paksha} {data.tithiNumber}
                                                                </Text>
                                                                <Text style={styles.shubhDayDateText}>
                                                                    {data.day}/{data.monthNum}/{data.year}
                                                                </Text>
                                                            </View>
                                                            <Icon name="chevron-right" size={24} color="#9E1B17" style={styles.rightArrow} />
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    );
                                })
                            )}
                        </View>
                    )}
                </ScrollView>
            )}

            <LanguageSelectorModal
                visible={showLanguageModal}
                onClose={() => setShowLanguageModal(false)}
                currentLang={i18n.locale}
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
    eventsContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    sectionListContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 150,
    },
    tabInner: {
        paddingBottom: 30,
    },
    monthSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 16,
        marginBottom: 12,
        paddingLeft: 8,
    },
    shubhDayCard: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    cardText: {
        flex: 1,
        marginLeft: 12,
    },
    greenDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4CAF50',
    },
    rightArrow: {
        marginLeft: 8,
    },
    shubhDayMainText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    shubhDayDateText: {
        fontSize: 14,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingTop: 50,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8B4513',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 20,
        paddingTop: 50,
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#FF6B35',
    },
    errorDetail: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#9E1B17',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    noEventsText: {
        fontSize: 15,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },

    monthHeader: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginVertical: 14,
        paddingLeft: 8,
    },
    festivalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 14,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    left: {
        width: 24,
        alignItems: 'center',
    },
    center: {
        flex: 1,
        paddingLeft: 10,
    },
    right: {
        width: 30,
        alignItems: 'flex-end',
    },
    festivalText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    dateText: {
        marginTop: 6,
        fontSize: 14,
        color: '#666',
    },
});

export default TithisInMonth;
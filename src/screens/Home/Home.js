import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ImageBackground,
    Image,
    Dimensions,
    Modal,
    TouchableWithoutFeedback,
    TextInput,
    FlatList,
    Linking,
    Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';
import i18n, { changeLanguage, getCurrentLanguage } from '../../i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { convertNumber, formatJainDate, formatTime } from '../../utils/numberConverter';
import { getCurrentTimings } from '../../utils/timingCalculator';
import { getCalendarData, initDatabase } from '../../database/database';
import moment from 'moment-timezone';
import importAllData from '../../database/importData';
import { getAllLocations } from '../../component/global';

const { width } = Dimensions.get('window');
const CHART_SIZE = width * 0.95; // Increased size to take more screen width
const CHART_RADIUS = CHART_SIZE / 2;
const SUN_EVENT_MINUTES = 15;
const getDurationInMinutes = (timeRange) => {
    // "07:10 - 08:40"
    const [start, end] = timeRange.split('-').map(t => t.trim());

    const toMinutes = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    return toMinutes(end) - toMinutes(start);
};

const Chart = ({ data: sunTimes = {}, choghadiya = {} }) => {
    const choghadiyaData =
        choghadiya?.day?.map(item => ({
            label: item.name
                .split('.')
                .pop()
                .replace(/^\w/, c => c.toUpperCase()),
            value: getDurationInMinutes(item.time), // 🔥 dynamic
            color: item.color,
            time: item.time
        })) || [];

    // Add sunrise at start and sunset at end
    const data = [
        {
            label: 'Sunrise',
            value: SUN_EVENT_MINUTES, // Smaller segment for sun events
            color: 'rgba(0, 0, 0, 0.3)',
            isSunEvent: true,
            time: sunTimes.sunrise || '--:-- --'
        },
        ...choghadiyaData,
        {
            label: 'Sunset',
            value: SUN_EVENT_MINUTES,// Smaller segment for sun events
            color: 'rgba(0, 0, 0, 0.3)',
            isSunEvent: true,
            time: sunTimes.sunset || '--:-- --'
        }
    ];
    // console.log('Data:', data);
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const chartHeight = CHART_RADIUS * 1.2; // Adjusted for half circle
    const centerX = CHART_RADIUS;
    const centerY = CHART_RADIUS * 0.9; // Position center Y lower for half circle
    const outerRadius = CHART_RADIUS * 0.8;
    const innerRadius = CHART_RADIUS * 0.001;
    let startAngle = 180;

    // Function to create a half-circle segment
    const createHalfCircleSegment = (startAngle, endAngle, color, index) => {
        // Convert angles to radians
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        // Calculate inner and outer points
        const x1 = centerX + innerRadius * Math.cos(startRad);
        const y1 = centerY - innerRadius * Math.sin(startRad);
        const x2 = centerX + innerRadius * Math.cos(endRad);
        const y2 = centerY - innerRadius * Math.sin(endRad);

        const x3 = centerX + outerRadius * Math.cos(endRad);
        const y3 = centerY - outerRadius * Math.sin(endRad);
        const x4 = centerX + outerRadius * Math.cos(startRad);
        const y4 = centerY - outerRadius * Math.sin(startRad);

        // Create the path for the segment
        const path = `M ${x1} ${y1} 
                     A ${innerRadius} ${innerRadius} 0 0 1 ${x2} ${y2} 
                     L ${x3} ${y3} 
                     A ${outerRadius} ${outerRadius} 0 0 0 ${x4} ${y4} 
                     Z`;

        return (
            <Path
                key={`segment-${index}`}
                d={path}
                fill={color}
                stroke="white"
                strokeWidth={0.5}
            />
        );
    };

    // Generate segments
    const segments = data.map((item, index) => {
        const segmentAngle = (item.value / total) * 180;
        const endAngle = startAngle - segmentAngle;

        const segment = createHalfCircleSegment(
            startAngle,
            endAngle,
            item.color,
            index
        );

        // Calculate label position
        const middleAngle = (startAngle + endAngle) / 2;
        const labelRadius = (innerRadius + outerRadius) / 2;
        const labelX = centerX + labelRadius * Math.cos((middleAngle * Math.PI) / 180);
        const labelY = centerY - labelRadius * Math.sin((middleAngle * Math.PI) / 180);

        // Update start angle for next segment
        startAngle = endAngle;

        return (
            <React.Fragment key={`fragment-${index}`}>
                {segment}
                {/* <SvgText
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    fontSize="10"
                    fill="black"
                    transform={`rotate(${-middleAngle + 90}, ${labelX}, ${labelY})`}
                >
                    {item.label}
                </SvgText> */}
            </React.Fragment>
        );
    });

    return (
        <View style={[styles.chartContainer, { height: chartHeight }]}>
            <Svg width={CHART_SIZE} height={chartHeight}>
                {/* Background half-circle */}
                <Path
                    d={`M ${centerX - outerRadius} ${centerY} 
                       A ${outerRadius} ${outerRadius} 0 0 1 ${centerX + outerRadius} ${centerY} 
                       L ${centerX + innerRadius} ${centerY} 
                       A ${innerRadius} ${innerRadius} 0 0 0 ${centerX - innerRadius} ${centerY} Z`}
                    fill="rgba(255, 255, 255, 0.1)"
                />

                {/* Segments */}
                {segments}

                {/* Inner circle removed as requested */}
            </Svg>

            {/* Sun and Moon times */}
            <View style={styles.sunMoonContainer}>
                <View style={styles.timeContainer}>
                    <Icon name="sunny" size={20} color="#FFD700" />
                    <Text style={styles.timeText}>{formatTime(sunTimes?.sunrise, i18n.locale)}</Text>
                    <Text style={styles.timeLabel}>{i18n.t('time.sunrise')}</Text>
                </View>
                <View style={styles.timeContainer}>
                    <Icon name="moon" size={20} color="#87CEEB" />
                    <Text style={styles.timeText}>{formatTime(sunTimes?.sunset, i18n.locale)}</Text>
                    <Text style={styles.timeLabel}>{i18n.t('time.sunset')}</Text>
                </View>
            </View>
        </View>
    );
};


const Home = ({ route, navigation }) => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pachakkhan');
    const [cities, setCities] = useState([]);
    const [choghadiyaActiveTab, setChoghadiyaActiveTab] = useState('sun');
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);
    const [citySearch, setCitySearch] = useState('');
    const [selectedCity, setSelectedCity] = useState(null);
    const [currentLanguage, setCurrentLanguage] = useState('gu'); // Default to Gujarati
    const [timingData, setTimingData] = useState([]);
    const [choghadiyaData, setChoghadiyaData] = useState({ day: [], night: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [jainDateInfo, setJainDateInfo] = useState('');
    const { city } = route.params || {};
    const [sunTimes, setSunTimes] = useState({
        sunrise: '--:-- --',
        sunset: '--:-- --'
    });
    // Current date information
    const [selectedDate, setSelectedDate] = useState(
        route.params?.selectedDate ? new Date(route.params.selectedDate) : new Date()
    );
    const [currentDate] = useState({
        day: 7,
        month: 'magshar',
        paksh: 'shukla',
        tithi: 'saptami',
        isAmavasya: false,
        isPurnima: false
    });

    useEffect(() => {
        const loadSelectedCity = async () => {
            try {
                const cityData = await AsyncStorage.getItem('selectedCity');
                if (cityData) {
                    const parsedCity = JSON.parse(cityData);
                    setSelectedCity(parsedCity);
                }
            } catch (error) {
                console.error('Error loading selected city:', error);
            } finally {
                setLoading(false);
            }
        };

        // Load city when component mounts
        loadSelectedCity();

        // Add a listener to refresh when the screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            loadSelectedCity();
        });

        return unsubscribe;
    }, [navigation]);

    // Load saved language on component mount
    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem('userLanguage');
                if (savedLanguage) {
                    changeLanguage(savedLanguage);
                    setCurrentLanguage(savedLanguage);
                }
            } catch (error) {
                console.error('Error loading language:', error);
            }
        };
        loadLanguage();
    }, []);

    // Update selectedDate when navigation params change
    useEffect(() => {
        if (route.params?.selectedDate) {
            const newDate = new Date(route.params.selectedDate);
            setSelectedDate(newDate);
        }
    }, [route.params?.selectedDate]);

    useEffect(() => {
        const loadData = async () => {
            try {
                await initDatabase();
                await importAllData();
                await loadJainDate(selectedDate);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, [selectedDate]);

    const loadJainDate = async () => {
        try {
            const dateStr = moment(selectedDate).format('YYYY-MM-DD');
            console.log("dateStr", dateStr);
            const calendarData = await getCalendarData(dateStr, dateStr);
            console.log("calendarData", calendarData);
            if (calendarData && calendarData.length > 0) {
                setJainDateInfo(calendarData[0].jain_date_full || '');
            } else {
                setJainDateInfo('');
            }
        } catch (error) {
            console.error('Error loading Jain date:', error);
            setJainDateInfo('');
        }
    };

    // Load timings when city or selected date changes
    useEffect(() => {
        const loadTimings = async () => {
            if (!selectedDate) return;

            try {
                setIsLoading(true);
                const timings = await getCurrentTimings(selectedDate);
                // console.log('Received timings for date:', selectedDate, timings);
                setTimingData(timings.timings);
                setChoghadiyaData(timings.choghadiya);
                setSunTimes({
                    sunrise: timings.sunrise,
                    sunset: timings.sunset
                });
            } catch (error) {
                console.error('Error loading timings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTimings();

        // Only set up interval if we're using the current date
        let interval;
        const isCurrentDate = selectedDate && moment(selectedDate).isSame(moment(), 'day');
        if (isCurrentDate) {
            interval = setInterval(loadTimings, 60 * 60 * 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [selectedCity, selectedDate]);
    useEffect(() => {
        const loadCities = async () => {
            try {
                // Always try to fetch fresh data
                const freshCities = await getAllLocations();
                if (freshCities && freshCities.length > 0) {
                    setCities(freshCities);

                }
            } catch (error) {
                console.error('Error loading cities:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCities();
    }, []);

    const handleLanguageChange = async (language) => {
        try {
            // Save the selected language to AsyncStorage
            await AsyncStorage.setItem('userLanguage', language);

            // Update the i18n locale
            i18n.locale = language;

            // Update the app state to reflect the language change
            setCurrentLanguage(language);

            // Close the language selection modal
            setShowLanguageModal(false);

            // Optional: Refresh any data that might be language-dependent
            // For example, if you have data that needs to be refetched
            // fetchData();

        } catch (error) {
            console.error('Error saving language:', error);
        }
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: 'Jain Panchang - Vitraag http://play.google.com/store/apps/details?id=gnhub.vitraag',
            });
        } catch (e) {
            // ignore
        }
    };

    // Timing data and choghadiya data are now managed by state


    const menuItems = [
        {
            id: '1',
            title: i18n.t('menu.jainCalendar'),
            subtitle: i18n.t('menu.veerSamvat'),
            onPress: () => navigation.navigate('JainCalendar')
        },
        { id: '2', title: i18n.t('menu.tithisInMonth'), onPress: () => navigation.navigate('JainCalendar') },
        { id: '3', title: i18n.t('menu.pachakkhan'), onPress: () => navigation.navigate('Pachhakkhan') },
        { id: '4', title: i18n.t('menu.tapAaradhana'), onPress: () => navigation.navigate('TapAaradhana') },
        { id: '5', title: i18n.t('menu.kalyanak'), onPress: () => navigation.navigate('Kalyanak') },
        { id: '6', title: i18n.t('menu.tirthankars'), onPress: () => navigation.navigate('Tirthankars') },
        { id: '7', title: i18n.t('menu.ourWebsite'), onPress: () => Linking.openURL('https://vitraagjainsangh.org') },
    ];

    return (
        <ImageBackground
            source={require('../../assets/home_background.jpeg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" backgroundColor="#9E1B17" />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <TouchableOpacity onPress={onShare} activeOpacity={0.7}>
                                <Icon name="share-social-outline" size={24} color="white" />
                            </TouchableOpacity>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <View style={styles.rightIcons}>
                                <TouchableOpacity onPress={() => setShowCityModal(true)} activeOpacity={0.7}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Icon name="location-outline" size={24} color="white" />
                                        {((selectedCity && selectedCity.name) || (route.params && route.params.name)) ? (
                                            <Text style={styles.cityAbbr}>{((selectedCity && selectedCity.name) || (route.params && route.params.name)).slice(0, 3)}</Text>
                                        ) : null}
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setShowLanguageModal(true)}
                                    activeOpacity={0.7}
                                    style={styles.iconSpacing}
                                >
                                    <Icon name="language" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.scrollContainer}>
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={[styles.content, styles.scrollContent]}
                            showsVerticalScrollIndicator={false}
                        >
                            <Chart data={sunTimes} choghadiya={choghadiyaData} />


                            {/* Tabs */}
                            <View style={styles.tabs}>
                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 'pachakkhan' && styles.activeTab]}
                                    onPress={() => setActiveTab('pachakkhan')}
                                >
                                    <Text style={[styles.tabText, activeTab === 'pachakkhan' && styles.activeTabText]}>
                                        {i18n.t('tabs.pachakkhan')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 'choghadiya' && styles.activeTab]}
                                    onPress={() => setActiveTab('choghadiya')}
                                >
                                    <Text style={[styles.tabText, activeTab === 'choghadiya' && styles.activeTabText]}>
                                        {i18n.t('tabs.choghadiya')}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {activeTab === 'pachakkhan' ? (
                                <>


                                    <View style={styles.timingsContainer}>
                                        <View style={styles.column}>
                                            {timingData.slice(0, 3).map((item) => (
                                                <View key={item.id} style={styles.timingItem}>
                                                    <View style={[
                                                        styles.timingDot,
                                                        {
                                                            backgroundColor:
                                                                item.id === '1' ? '#FFD700' : // Yellow
                                                                    item.id === '2' ? '#32CD32' : // Green
                                                                        item.id === '3' ? '#1E90FF' : // Blue
                                                                            item.id === '4' ? '#9370DB' : // Purple
                                                                                item.id === '5' ? '#FF6347' : // Tomato
                                                                                    '#FFA500' // Orange
                                                        }
                                                    ]} />
                                                    <View style={styles.timingTextContainer}>
                                                        <Text style={styles.timingName}>{i18n.t(item.name)}</Text>
                                                        <Text style={styles.timingTime}>
                                                            {formatTime(item.time, i18n.locale)}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                        <View style={styles.column}>
                                            {timingData.slice(3).map((item) => (
                                                <View key={item.id} style={styles.timingItem}>
                                                    <View style={[
                                                        styles.timingDot,
                                                        {
                                                            backgroundColor:
                                                                item.id === '1' ? '#FFD700' : // Yellow
                                                                    item.id === '2' ? '#32CD32' : // Green
                                                                        item.id === '3' ? '#1E90FF' : // Blue
                                                                            item.id === '4' ? '#9370DB' : // Purple
                                                                                item.id === '5' ? '#FF6347' : // Tomato
                                                                                    '#FFA500' // Orange
                                                        }
                                                    ]} />
                                                    <View style={styles.timingTextContainer}>
                                                        <Text style={styles.timingName}>{i18n.t(item.name)}</Text>
                                                        <Text style={styles.timingTime}>
                                                            {formatTime(item.time, i18n.locale)}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.choghadiyaContainer}>
                                    <TouchableOpacity style={{ alignItems: "center", width: "15%" }} onPress={() => setChoghadiyaActiveTab('sun')}>
                                        <Icon name="sunny" size={20} color="#FFD700" />
                                    </TouchableOpacity>
                                    <View style={{ alignItems: "center", width: "70%" }}>
                                        {choghadiyaActiveTab === 'sun' ?
                                            choghadiyaData.day.map((item) => (
                                                <View key={item.id} style={styles.choghadityaYimingItem}>
                                                    <View style={[
                                                        styles.timingDot,
                                                        {
                                                            backgroundColor:
                                                                item.color
                                                        }
                                                    ]} />
                                                    <View style={styles.timingTextContainer}>
                                                        <Text style={styles.timingName}>{i18n.t(item.name)}</Text>
                                                    </View>
                                                    <Text style={styles.timingTime}>
                                                        {formatTime(item.time, i18n.locale)}
                                                    </Text>
                                                </View>
                                            )) :
                                            choghadiyaData.night.map((item) => (
                                                <View key={item.id} style={styles.choghadityaYimingItem}>
                                                    <View style={[
                                                        styles.timingDot,
                                                        {
                                                            backgroundColor:
                                                                item.color
                                                        }
                                                    ]} />
                                                    <View style={styles.timingTextContainer}>
                                                        <Text style={styles.timingName}>{i18n.t(item.name)}</Text>
                                                    </View>
                                                    <Text style={styles.timingTime}>
                                                        {formatTime(item.time, i18n.locale)}
                                                    </Text>
                                                </View>
                                            ))}
                                    </View>
                                    <TouchableOpacity style={{ alignItems: "center", width: "15%" }} onPress={() => setChoghadiyaActiveTab('moon')}>
                                        <Icon name="moon" size={20} color="#87CEEB" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            <View style={{
                                backgroundColor: 'rgba(128, 0, 0)',
                            }}>
                                <View style={styles.timingsHeader}>
                                    <Text style={styles.todayText}>
                                        {moment(selectedDate).isSame(moment(), 'day')
                                            ? i18n.t('date.today')
                                            : moment(selectedDate).format('DD MMMM YYYY')}
                                    </Text>
                                    <Text style={styles.dateText}>
                                        {formatJainDate(jainDateInfo, i18n.locale)}
                                    </Text>
                                </View>
                                {/* Menu Items */}
                                <TouchableOpacity
                                    key={menuItems[0].id}
                                    style={styles.menuItem}
                                    onPress={menuItems[0].onPress}
                                >
                                    <View style={styles.menuItemContent}>
                                        <Text style={styles.menuItemTitle}>{menuItems[0].title}</Text>
                                        <Text style={styles.menuItemSubtitle}>{menuItems[0].subtitle}</Text>
                                    </View>
                                    <Icon name="chevron-forward" size={20} color="#fff" />
                                </TouchableOpacity>
                                <View style={styles.menuContainer}>
                                    {menuItems.slice(1).map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={styles.menuItem}
                                            onPress={() => {

                                                // Handle menu item press
                                                if (item.onPress) {
                                                    item.onPress();
                                                } else {
                                                    console.log(`Pressed ${item.title}`);
                                                }
                                            }}
                                        >
                                            <View>
                                                <Text style={styles.menuItemTitle}>{item.title}</Text>
                                                {item.subtitle && (
                                                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                                                )}
                                            </View>
                                            <Icon name="chevron-forward" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Footer Buttons */}
                                <View style={styles.footerButtons}>
                                    <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('About')}>
                                        <Text style={styles.footerButtonText}>{i18n.t('about')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('FAQ')}>
                                        <Text style={styles.footerButtonText}>{i18n.t('faq')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>

                    {/* Language Selection Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={showLanguageModal}
                        onRequestClose={() => setShowLanguageModal(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setShowLanguageModal(false)}>
                            <View style={styles.modalOverlay}>
                                <TouchableWithoutFeedback>
                                    <View style={styles.modalContent}>
                                        <Text style={styles.modalTitle}>{i18n.t('selectLanguage')}</Text>
                                        <TouchableOpacity
                                            style={[
                                                styles.languageOption,
                                                currentLanguage === 'en' && styles.selectedLanguage
                                            ]}
                                            onPress={() => handleLanguageChange('en')}
                                        >
                                            <Text style={styles.languageText}>{i18n.t('english')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.languageOption,
                                                currentLanguage === 'hi' && styles.selectedLanguage
                                            ]}
                                            onPress={() => handleLanguageChange('hi')}
                                        >
                                            <Text style={styles.languageText}>{i18n.t('hindi')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.languageOption,
                                                currentLanguage === 'gu' && styles.selectedLanguage,
                                                { borderBottomWidth: 0 }
                                            ]}
                                            onPress={() => handleLanguageChange('gu')}
                                        >
                                            <Text style={styles.languageText}>{i18n.t('gujarati')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                    {/* City Selection Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={showCityModal}
                        onRequestClose={() => setShowCityModal(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setShowCityModal(false)}>
                            <View style={styles.modalOverlay}>
                                <TouchableWithoutFeedback>
                                    <View style={styles.modalContent}>
                                        <Text style={styles.modalTitle}>Select City</Text>
                                        {((selectedCity && selectedCity.city) || (route.params && route.params.city)) && (
                                            <Text style={styles.selectedHint}>
                                                Current: {((selectedCity && selectedCity.city) || (route.params && route.params.city))}
                                            </Text>
                                        )}
                                        <View style={{ paddingHorizontal: 15, paddingBottom: 10 }}>
                                            <TextInput
                                                style={styles.searchInput}
                                                placeholder="Search city/state/country"
                                                placeholderTextColor="#999"
                                                value={citySearch}
                                                onChangeText={setCitySearch}
                                            />
                                        </View>
                                        <FlatList
                                            data={cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))}
                                            keyExtractor={(item, index) => `${item.name}-${index}`}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    style={[
                                                        styles.cityOption,
                                                        selectedCity && selectedCity.city === item.city && { backgroundColor: '#f8f8f8' }
                                                    ]}
                                                    onPress={async () => {
                                                        try {
                                                            await AsyncStorage.setItem('selectedCity', JSON.stringify({
                                                                name: item.name,
                                                                lat: item.lat,
                                                                long: item.long,
                                                                country_code: item.country_code,
                                                                timezone: item.timezone
                                                            }));
                                                        } catch (e) { }
                                                        setSelectedCity(item);
                                                        setShowCityModal(false);
                                                    }}
                                                >
                                                    <Text style={styles.cityText}>{item.name}</Text>
                                                    <Text style={styles.citySubText}>{item.timezone} • {item.lat}, {item.long}</Text>
                                                </TouchableOpacity>
                                            )}
                                            style={{ maxHeight: 350 }}
                                        />
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(rgba(128, 0, 0, 0.6))',
    },
    container: {
        flex: 1,
    },
    header: {
        padding: 15,
        paddingTop: 50,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconSpacing: {
        marginLeft: 14,
    },
    logo: {
        width: 200,
        height: 40,
        marginStart: 30,
    },
    scrollContainer: {
        flex: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingBottom: 30,
    },
    scrollContent: {
        paddingTop: 20,
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: 0,
        paddingHorizontal: 5,
        marginTop: -10,
    },
    chartSvg: {
        alignSelf: 'center',
        marginBottom: 0,
    },
    sunMoonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingBottom: 10,
        marginTop: -30,
    },
    timeContainer: {
        alignItems: 'center',
    },
    timeText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },
    timeLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        marginTop: 2,
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 50,
    },
    tab: {
        width: "50%",
        paddingVertical: 10,
        // borderRadius: 5,
        // marginHorizontal: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        backgroundColor: 'rgba(128, 0, 0, 0.9)',
    },
    tabText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    activeTabText: {
        fontWeight: 'bold',
    },
    timingsHeader: {
        backgroundColor: 'rgba(128, 0, 0, 0.9)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginVertical: 15,
    },
    todayText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dateText: {
        color: 'white',
        fontSize: 16,
    },
    timingsContainer: {
        // backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        marginHorizontal: 15,
        // paddingTop: 10,
        // marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {
        width: '48%',
    },
    timingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 10,
    },
    choghadityaYimingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 10,
    },
    timingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 15,
    },
    timingTextContainer: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: 10,
    },
    timingName: {
        color: 'white',
        fontSize: 16,
    },
    timingTime: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        opacity: 0.8,
    },
    menuContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        marginHorizontal: 15,
        marginBottom: 20,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',

        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    menuItemTitle: {
        color: 'white',
        fontSize: 16,
        marginBottom: 3,
    },
    menuItemSubtitle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        paddingHorizontal: 5,
        marginTop: 10,
    },
    footerButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingVertical: 10,
        width: "49%",
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerButtonText: {
        color: 'rgba(128, 0, 0, 0.9)',
        fontSize: 14,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 15,
        width: '90%',
        overflow: 'hidden',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        padding: 20,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedHint: {
        fontSize: 14,
        paddingHorizontal: 20,
        paddingTop: 10,
        color: '#444',
    },
    languageOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedLanguage: {
        backgroundColor: '#f8f8f8',
    },
    languageText: {
        fontSize: 16,
        textAlign: 'center',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        color: '#333',
    },
    cityOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cityText: {
        fontSize: 16,
        color: '#222',
        marginBottom: 4,
    },
    citySubText: {
        fontSize: 12,
        color: '#666',
    },
    choghadiyaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: "100%",
        paddingTop: 10,
    },
    cityAbbr: {
        color: 'white',
        marginLeft: 3,
        fontWeight: 'bold',
        fontSize: 12,
        textTransform: 'uppercase'
    }
});

export default Home;

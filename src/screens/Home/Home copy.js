import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    ActivityIndicator,
    Alert,
    Easing,
    Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Svg, { Path, G, Text as SvgText, Defs, Mask } from 'react-native-svg';
import i18n, { changeLanguage } from '../../i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { convertDigitsOnly, formatTime } from '../../utils/numberConverter';
import moment from 'moment-timezone';
import { getAllLocations, getFrontDashboardData, getDashboardData, getThemeSettings, getFrontPanchakhan } from '../../component/global';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const IMAGE_SCALE = 1.4;

const IMAGE_WIDTH = width * IMAGE_SCALE;
const IMAGE_HEIGHT = height * IMAGE_SCALE;
const CHART_SIZE = width * 0.95;
const CHART_RADIUS = CHART_SIZE / 2;
const SUN_EVENT_MINUTES = 15;

const getDurationInMinutes = (timeRange) => {
    const [start, end] = timeRange.split('-').map(t => t.trim());

    const toMinutes = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    return toMinutes(end) - toMinutes(start);
};

const getTimingColor = (timingName) => {
    const colorMap = {
        'Sunrise': '#FF9500',
        'Navkarshi': '#FFCC00',
        'Porisi': '#00E676',
        'Saddha Porisi': '#2979FF',
        'Purimaddha': '#D500F9',
        'Avaddha': '#FF3D00',
        'Sunset': '#FF1744',
        'सूर्योदय': '#FF9500',
        'नवकारशी': '#FFCC00',
        'पोरिसी': '#00E676',
        'साड्ढ-पोरिसिं': '#2979FF',
        'पुरिमड्ढ': '#D500F9',
        'अवड्ढ': '#FF3D00',
        'सूर्यास्त': '#FF1744',
        'સૂર્યોદય': '#FF9500',
        'નવકારશી': '#FFCC00',
        'પોરિસિં': '#00E676',
        'સાડ્ઢપોરિસિં': '#2979FF',
        'પુરિમડ્ઢ': '#D500F9',
        'અવધ': '#FF3D00',
        'સૂર્યાસ્ત': '#FF1744'
    };

    return colorMap[timingName] || '#A9A9A9';
};

const AnimatedPath = Animated.createAnimatedComponent(Path);


const Chart = React.memo(({ data: sunTimes = {}, timingData = [], choghadiya = { day: [], night: [] }, activeIndex, selectedDate, choghadiyaActiveTab }) => {
    const isFocused = useIsFocused();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const iconAnim = useRef(new Animated.Value(0)).current;
    const animationRef = useRef(null);

    useEffect(() => {
        if (!isFocused) {
            fadeAnim.setValue(0);
            iconAnim.setValue(0);
            return;
        }

        fadeAnim.setValue(0);
        iconAnim.setValue(0);
        const animation = Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 4000,
                useNativeDriver: false,
                easing: Easing.inOut(Easing.cubic),
            }),
            Animated.timing(iconAnim, {
                toValue: 1,
                duration: 5500,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.cubic),
            }),
        ]);
        animationRef.current = animation;
        animation.start();

        return () => {
            animation.stop();
        };
    }, [choghadiya, isFocused]);

    if (!isFocused) return null;

    const toMinutes = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const rangeToMinutes = (range) => {
        const [start, end] = range.split('-').map(t => t.trim());
        const toMin = (t) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };
        return { start: toMin(start), end: toMin(end) };
    };


    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();


    const sunsetTime = timingData.find(item =>
        item.name === 'सूर्यास्त' || item.name === 'સૂર્યાસ્ત' || item.name === 'sunset'
    )?.time;


    const sunriseMinutes = (() => {
        const t = sunTimes?.sunrise;
        if (!t) return null;
        const [h, m] = String(t).split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return null;
        return h * 60 + m;
    })();

    const sunsetMinutes = (() => {
        const t = sunTimes?.sunset;
        if (!t) return null;
        const [h, m] = String(t).split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return null;
        return h * 60 + m;
    })();

    // Determine if it's currently daytime
    const isDaytime = sunriseMinutes != null && sunsetMinutes != null &&
        nowMinutes >= sunriseMinutes && nowMinutes < sunsetMinutes;

    // Select appropriate choghadiya list based on actual time
    const currentChoghadiyaList = isDaytime ? choghadiya.day : (choghadiya.night || []);

    // Find current choghadiya based on actual time
    const currentChoghadiya = (() => {
        const allChoghadiyas = [...(choghadiya.day || []), ...(choghadiya.night || [])];

        for (const item of allChoghadiyas) {
            const { start, end } = rangeToMinutes(item.time);

            if (start <= end) {
                if (nowMinutes >= start && nowMinutes < end) {
                    return item;
                }
            } else {
                // For ranges crossing midnight (e.g., 23:00-01:00)
                if (nowMinutes >= start || nowMinutes < end) {
                    return item;
                }
            }
        }
        return null;
    })();

    const sortedTimings = [...timingData].sort(
        (a, b) => toMinutes(a.time) - toMinutes(b.time)
    );

    const choghadiyaData = sortedTimings
        .map((item, index, arr) => {
            const start = toMinutes(item.time);

            let end;
            if (index < arr.length - 1) {
                end = toMinutes(arr[index + 1].time);
            } else {
                end = sunsetTime ? toMinutes(sunsetTime) : start;
            }

            const value = Math.max(end - start, 0);
            const isEdge = index === 0 || index === arr.length - 1;

            return {
                label: item.name,
                value,
                color: isEdge
                    ? hexToRgba(item.color, 0.6)
                    : hexToRgba(item.color, 0.8),
                time: item.time,
            };
        })
        .filter(item => item.value > 0);

    const total = choghadiyaData.reduce((s, i) => s + i.value, 0);

    const chartHeight = CHART_RADIUS * 1.2;
    const centerX = CHART_RADIUS;
    const centerY = CHART_RADIUS * 0.9;

    const outerRadius = CHART_RADIUS * 0.8;
    const innerRadius = CHART_RADIUS * 0.001;

    const midRadius = outerRadius / 2;
    const arcLength = Math.PI * midRadius;
    const maskStrokeWidth = outerRadius + 50;
    const maskPath = `M ${centerX - midRadius} ${centerY} A ${midRadius} ${midRadius} 0 0 1 ${centerX + midRadius} ${centerY}`;

    const strokeDashoffset = fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [arcLength, 0],
    });

    let startAngle = 180;

    const createHalfCircleSegment = (startAngle, endAngle, color, index) => {
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = centerX + innerRadius * Math.cos(startRad);
        const y1 = centerY - innerRadius * Math.sin(startRad);

        const x2 = centerX + innerRadius * Math.cos(endRad);
        const y2 = centerY - innerRadius * Math.sin(endRad);

        const x3 = centerX + outerRadius * Math.cos(endRad);
        const y3 = centerY - outerRadius * Math.sin(endRad);

        const x4 = centerX + outerRadius * Math.cos(startRad);
        const y4 = centerY - outerRadius * Math.sin(startRad);

        const path = `
      M ${x1} ${y1}
      A ${innerRadius} ${innerRadius} 0 0 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${outerRadius} ${outerRadius} 0 0 0 ${x4} ${y4}
      Z
    `;

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

    const segments = choghadiyaData.map((item, index) => {
        const angle = (item.value / total) * 180;
        const endAngle = startAngle - angle;

        const segment = createHalfCircleSegment(
            startAngle,
            endAngle,
            item.color,
            index
        );

        startAngle = endAngle;
        return segment;
    });

    const angleFromMinute = (min) => {
        if (sunriseMinutes == null || sunsetMinutes == null) return null;
        const span = Math.max(sunsetMinutes - sunriseMinutes, 1);
        const ratio = (min - sunriseMinutes) / span;
        const clamped = Math.max(0, Math.min(1, ratio));
        return 180 - clamped * 180;
    };

    const angleToPoint = (angleDeg, r) => {
        const rad = (angleDeg * Math.PI) / 180;
        const x = centerX + r * Math.cos(rad);
        const y = centerY - r * Math.sin(rad);
        return { x, y };
    };

    const borderSegments = [];
    const dayList = currentChoghadiyaList || [];
    if (dayList.length && sunriseMinutes != null && sunsetMinutes != null) {
        dayList.forEach((item, index) => {
            const { start, end } = rangeToMinutes(item.time);
            const s = Math.max(start, sunriseMinutes);
            const e = Math.min(end, sunsetMinutes);
            if (e <= s) return;
            const aStart = angleFromMinute(s);
            const aEnd = angleFromMinute(e);
            if (aStart == null || aEnd == null) return;
            const pStart = angleToPoint(aStart, outerRadius);
            const pEnd = angleToPoint(aEnd, outerRadius);
            const color = /amrut|amrit|अमृत|અમૃત|shubh|शुभ|શુભ|chal|चल|ચल|labh|लाभ|લાભ/i.test(item.name) ? '#FF8C00' : '#424242';
            borderSegments.push(
                <Path
                    key={`border-${index}`}
                    d={`M ${pStart.x} ${pStart.y} A ${outerRadius} ${outerRadius} 0 0 1 ${pEnd.x} ${pEnd.y}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={8}
                    strokeLinecap="square"
                />
            );
        });
    }

    const dottedRadius = outerRadius + 12;
    const isToday = selectedDate && moment(selectedDate).isSame(moment(), 'day');

    // Calculate position for the icon on dotted line
    let iconPos = null;
    let iconAngle = null;

    if (sunriseMinutes != null && sunsetMinutes != null) {
        if (isDaytime) {
            const nowAngle = angleFromMinute(nowMinutes);
            if (nowAngle != null) {
                iconAngle = nowAngle;
                iconPos = angleToPoint(nowAngle, dottedRadius);
            }
        } else {
            const timeSinceSunset = nowMinutes - sunsetMinutes;
            let nightDuration;
            if (nowMinutes < sunriseMinutes) {
                nightDuration = (1440 - sunsetMinutes) + sunriseMinutes;
            } else {
                nightDuration = 1440 - sunsetMinutes + sunriseMinutes;
            }

            if (nightDuration > 0) {
                const nightRatio = Math.min(timeSinceSunset / nightDuration, 1);
                const nightAngle = 180 - (nightRatio * 180);
                iconAngle = nightAngle;
                iconPos = angleToPoint(nightAngle, dottedRadius);
            }
        }
    }

    let rotateInputRange = [0, 1];
    let rotateOutputRange = ['0deg', '0deg'];

    if (iconAngle != null) {
        const finalRotation = 180 - iconAngle;
        const stopProgress = finalRotation / 180;

        if (stopProgress >= 0.99) {
            rotateInputRange = [0, 1];
            rotateOutputRange = ['0deg', `${finalRotation}deg`];
        } else if (stopProgress <= 0.01) {
            rotateInputRange = [0, 1];
            rotateOutputRange = ['0deg', '0deg'];
        } else {
            rotateInputRange = [0, stopProgress, 1];
            rotateOutputRange = ['0deg', `${finalRotation}deg`, `${finalRotation}deg`];
        }
    }

    const rotateAnim = iconAnim.interpolate({
        inputRange: rotateInputRange,
        outputRange: rotateOutputRange
    });

    return (
        <View style={[styles.chartContainer, { height: chartHeight }]}>
            <View style={{ width: CHART_SIZE, height: chartHeight, position: 'relative', alignSelf: 'center' }}>
                <Svg width={CHART_SIZE} height={chartHeight}>
                    <Path
                        d={`M ${centerX - outerRadius} ${centerY}
              A ${outerRadius} ${outerRadius} 0 0 1 ${centerX + outerRadius} ${centerY}
              L ${centerX + innerRadius} ${centerY}
              A ${innerRadius} ${innerRadius} 0 0 0 ${centerX - innerRadius} ${centerY}
              Z`}
                        fill="rgba(255,255,255,0.1)"
                    />

                    <Defs>
                        <Mask id="chartMask">
                            <AnimatedPath
                                d={maskPath}
                                stroke="white"
                                strokeWidth={maskStrokeWidth}
                                fill="none"
                                strokeDasharray={[arcLength, arcLength]}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="butt"
                            />
                        </Mask>
                    </Defs>

                    <G mask="url(#chartMask)">
                        {/* ONLY render filled segments during daytime */}
                        {isDaytime && segments}
                    </G>

                    {/* MOVED OUTSIDE MASK - Border segments and dotted line render ALWAYS */}
                    {borderSegments}

                    <Path
                        d={`M ${centerX - dottedRadius} ${centerY}
                    A ${dottedRadius} ${dottedRadius} 0 0 1 ${centerX + dottedRadius} ${centerY}`}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeOpacity={0.9}
                        strokeWidth={1}
                        strokeDasharray="3,4"
                        strokeLinecap="square"
                    />
                </Svg>

                {iconPos && isToday && (
                    <Animated.View style={{
                        position: 'absolute',
                        left: centerX - 10,
                        top: centerY - 10,
                        width: 20,
                        height: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        transform: [
                            { rotate: rotateAnim },
                            { translateX: -dottedRadius }
                        ]
                    }}>
                        <Icon
                            name={isDaytime ? "sunny" : "moon"}
                            size={20}
                            color={isDaytime ? "#fff" : "#fff"}
                        />
                    </Animated.View>
                )}
            </View>

            <View style={styles.sunMoonContainer}>
                {/* LEFT SIDE: Sunset/Moon */}
                {isDaytime ?
                    <View style={styles.timeContainer}>
                        <Icon name="sunny" size={20} color="#ffffffff" />
                        <Text style={styles.timeLabel}>{i18n.t('time.sunrise')}</Text>
                        <Text style={styles.timeText}>
                            {formatTime(sunTimes?.sunrise, i18n.locale)}
                        </Text>
                    </View> :
                    <View style={styles.timeContainer}>
                        <Icon name="moon" size={20} color="#ffffffff" />
                        <Text style={styles.timeLabel}>{i18n.t('time.sunset')}</Text>
                        <Text style={styles.timeText}>
                            {formatTime(sunTimes?.sunset, i18n.locale)}
                        </Text>
                    </View>}


                {isToday && currentChoghadiya && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <View
                            style={[
                                styles.timingDot,
                                {
                                    backgroundColor: /amrut|amrit|अमृत|અમૃત|shubh|शुभ|શુભ|chal|चल|ચલ|labh|लाभ|લાભ/i.test(currentChoghadiya?.name || '')
                                        ? '#FF8C00'
                                        : '#424242',
                                },
                            ]}
                        />

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold', opacity: 0.8 }}>{currentChoghadiya?.name}</Text>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold', opacity: 0.8 }}>
                                {formatTime(currentChoghadiya?.time, i18n.locale)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* RIGHT SIDE: Sunrise/Sun */}
                {!isDaytime ?
                    <View style={styles.timeContainer}>
                        <Icon name="sunny" size={20} color="#ffffffff" />
                        <Text style={styles.timeLabel}>{i18n.t('time.sunrise')}</Text>
                        <Text style={styles.timeText}>
                            {formatTime(sunTimes?.sunrise, i18n.locale)}
                        </Text>
                    </View> :
                    <View style={styles.timeContainer}>
                        <Icon name="moon" size={20} color="#ffffffff" />
                        <Text style={styles.timeLabel}>{i18n.t('time.sunset')}</Text>
                        <Text style={styles.timeText}>
                            {formatTime(sunTimes?.sunset, i18n.locale)}
                        </Text>
                    </View>}
            </View>
        </View>
    );
});



//Night hard coded

// const Chart = React.memo(({ data: sunTimes = {}, timingData = [], choghadiya = { day: [], night: [] }, activeIndex, selectedDate, choghadiyaActiveTab }) => {
//     const isFocused = useIsFocused();
//     const fadeAnim = useRef(new Animated.Value(0)).current;
//     const iconAnim = useRef(new Animated.Value(0)).current;
//     const animationRef = useRef(null);

//     useEffect(() => {
//         if (!isFocused) {
//             fadeAnim.setValue(0);
//             iconAnim.setValue(0);
//             return;
//         }

//         fadeAnim.setValue(0);
//         iconAnim.setValue(0);
//         const animation = Animated.parallel([
//             Animated.timing(fadeAnim, {
//                 toValue: 1,
//                 duration: 4000,
//                 useNativeDriver: false,
//                 easing: Easing.inOut(Easing.cubic),
//             }),
//             Animated.timing(iconAnim, {
//                 toValue: 1,
//                 duration: 5500,
//                 useNativeDriver: true,
//                 easing: Easing.inOut(Easing.cubic),
//             }),
//         ]);
//         animationRef.current = animation;
//         animation.start();

//         return () => {
//             animation.stop();
//         };
//     }, [choghadiya, isFocused]);

//     if (!isFocused) return null;

//     const toMinutes = (time) => {
//         const [h, m] = time.split(':').map(Number);
//         return h * 60 + m;
//     };

//     const hexToRgba = (hex, alpha) => {
//         const r = parseInt(hex.slice(1, 3), 16);
//         const g = parseInt(hex.slice(3, 5), 16);
//         const b = parseInt(hex.slice(5, 7), 16);
//         return `rgba(${r}, ${g}, ${b}, ${alpha})`;
//     };

//     const rangeToMinutes = (range) => {
//         const [start, end] = range.split('-').map(t => t.trim());
//         const toMin = (t) => {
//             const [h, m] = t.split(':').map(Number);
//             return h * 60 + m;
//         };
//         return { start: toMin(start), end: toMin(end) };
//     };

//     // Get sunset time
//     const sunsetTime =
//         timingData.find(item => item.name === 'सूर्यास्त' || item.name === 'સૂર્યાસ્ત' || item.name === 'sunset')?.time;

//     // HARDCODED FOR NIGHT TESTING - Override time-based logic
//     // const now = new Date();
//     // const nowMinutes = now.getHours() * 60 + now.getMinutes();
//     const nowMinutes = 22 * 60; // Hardcoded to 10 PM for testing
//     const sunsetTimeTest = "18:30"; // Hardcoded sunset time
//     const sunriseTimeTest = "06:30"; // Hardcoded sunrise time
//     const sunsetMinutes = toMinutes(sunsetTimeTest);

//     // Force nighttime rendering
//     const isDaytime = false; // HARDCODED: Set to false for night testing

//     // Use hardcoded times for testing
//     const sunTimesTest = {
//         sunrise: sunriseTimeTest,
//         sunset: sunsetTimeTest
//     };
//     const sunTimesToUse = sunTimesTest; // Use test times instead of props

//     // Use night choghadiya data for testing
//     const currentChoghadiyaList = isDaytime ? choghadiya.day : (choghadiya.night || []);

//     // FIX: Find current choghadiya based on ACTUAL TIME, not activeIndex or tabs
//     const currentChoghadiya = (() => {
//         // Check all choghadiyas from both day and night to find the one active right now
//         const allChoghadiyas = [...(choghadiya.day || []), ...(choghadiya.night || [])];

//         for (const item of allChoghadiyas) {
//             const { start, end } = rangeToMinutes(item.time);

//             // Check if current time falls within this choghadiya's time range
//             // Handle both normal ranges and ranges that cross midnight
//             if (start <= end) {
//                 if (nowMinutes >= start && nowMinutes < end) {
//                     return item;
//                 }
//             } else {
//                 // For ranges crossing midnight (e.g., 23:00-01:00)
//                 if (nowMinutes >= start || nowMinutes < end) {
//                     return item;
//                 }
//             }
//         }
//         return null;
//     })();

//     const sortedTimings = [...timingData].sort(
//         (a, b) => toMinutes(a.time) - toMinutes(b.time)
//     );

//     const choghadiyaData = sortedTimings
//         .map((item, index, arr) => {
//             const start = toMinutes(item.time);

//             let end;
//             if (index < arr.length - 1) {
//                 end = toMinutes(arr[index + 1].time);
//             } else {
//                 end = sunsetTimeTest ? toMinutes(sunsetTimeTest) : start;
//             }

//             const value = Math.max(end - start, 0);
//             const isEdge = index === 0 || index === arr.length - 1;

//             return {
//                 label: item.name,
//                 value,
//                 color: isEdge
//                     ? hexToRgba(item.color, 0.6)
//                     : hexToRgba(item.color, 0.8),
//                 time: item.time,
//             };
//         })
//         .filter(item => item.value > 0);

//     const total = choghadiyaData.reduce((s, i) => s + i.value, 0);

//     const chartHeight = CHART_RADIUS * 1.2;
//     const centerX = CHART_RADIUS;
//     const centerY = CHART_RADIUS * 0.9;

//     const outerRadius = CHART_RADIUS * 0.8;
//     const innerRadius = CHART_RADIUS * 0.001;

//     const midRadius = outerRadius / 2;
//     const arcLength = Math.PI * midRadius;
//     const maskStrokeWidth = outerRadius + 50;
//     const maskPath = `M ${centerX - midRadius} ${centerY} A ${midRadius} ${midRadius} 0 0 1 ${centerX + midRadius} ${centerY}`;

//     const strokeDashoffset = fadeAnim.interpolate({
//         inputRange: [0, 1],
//         outputRange: [arcLength, 0],
//     });

//     let startAngle = 180;

//     const createHalfCircleSegment = (startAngle, endAngle, color, index) => {
//         const startRad = (startAngle * Math.PI) / 180;
//         const endRad = (endAngle * Math.PI) / 180;

//         const x1 = centerX + innerRadius * Math.cos(startRad);
//         const y1 = centerY - innerRadius * Math.sin(startRad);

//         const x2 = centerX + innerRadius * Math.cos(endRad);
//         const y2 = centerY - innerRadius * Math.sin(endRad);

//         const x3 = centerX + outerRadius * Math.cos(endRad);
//         const y3 = centerY - outerRadius * Math.sin(endRad);

//         const x4 = centerX + outerRadius * Math.cos(startRad);
//         const y4 = centerY - outerRadius * Math.sin(startRad);

//         const path = `
//       M ${x1} ${y1}
//       A ${innerRadius} ${innerRadius} 0 0 1 ${x2} ${y2}
//       L ${x3} ${y3}
//       A ${outerRadius} ${outerRadius} 0 0 0 ${x4} ${y4}
//       Z
//     `;

//         return (
//             <Path
//                 key={`segment-${index}`}
//                 d={path}
//                 fill={color}
//                 stroke="white"
//                 strokeWidth={0.5}
//             />
//         );
//     };

//     const segments = choghadiyaData.map((item, index) => {
//         const angle = (item.value / total) * 180;
//         const endAngle = startAngle - angle;

//         const segment = createHalfCircleSegment(
//             startAngle,
//             endAngle,
//             item.color,
//             index
//         );

//         startAngle = endAngle;
//         return segment;
//     });

//     const daylightStartMin = (() => {
//         const t = sunTimesToUse?.sunrise; // Use test time
//         if (!t) return null;
//         const [h, m] = String(t).split(':').map(Number);
//         if (isNaN(h) || isNaN(m)) return null;
//         return h * 60 + m;
//     })();
//     const daylightEndMin = (() => {
//         const t = sunTimesToUse?.sunset; // Use test time
//         if (!t) return null;
//         const [h, m] = String(t).split(':').map(Number);
//         if (isNaN(h) || isNaN(m)) return null;
//         return h * 60 + m;
//     })();

//     const angleFromMinute = (min) => {
//         if (daylightStartMin == null || daylightEndMin == null) return null;
//         const span = Math.max(daylightEndMin - daylightStartMin, 1);
//         const ratio = (min - daylightStartMin) / span;
//         const clamped = Math.max(0, Math.min(1, ratio));
//         return 180 - clamped * 180;
//     };

//     const angleToPoint = (angleDeg, r) => {
//         const rad = (angleDeg * Math.PI) / 180;
//         const x = centerX + r * Math.cos(rad);
//         const y = centerY - r * Math.sin(rad);
//         return { x, y };
//     };

//     const borderSegments = [];
//     // Use the dynamically selected choghadiya list based on time (not tabs)
//     const dayList = currentChoghadiyaList || [];
//     if (dayList.length && daylightStartMin != null && daylightEndMin != null) {
//         dayList.forEach((item, index) => {
//             const { start, end } = rangeToMinutes(item.time);
//             const s = Math.max(start, daylightStartMin);
//             const e = Math.min(end, daylightEndMin);
//             if (e <= s) return;
//             const aStart = angleFromMinute(s);
//             const aEnd = angleFromMinute(e);
//             if (aStart == null || aEnd == null) return;
//             const pStart = angleToPoint(aStart, outerRadius);
//             const pEnd = angleToPoint(aEnd, outerRadius);
//             const color = /amrut|amrit|अमृत|અમૃત|shubh|शुभ|શુભ|chal|चल|ચલ|labh|लाभ|લાભ/i.test(item.name) ? '#FF8C00' : '#424242';
//             borderSegments.push(
//                 <Path
//                     key={`border-${index}`}
//                     d={`M ${pStart.x} ${pStart.y} A ${outerRadius} ${outerRadius} 0 0 1 ${pEnd.x} ${pEnd.y}`}
//                     fill="none"
//                     stroke={color}
//                     strokeWidth={8}
//                     strokeLinecap="square"
//                 />
//             );
//         });
//     }

//     const dottedRadius = outerRadius + 12;
//     const isToday = selectedDate && moment(selectedDate).isSame(moment(), 'day');

//     // Calculate position for the icon on dotted line
//     let iconPos = null;
//     let iconAngle = null;

//     if (daylightStartMin != null && daylightEndMin != null) {
//         if (isDaytime) {
//             const nowAngle = angleFromMinute(nowMinutes);
//             if (nowAngle != null) {
//                 iconAngle = nowAngle;
//                 iconPos = angleToPoint(nowAngle, dottedRadius);
//             }
//         } else {
//             const timeSinceSunset = nowMinutes - daylightEndMin;
//             let nightDuration;
//             if (nowMinutes < daylightStartMin) {
//                 nightDuration = (1440 - daylightEndMin) + daylightStartMin;
//             } else {
//                 nightDuration = 1440 - daylightEndMin + daylightStartMin;
//             }

//             if (nightDuration > 0) {
//                 const nightRatio = Math.min(timeSinceSunset / nightDuration, 1);
//                 const nightAngle = 180 - (nightRatio * 180);
//                 iconAngle = nightAngle;
//                 iconPos = angleToPoint(nightAngle, dottedRadius);
//             }
//         }
//     }

//     let rotateInputRange = [0, 1];
//     let rotateOutputRange = ['0deg', '0deg'];

//     if (iconAngle != null) {
//         const finalRotation = 180 - iconAngle;
//         const stopProgress = finalRotation / 180;

//         if (stopProgress >= 0.99) {
//             rotateInputRange = [0, 1];
//             rotateOutputRange = ['0deg', `${finalRotation}deg`];
//         } else if (stopProgress <= 0.01) {
//             rotateInputRange = [0, 1];
//             rotateOutputRange = ['0deg', '0deg'];
//         } else {
//             rotateInputRange = [0, stopProgress, 1];
//             rotateOutputRange = ['0deg', `${finalRotation}deg`, `${finalRotation}deg`];
//         }
//     }

//     const rotateAnim = iconAnim.interpolate({
//         inputRange: rotateInputRange,
//         outputRange: rotateOutputRange
//     });

//     return (
//         <View style={[styles.chartContainer, { height: chartHeight }]}>
//             <View style={{ width: CHART_SIZE, height: chartHeight, position: 'relative', alignSelf: 'center' }}>
//                 <Svg width={CHART_SIZE} height={chartHeight}>
//                     <Path
//                         d={`M ${centerX - outerRadius} ${centerY}
//               A ${outerRadius} ${outerRadius} 0 0 1 ${centerX + outerRadius} ${centerY}
//               L ${centerX + innerRadius} ${centerY}
//               A ${innerRadius} ${innerRadius} 0 0 0 ${centerX - innerRadius} ${centerY}
//               Z`}
//                         fill="rgba(255,255,255,0.1)"
//                     />

//                     <Defs>
//                         <Mask id="chartMask">
//                             <AnimatedPath
//                                 d={maskPath}
//                                 stroke="white"
//                                 strokeWidth={maskStrokeWidth}
//                                 fill="none"
//                                 strokeDasharray={[arcLength, arcLength]}
//                                 strokeDashoffset={strokeDashoffset}
//                                 strokeLinecap="butt"
//                             />
//                         </Mask>
//                     </Defs>

//                     <G mask="url(#chartMask)">
//                         {/* ONLY render filled segments during daytime */}
//                         {isDaytime && segments}

//                         {/* Always render border segments and dotted line */}
//                         {borderSegments}

//                         <Path
//                             d={`M ${centerX - dottedRadius} ${centerY}
//                         A ${dottedRadius} ${dottedRadius} 0 0 1 ${centerX + dottedRadius} ${centerY}`}
//                             fill="none"
//                             stroke="#FFFFFF"
//                             strokeOpacity={0.9}
//                             strokeWidth={1}
//                             strokeDasharray="3,4"
//                             strokeLinecap="square"
//                         />
//                     </G>
//                 </Svg>

//                 {iconPos && isToday && (
//                     <Animated.View style={{
//                         position: 'absolute',
//                         left: centerX - 10,
//                         top: centerY - 10,
//                         width: 20,
//                         height: 20,
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         transform: [
//                             { rotate: rotateAnim },
//                             { translateX: -dottedRadius }
//                         ]
//                     }}>
//                         <Icon
//                             name={isDaytime ? "sunny" : "moon"}
//                             size={20}
//                             color={isDaytime ? "#fff" : "#fff"}
//                         />
//                     </Animated.View>
//                 )}
//             </View>

//             <View style={styles.sunMoonContainer}>
//                 {/* LEFT SIDE: Sunset/Moon */}
//                 {isDaytime ?
//                     <View style={styles.timeContainer}>
//                         <Icon name="sunny" size={20} color="#ffffffff" />
//                         <Text style={styles.timeLabel}>{i18n.t('time.sunrise')}</Text>
//                         <Text style={styles.timeText}>
//                             {formatTime(sunTimesToUse?.sunrise, i18n.locale)}
//                         </Text>
//                     </View> :
//                     <View style={styles.timeContainer}>
//                         <Icon name="moon" size={20} color="#ffffffff" />
//                         <Text style={styles.timeLabel}>{i18n.t('time.sunset')}</Text>
//                         <Text style={styles.timeText}>
//                             {formatTime(sunTimesToUse?.sunset, i18n.locale)}
//                         </Text>
//                     </View>}

//                 {/* CENTER: Current Choghadiya - NOW ALWAYS SHOWS CURRENT TIME-BASED CHOGHADIYA */}
//                 {isToday && currentChoghadiya && (
//                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
//                         <View
//                             style={[
//                                 styles.timingDot,
//                                 {
//                                     backgroundColor: /amrut|amrit|अमृत|અમૃત|shubh|शुभ|શુભ|chal|चल|ચલ|labh|लाभ|લાભ/i.test(currentChoghadiya?.name || '')
//                                         ? '#FF8C00'
//                                         : '#424242',
//                                 },
//                             ]}
//                         />

//                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
//                             <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold', opacity: 0.8 }}>{currentChoghadiya?.name}</Text>
//                             <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold', opacity: 0.8 }}>
//                                 {formatTime(currentChoghadiya?.time, i18n.locale)}
//                             </Text>
//                         </View>
//                     </View>
//                 )}

//                 {/* RIGHT SIDE: Sunrise/Sun */}
//                 {!isDaytime ?
//                     <View style={styles.timeContainer}>
//                         <Icon name="sunny" size={20} color="#ffffffff" />
//                         <Text style={styles.timeLabel}>{i18n.t('time.sunrise')}</Text>
//                         <Text style={styles.timeText}>
//                             {formatTime(sunTimesToUse?.sunrise, i18n.locale)}
//                         </Text>
//                     </View> :
//                     <View style={styles.timeContainer}>
//                         <Icon name="moon" size={20} color="#ffffffff" />
//                         <Text style={styles.timeLabel}>{i18n.t('time.sunset')}</Text>
//                         <Text style={styles.timeText}>
//                             {formatTime(sunTimesToUse?.sunset, i18n.locale)}
//                         </Text>
//                     </View>}
//             </View>
//         </View>
//     );
// });


const Home = ({ route, navigation }) => {
    const isFocused = useIsFocused();
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState(i18n.locale);
    const [activeTab, setActiveTab] = useState('pachakkhan');
    const [cities, setCities] = useState([]);
    const [choghadiyaActiveTab, setChoghadiyaActiveTab] = useState('sun');
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);
    const [citySearch, setCitySearch] = useState('');
    const [selectedCity, setSelectedCity] = useState(null);
    const [currentLanguage, setCurrentLanguage] = useState('gu');
    const [timingData, setTimingData] = useState([]);
    const [globalData, setGlobalData] = useState({});
    const [dashboardData, setDashboardData] = useState({});
    const [choghadiyaData, setChoghadiyaData] = useState({ day: [], night: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [jainDateInfo, setJainDateInfo] = useState('');
    const { city } = route.params || {};
    const [sunTimes, setSunTimes] = useState({
        sunrise: '--:-- --',
        sunset: '--:-- --'
    });
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

    const isToday = selectedDate && moment(selectedDate).isSame(moment(), 'day');

    const [kalyanakList, setKalyanakList] = useState([]); 
    const [kalyanakIndex, setKalyanakIndex] = useState(0); 
    const current = kalyanakList[kalyanakIndex] || {};

    const godName = i18n.locale === 'gu' ? current.gu_god_name
        : i18n.locale === 'hi' ? current.hi_god_name
            : current.en_god_name;

    const kalyanakName = i18n.locale === 'gu' ? current.gu_kalyanak_name
        : i18n.locale === 'hi' ? current.hi_kalyanak_name
            : current.en_kalyanak_name;

    const goPrev = () =>
        setKalyanakIndex(i => (i - 1 + kalyanakList.length) % kalyanakList.length);

    const goNext = () =>
        setKalyanakIndex(i => (i + 1) % kalyanakList.length);

    useEffect(() => {
        const loadData = async () => {
            let lang = i18n.locale;
            setLanguage(lang);
            await getGlobalData(selectedDate);
        };
        loadData();
    }, [selectedDate]);

    const getGlobalData = async (date) => {
        try {
            setLoading(true);
            const selectedCityStr = await AsyncStorage.getItem('selectedCity');
            const selectedCity = selectedCityStr ? JSON.parse(selectedCityStr) : {
                lat: '22.2726554',
                long: '73.1969701',
                country_code: 'IN'
            };

            const day = date.getDate();
            const year = date.getFullYear().toString();
            const month = String(date.getMonth() + 1).padStart(2, '0');

            const response = await getFrontDashboardData(
                day,
                year,
                month,
                selectedCity.lat,
                selectedCity.long,
                selectedCity.country_code,
            );

            if (response && response.data) {
                await setGlobalData(response.data);
                await getDashboardDataWithTiming(selectedDate);
            }
        } catch (error) {
            console.error('Error loading month data:', error);
        } finally {
            setLoading(false);
        }
    };

    const convertChoghadiya = (data = []) => {
        const colors = [
            'rgba(100, 200, 255, 0.6)',
            'rgba(100, 255, 100, 0.6)',
            'rgba(255, 100, 0, 0.6)',
            'rgba(255, 230, 0, 0.6)',
            'rgba(255, 190, 0, 0.6)',
            'rgba(200, 150, 255, 0.6)'
        ];
        return data.reduce(
            (acc, item) => {
                const key = item.type.toLowerCase();
                const nameKey = item.name_english.toLowerCase();

                acc[key].push({
                    id: item.seq,
                    name: i18n.locale === 'gu' ? item.name_gujarati : i18n.locale === 'hi' ? item.name_hindi : item.name_english,
                    time: item.choghadiya_time,
                    color: colors[nameKey] || 'rgba(0,0,0,0.3)',
                });

                return acc;
            },
            { day: [], night: [] }
        );
    };

    const getChoghadiyaDotColor = name => /amrut|amrit|अमृत|અમૃત|shubh|शुभ|શુભ|chal|चल|ચલ|labh|लाभ|લાભ/i.test(name || '') ? '#FF8C00' : '#424242';

    const processTimingData = (timingData, lang) => {
        const langKey = lang === 'en' ? 'english' : lang === 'gu' ? 'gujarati' : 'hindi';
        return Object.entries(timingData[langKey] || timingData.english)
            .map(([name, time], index) => ({
                id: `timing-${index}`,
                name,
                time,
                color: getTimingColor(name)
            }));
    };

    const getDashboardDataWithTiming = async (date) => {
        try {
            setLoading(true);

          
            const selectedCityStr = await AsyncStorage.getItem('selectedCity');
            const selectedCity = selectedCityStr
                ? JSON.parse(selectedCityStr)
                : {
                    lat: '22.2726554',
                    long: '73.1969701',
                    country_code: 'IN',
                };


            const day = date.getDate();
            const year = date.getFullYear().toString();
            const month = String(date.getMonth() + 1).padStart(2, '0');

          
            const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
            const payload = {
                week_name: weekday,
                type: 'Day',
                latitude: selectedCity.lat.toString(),
                longitude: selectedCity.long.toString(),
                country_code: selectedCity.country_code,
                day: day.toString(),
                month,
                year,
            };

            /* ----  log what we are about to send  ---- */
            console.log('API payload ➜', JSON.stringify(payload, null, 2));

            /* ----------  API call ---------- */
            const response = await getDashboardData(
                payload.week_name,
                payload.day,
                payload.year,
                payload.month,
                payload.latitude,
                payload.longitude,
                payload.country_code,
            );


            if (response?.data) {

                const choghadiya = response.data ? convertChoghadiya(response.data) : { day: [], night: [] };
                setChoghadiyaData(choghadiya);

                console.log('Fresh choghadiyaData set ➜', choghadiya);


                if (response?.timedata?.data) {
                    const timingArray = processTimingData(response.timedata.data, i18n.locale);
                    const activeIndex = getCurrentTimingIndex(timingArray);
                    const finalTimingData = timingArray.map((item, idx) => ({
                        ...item,
                        isActive: idx === activeIndex,
                    }));
                    setTimingData(finalTimingData);

               
                    const englishTimings = response.timedata.data.english || {};
                    setSunTimes({
                        sunrise: englishTimings.Sunrise || '--:--',
                        sunset: englishTimings.Sunset || '--:--',
                    });
                } else {
                    setTimingData([]);
                    setSunTimes({ sunrise: '--:--', sunset: '--:--' });
                }

               
                if (Array.isArray(response?.day_kalyanak_god) && response.day_kalyanak_god.length) {
                    setKalyanakList(response.day_kalyanak_god);
                    setKalyanakIndex(0); 
                }

                
                setDashboardData(response.data || {});
            } else {
                
                setChoghadiyaData({ day: [], night: [] });
                setTimingData([]);
                setSunTimes({ sunrise: '--:--', sunset: '--:--' });
                setGodName('');
                setKalyanakName('');
                setDashboardData({});
            }
        } catch (error) {
            console.error('Error in getDashboardDataWithTiming:', error);
          
            setChoghadiyaData({ day: [], night: [] });
            setTimingData([]);
            setSunTimes({ sunrise: '--:--', sunset: '--:--' });
            setGodName('');
            setKalyanakName('');
        } finally {
            setLoading(false);
        }
    };

    const startX = -(IMAGE_WIDTH - width) / 2;
    const startY = -(IMAGE_HEIGHT - height) / 2;
    const endX = 0;
    const endY = 0;

    const translate = useRef(
        new Animated.ValueXY({ x: startX, y: startY })
    ).current;

    useEffect(() => {
        if (!isFocused) return;

        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(translate, {
                    toValue: { x: endX, y: endY },
                    duration: 16000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(translate, {
                    toValue: { x: startX, y: startY },
                    duration: 16000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();

        return () => {
            animation.stop();
        };
    }, [isFocused]);


    useEffect(() => {
        const loadSelectedCity = async () => {
            try {
                const cityData = await AsyncStorage.getItem('selectedCity');
                if (cityData) {
                    const parsedCity = JSON.parse(cityData);
                    setSelectedCity(parsedCity);
                    await getGlobalData(selectedDate);
                }
            } catch (error) {
                console.error('Error loading selected city:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSelectedCity();
        const unsubscribe = navigation.addListener('focus', () => {
            loadSelectedCity();
        });

        return unsubscribe;
    }, [navigation]);

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

    useEffect(() => {
        if (route.params?.selectedDate) {
            const newDate = new Date(route.params.selectedDate);
            setSelectedDate(newDate);
        }
    }, [route.params?.selectedDate]);

    useEffect(() => {
        const loadCities = async () => {
            try {
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
            await AsyncStorage.setItem('userLanguage', language);
            i18n.locale = language;
            setCurrentLanguage(language);
            moment.locale(language);
            await getGlobalData(selectedDate);
            setShowLanguageModal(false);
        } catch (error) {
            console.error('Error saving language:', error);
        }
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: 'Jain Panchang - Vitraag http://play.google.com/store/apps/details?id=gnhub.vitraag          ',
            });
        } catch (e) {
            // ignore
        }
    };

    const timeToMinutes = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const parseTimeRange = (range) => {
        const [start, end] = range.split('-').map(t => t.trim());
        return {
            start: timeToMinutes(start),
            end: timeToMinutes(end),
        };
    };

    const getCurrentTimingIndex = (timingArray) => {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        for (let i = 0; i < timingArray.length; i++) {
            const currentTime = timeToMinutes(timingArray[i].time);
            const nextTime = timingArray[i + 1]
                ? timeToMinutes(timingArray[i + 1].time)
                : 24 * 60;

            if (nowMinutes >= currentTime && nowMinutes < nextTime) {
                return i;
            }
        }
        return -1;
    };

    const getActiveChoghadiyaIndex = (data = []) => {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        for (let i = 0; i < data.length; i++) {
            const { start, end } = parseTimeRange(data[i].time);

            if (nowMinutes >= start && nowMinutes < end) {
                return i;
            }
        }
        return -1;
    };

    const activeIndex =
        choghadiyaActiveTab === 'sun'
            ? getActiveChoghadiyaIndex(choghadiyaData.day)
            : getActiveChoghadiyaIndex(choghadiyaData.night);

    const handlePachhakkhanPress = async (item) => {
        const events = await getFrontPanchakhan();
        const matchedObjectFromEvent = events.data.find((event) => {
            if (item?.name == "Navkarshi" || item?.name == "नवकारशी" || item?.name == "નવકારશી") {
                return event.id == "NxOpZowo9GmjKqdR";
            } else if (item?.name == "Porisi" || item?.name == "पोरिसी" || item?.name == "પોરિસિં") {
                return event.id == "XbPW7awNkzl83LD6";
            } else if (item?.name == "Saddha Porisi" || item?.name == "साड्ढ-पोरिसिं" || item?.name == "સાડ્ઢપોરિસિં") {
                return event.id == "XbPW7awNkzl83LD6";
            } else if (item?.name == "Purimaddha" || item?.name == "पुरिमड्ढ" || item?.name == "પુરિમડ્ઢ") {
                return event.id == "aYOxlpzRMwrX3gD7";
            } else if (item?.name == "Avaddha" || item?.name == "अवड्ढ" || item?.name == "અવધ") {
                return event.id == "aYOxlpzRMwrX3gD7";
            } else if (item?.name == "Chovihar" || item?.name == "चौविहार" || item?.name == "ચોવિહાર") {
                return event.id == "aYOxlpzRMwrX3gD7";
            }
            else {
                return null
            }
        });

        if (!matchedObjectFromEvent) return;

        const title =
            i18n.locale === "en"
                ? matchedObjectFromEvent.name_english
                : i18n.locale === "gu"
                    ? matchedObjectFromEvent.name_gujarati
                    : matchedObjectFromEvent.name_hindi;

        navigation.navigate("PachhakkhanDetail", {
            pachhakkhanId: matchedObjectFromEvent.id,
            title,
            content: {
                gujarati: matchedObjectFromEvent.pachakhan_details.details_gujarati,
                hindi: matchedObjectFromEvent.pachakhan_details.details_hindi,
                english: matchedObjectFromEvent.pachakhan_details.details_english,
                detail: matchedObjectFromEvent.pachakhan_details.details_detail,
                audio: matchedObjectFromEvent.pachakhan_details.pachakhan_audio,
            },
        });
    };

    const [themeSettings, setThemeSettings] = useState(null);

    useEffect(() => {
        const fetchTheme = async () => {
            const res = await getThemeSettings();
            setThemeSettings(res?.data || null);
        };
        fetchTheme();
    }, []);

    const menuItems = [
        {
            id: '1',
            title: i18n.t('menu.jainCalendar'),
            subtitle: i18n.t('menu.veerSamvat'),
            onPress: () => navigation.navigate('JainCalendar')
        },
        { id: '2', title: i18n.t('menu.tithisInMonth'), onPress: () => navigation.navigate('tithisInMonth') },
        { id: '3', title: i18n.t('menu.pachakkhan'), onPress: () => navigation.navigate('Pachhakkhan') },
        { id: '4', title: i18n.t('menu.tapAaradhana'), onPress: () => navigation.navigate('TapAaradhana') },
        { id: '5', title: i18n.t('menu.kalyanak'), onPress: () => navigation.navigate('Kalyanak') },
        { id: '6', title: i18n.t('menu.tirthankars'), onPress: () => navigation.navigate('Tirthankars') },
        {
            id: '7', title: i18n.t('menu.ourWebsite'), onPress: () => {
                const url = themeSettings?.our_website;
                if (url) {
                    Linking.openURL(url);
                } else {
                    Alert.alert('No Site', 'Website link is not available.');
                }
            }
        },
    ];

    return (
        <ImageBackground
            source={require('../../assets/home_background.jpeg')}
            style={styles.backgroundImage}
            resizeMode="center"
        >
            {isFocused && (
                <Animated.Image
                    source={require('../../assets/home_background.jpeg')}
                    resizeMode="cover"
                    style={[
                        styles.repeatBg,
                        {
                            transform: translate.getTranslateTransform(),
                        },
                    ]}
                />
            )}

            <View style={styles.overlay}>
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" backgroundColor="#9E1B17" />
                    {loading ?
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#fff" />
                        </View>
                        :
                        <>
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

                                    </View>
                                </View>
                            </View>

                            <View style={styles.scrollContainer}>
                                <TouchableOpacity style={styles.bellIcon} onPress={() => navigation.navigate('Notification')}>
                                    <Icon name="notifications" size={24} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setShowLanguageModal(true)}
                                    activeOpacity={0.7}
                                    style={styles.languageIcon}
                                >
                                    <Icon name="language" size={24} color="white" />
                                </TouchableOpacity>
                                <ScrollView
                                    style={styles.scrollView}
                                    contentContainerStyle={[styles.content, styles.scrollContent]}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <Chart
                                        data={sunTimes}
                                        timingData={timingData}
                                        choghadiya={choghadiyaData}
                                        activeIndex={activeIndex}
                                        choghadiyaActiveTab={choghadiyaActiveTab}
                                        selectedDate={selectedDate}
                                    />

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

                                    {kalyanakList.length ? (
                                        <View style={styles.godContainer}>
                                            <TouchableOpacity onPress={goPrev} style={styles.arrowButton}>
    <Icon name="chevron-back" size={24} color="#fff" />
</TouchableOpacity>

                                            <Text style={styles.godName}>
                                                {godName}{kalyanakName ? ` - ${kalyanakName} ${i18n.t('menu.kalyanak')}` : ''}
                                            </Text>

                                            <TouchableOpacity onPress={goNext} style={styles.arrowButton}>
    <Icon name="chevron-forward" size={24} color="#fff" />
</TouchableOpacity>
                                        </View>
                                    ) : null}

                                    {activeTab === 'pachakkhan' ? (
                                        <>
                                            <View style={styles.timingsContainer}>
                                                <View style={styles.column}>
                                                    {timingData.slice(1, 4).map((item) => (
                                                        <TouchableOpacity key={item.id} style={styles.timingItem}
                                                            onPress={() => {
                                                                handlePachhakkhanPress(item)
                                                            }}
                                                        >
                                                            <View style={[
                                                                styles.timingDot,
                                                                {
                                                                    backgroundColor: item.color
                                                                }
                                                            ]} >
                                                                {item.isActive && isToday && <View style={styles.innerWhiteDot} />}
                                                            </View>
                                                            <View style={styles.timingTextContainer}>
                                                                <Text style={styles.timingName}>{item.name}:</Text>
                                                                <Text style={styles.timingTime}>
                                                                    {formatTime(item.time, i18n.locale)}
                                                                </Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                                <View style={styles.column}>
                                                    {timingData.slice(4, 7).map((item) => (
                                                        <TouchableOpacity key={item.id} style={styles.timingItem}
                                                            onPress={() => {
                                                                handlePachhakkhanPress(item)
                                                            }}
                                                        >
                                                            <View style={[
                                                                styles.timingDot,
                                                                {
                                                                    backgroundColor: item.color
                                                                }
                                                            ]} >
                                                                {item.isActive && isToday && <View style={styles.innerWhiteDot} />}
                                                            </View>
                                                            <View style={styles.timingTextContainer}>
                                                                <Text style={styles.timingName}>{item.name}:</Text>
                                                                <Text style={styles.timingTime}>
                                                                    {formatTime(item.time, i18n.locale)}
                                                                </Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        </>
                                    ) : (
                                        <View style={styles.choghadiyaContainer}>
                                            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: "center", width: "15%" }} onPress={() => setChoghadiyaActiveTab('sun')}>
                                                <Icon name={choghadiyaActiveTab == 'sun' ? "sunny" : "sunny-outline"} size={20} color="#ffffffff" />
                                                {choghadiyaActiveTab == 'sun' && <Fontisto name="caret-right" size={20} color="#fff" />}
                                            </TouchableOpacity>
                                            <View style={{ alignItems: "center", paddingLeft: 10, width: "70%" }}>
                                                {(choghadiyaActiveTab === 'sun'
                                                    ? choghadiyaData.day
                                                    : choghadiyaData.night
                                                ).map((item, index) => (
                                                    <View key={item.id} style={styles.choghadityaYimingItem}>

                                                        <View
                                                            style={[
                                                                styles.timingDot,
                                                                { backgroundColor: getChoghadiyaDotColor(item.name) },
                                                            ]}
                                                        >
                                                            {index === activeIndex && isToday && (
                                                                <View style={styles.innerWhiteDot} />
                                                            )}
                                                        </View>

                                                        <View style={styles.timingTextContainer}>
                                                            <Text style={styles.timingName}>{item.name}</Text>
                                                        </View>

                                                        <Text style={styles.timingTime}>
                                                            {formatTime(item.time, i18n.locale)}
                                                        </Text>

                                                    </View>
                                                ))}


                                            </View>
                                            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: "center", alignItems: "center", width: "15%" }} onPress={() => setChoghadiyaActiveTab('moon')}>
                                                {choghadiyaActiveTab != 'sun' && <Fontisto name="caret-left" size={20} color="#fff" />}
                                                <Icon name={choghadiyaActiveTab != 'sun' ? "moon" : "moon-outline"} size={20} color="#ffffffff" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <View style={{
                                        backgroundColor: 'rgba(128, 0, 0,0.6)',
                                    }}>
                                        <View style={styles.timingsHeader}>
                                            <Text style={styles.todayText}>
                                                {moment(selectedDate).isSame(moment(), 'day')
                                                    ? i18n.t('date.today')
                                                    : moment(selectedDate).format('ddd, DD MMM YYYY')}
                                            </Text>
                                            <View style={{ flex: 1, alignItems: 'center' }}>
                                                {globalData.tithi === '8' || globalData.tithi === '14' || (globalData.tithi === '5' &&
                                                    globalData.paksha_type?.toLowerCase() === 'sud') ? (
                                                    <Image
                                                        style={styles.middleImage}
                                                        source={require('../../assets/no_vegetables_day_icon.png')}
                                                        resizeMode="contain"
                                                    />
                                                ) : null}
                                            </View>
                                            <Text style={styles.dateText}>
                                                {i18n.locale == "en" ? globalData.guj_month_english_name : i18n.locale == "gu" ? globalData.guj_month_gujarati_name : globalData.guj_month_hindi_name} {" "}{i18n.t(`date.${globalData.paksha_type?.toLowerCase()}`)} {" "}{convertDigitsOnly(globalData.tithi, i18n.locale)}
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.menuItem}
                                            onPress={() => navigation.navigate('JainCalendar')}
                                        >
                                            <View style={styles.menuItemContent}>
                                                <Text style={styles.menuItemTitle}>
                                                    {i18n.t('menu.jainCalendar')}
                                                </Text>
                                                <Text style={styles.menuItemSubtitle}>
                                                    {i18n.t('menu.veerSamvat')}
                                                </Text>
                                            </View>
                                            <Icon name="chevron-forward" size={20} color="#fff" />
                                        </TouchableOpacity>
                                        <View style={styles.menuContainer}>
                                            {menuItems.slice(1).map((item) => (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={styles.menuItem}
                                                    onPress={() => {
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
                                                                await getGlobalData(selectedDate);
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
                        </>}
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
    repeatBg: {
        position: 'absolute',
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        top: 0,
        left: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    languageIcon: {
        position: 'absolute',
        top: 15,
        left: 30,
        zIndex: 100,
    },
    logo: {
        width: 225,
        height: 60,
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
        justifyContent: 'space-between',
        width: '100%',
        paddingBottom: 0,
        marginTop: -50,
        paddingHorizontal: 0,
    },
    timeContainer: {
        alignItems: 'center',
    },
    timeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
    },
    timeLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 10,
        marginTop: 2,
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 20,
        marginHorizontal: 5
    },
    tab: {
        width: "50%",
        paddingVertical: 10,
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
        paddingHorizontal: 20,
        paddingVertical: 10,
        // marginVertical: 15,
    },
    todayText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    middleImage: {
        width: 28,
        height: 28,
        marginHorizontal: 8,
        // tintColor: '#fff',
    },
    dateText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 'auto',
    },
    godContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        marginHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 10,
        marginTop: 15,
        marginBottom: 10,
        padding: 5,
    },
  godName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    flex: 1,           
    flexWrap: 'wrap',  
    textAlign: 'center',
    marginHorizontal: 5,
},

arrowButton: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
},
    timingsContainer: {
        borderRadius: 15,
        marginHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    column: {
        width: '49%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    timingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,

    },
    choghadityaYimingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
        borderRadius: 10,
    },
    timingDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerWhiteDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },
    timingTextContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 2,
    },
    timingName: {
        width: '50%',
        color: 'white',
        fontSize: 13,
    },
    timingTime: {
        width: '55%',
        color: 'white',
        fontSize: 13,
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
    },
    bellIcon: {
        position: 'absolute',
        top: 15,
        right: 30,
        zIndex: 100,
    }
});

export default Home;
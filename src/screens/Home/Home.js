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

// City options (city, timezone, lat, long)
const CITY_OPTIONS = [
    { city: 'Adelaide, SA, Australia', timezone: 'Australia/Adelaide', lat: -34.929, long: 138.601 },
    { city: 'Agra, Uttar Pradesh, India', timezone: 'Asia/Kolkata', lat: 27.18, long: 78.02 },
    { city: 'Ahmedabad, Gujarat, India', timezone: 'Asia/Kolkata', lat: 23.03, long: 72.58 },
    { city: 'Aligarh, Uttar Pradesh, India', timezone: 'Asia/Kolkata', lat: 27.88, long: 78.08 },
    { city: 'Allahabad, Uttar Pradesh, India', timezone: 'Asia/Kolkata', lat: 25.45, long: 81.85 },
    { city: 'Amravati, Maharashtra, India', timezone: 'Asia/Kolkata', lat: 20.9258, long: 77.7647 },
    { city: 'Amritsar, Punjab, India', timezone: 'Asia/Kolkata', lat: 31.64, long: 74.86 },
    { city: 'Anand, Gujarat, India', timezone: 'Asia/Kolkata', lat: 22.556, long: 72.951 },
    { city: 'Ankleshwar, Gujarat, India', timezone: 'Asia/Kolkata', lat: 21.6, long: 73 },
    { city: 'Antwerp, Belgium', timezone: 'Europe/Brussels', lat: 51.2167, long: 4.4 },
    { city: 'Atlanta, GA, United States', timezone: 'America/New_York', lat: 33.755, long: -84.39 },
    { city: 'Aurangabad, Maharashtra, India', timezone: 'Asia/Kolkata', lat: 19.88, long: 75.32 },
    { city: 'Austin, TX, United States', timezone: 'America/Chicago', lat: 30.25, long: -97.75 },
    { city: 'Baltimore, MD, United States', timezone: 'America/New_York', lat: 39.2833, long: -76.6167 },
    { city: 'Bangalore, Karnataka, India', timezone: 'Asia/Kolkata', lat: 12.9667, long: 77.5667 },
    { city: 'Bangkok, Thailand', timezone: 'Asia/Bangkok', lat: 13.75, long: 100.4667 },
    { city: 'Barcelona, Catalonia, Spain', timezone: 'Europe/Madrid', lat: 41.3833, long: 2.1833 },
    { city: 'Bareilly, Uttar Pradesh, India', timezone: 'Asia/Kolkata', lat: 28.364, long: 79.415 },
    { city: 'Beijing, Beijing, China', timezone: 'Asia/Shanghai', lat: 39.9139, long: 116.3917 },
    { city: 'Berlin, Germany', timezone: 'Europe/Berlin', lat: 52.5167, long: 13.3833 },
    { city: 'Bhiwandi, Maharashtra, India', timezone: 'Asia/Kolkata', lat: 19.2967, long: 73.0631 },
    { city: 'Bhopal, Madhya Pradesh, India', timezone: 'Asia/Kolkata', lat: 23.25, long: 77.4167 },
    { city: 'Bhubaneshwar, Orissa, India', timezone: 'Asia/Kolkata', lat: 20.27, long: 85.84 },
    { city: 'Bikaner, Rajasthan, India', timezone: 'Asia/Kolkata', lat: 28.0167, long: 73.3119 },
    { city: 'Birmingham, England, United Kingdom', timezone: 'Europe/London', lat: 52.4831, long: -1.8936 },
    { city: 'Boston, MA, United States', timezone: 'America/New_York', lat: 42.3581, long: -71.0636 },
    { city: 'Brisbane, QLD, Australia', timezone: 'Australia/Brisbane', lat: -27.4679, long: 153.0278 },
    { city: 'Brussels, Belgium', timezone: 'Europe/Brussels', lat: 50.85, long: 4.35 },
    { city: 'Buenos Aires, Argentina', timezone: 'America/Argentina/Buenos_Aires', lat: -34.6033, long: -58.3817 },
    { city: 'Byron Bay, NSW, Australia', timezone: 'Australia/Sydney', lat: -28.6431, long: 153.615 },
    { city: 'Cairo, Egypt', timezone: 'Africa/Cairo', lat: 30.05, long: 31.2333 },
    { city: 'Cambridge, England, United Kingdom', timezone: 'Europe/London', lat: 52.205, long: 0.119 },
    { city: 'Cape Town, WC, South Africa', timezone: 'Africa/Johannesburg', lat: -33.9253, long: 18.4239 },
    { city: 'Casablanca, Morocco', timezone: 'Africa/Casablanca', lat: 33.5333, long: -7.5833 },
    { city: 'Chandigarh, India', timezone: 'Asia/Kolkata', lat: 30.75, long: 76.78 },
    { city: 'Charlotte, NC, United States', timezone: 'America/New_York', lat: 35.2269, long: -80.8433 },
    { city: 'Chennai, Tamil Nadu, India', timezone: 'Asia/Kolkata', lat: 13.0839, long: 80.27 },
    { city: 'Chicago, IL, United States', timezone: 'America/Chicago', lat: 41.8369, long: -87.6847 },
    { city: 'Cleveland, OH, United States', timezone: 'America/New_York', lat: 41.4822, long: -81.6697 },
    { city: 'Coffs Harbour, NSW, Australia', timezone: 'Australia/Sydney', lat: -30.3022, long: 153.1189 },
    { city: 'Coimbatore, Tamil Nadu, India', timezone: 'Asia/Kolkata', lat: 11.0183, long: 76.9725 },
    { city: 'Colombo, Western Province, Sri Lanka', timezone: 'Asia/Colombo', lat: 6.9344, long: 79.8428 },
    { city: 'Columbus, OH, United States', timezone: 'America/New_York', lat: 39.9833, long: -82.9833 },
    { city: 'Cuttack, Orissa, India', timezone: 'Asia/Kolkata', lat: 20.27, long: 85.52 },
    { city: 'Dallas, TX, United States', timezone: 'America/Chicago', lat: 32.7758, long: -96.7967 },
    { city: 'Dehradun, Uttarakhand, India', timezone: 'Asia/Kolkata', lat: 30.318, long: 78.029 },
    { city: 'Delhi, India', timezone: 'Asia/Kolkata', lat: 28.61, long: 77.23 },
    { city: 'Denver, CO, United States', timezone: 'America/Denver', lat: 39.7392, long: -104.9847 },
    { city: 'Detroit, MI, United States', timezone: 'America/Detroit', lat: 42.3314, long: -83.0458 },
    { city: 'Dhaka, Bangladesh', timezone: 'Asia/Dhaka', lat: 23.7, long: 90.375 },
    { city: 'Dhanbad, Jharkhand, India', timezone: 'Asia/Kolkata', lat: 23.8, long: 86.45 },
    { city: 'Dubai, United Arab Emirates', timezone: 'Asia/Dubai', lat: 24.95, long: 55.3333 },
    { city: 'Durban, KZN, South Africa', timezone: 'Africa/Johannesburg', lat: -29.8833, long: 31.05 },
    { city: 'East Brunswick, NJ, United States', timezone: 'America/New_York', lat: 40.4262, long: -74.4182 },
    { city: 'Edison, NJ, United States', timezone: 'America/New_York', lat: 40.504, long: -74.3494 },
    { city: 'Faisalabad, Punjab, Pakistan', timezone: 'Asia/Karachi', lat: 31.418, long: 73.079 },
    { city: 'Faridabad, Haryana, India', timezone: 'Asia/Kolkata', lat: 28.4211, long: 77.3078 },
    { city: 'Fort Worth, TX, United States', timezone: 'America/Chicago', lat: 32.7574, long: -97.3332 },
    { city: 'Frankfurt, Hesse, Germany', timezone: 'Europe/Berlin', lat: 50.1167, long: 8.6833 },
    { city: 'Fremont, CA, United States', timezone: 'America/Los_Angeles', lat: 37.5483, long: -121.9886 },
    { city: 'Gandhidham, Gujarat, India', timezone: 'Asia/Kolkata', lat: 23.08, long: 70.13 },
    { city: 'Gandhinagar, Gujarat, India', timezone: 'Asia/Kolkata', lat: 23.22, long: 72.68 },
    { city: 'Ghaziabad, Uttar Pradesh, India', timezone: 'Asia/Kolkata', lat: 28.67, long: 77.42 },
    { city: 'Girnar, Gujarat, India', timezone: 'Asia/Kolkata', lat: 21.4947, long: 70.5056 },
    { city: 'Gorakhpur, Uttar Pradesh, India', timezone: 'Asia/Kolkata', lat: 26.7588, long: 83.3697 },
    { city: 'Guwahati, Assam, India', timezone: 'Asia/Kolkata', lat: 26.1833, long: 91.7333 },
    { city: 'Gwalior, Madhya Pradesh, India', timezone: 'Asia/Kolkata', lat: 26.2215, long: 78.178 },
    { city: 'Havana, City of Havana, Cuba', timezone: 'America/Havana', lat: 23.1333, long: -82.3833 },
    { city: 'Ho chi minh city (Saigon), Vietnam', timezone: 'Asia/Ho_Chi_Minh', lat: 10.75, long: 106.6667 },
    { city: 'Hong kong', timezone: 'Asia/Hong_Kong', lat: 22.267, long: 114.188 },
    { city: 'Houston, TX, United States', timezone: 'America/Chicago', lat: 29.7628, long: -95.3831 },
    { city: 'Hubli, Karnataka, India', timezone: 'Asia/Kolkata', lat: 15.3617, long: 75.085 },
    { city: 'Hyderabad, AP, India', timezone: 'Asia/Kolkata', lat: 17.366, long: 78.476 },
    { city: 'Indianapolis, IN, United States', timezone: 'America/Indiana/Indianapolis', lat: 39.791, long: -86.148 },
    { city: 'Indore, Madhya Pradesh, India', timezone: 'Asia/Kolkata', lat: 22.7253, long: 75.8655 },
    { city: 'Irving, TX, United States', timezone: 'America/Chicago', lat: 32.8117, long: -96.9508 },
    { city: 'Istanbul, Turkey', timezone: 'Europe/Istanbul', lat: 41.0136, long: 28.955 },
    { city: 'Jabalpur, Madhya Pradesh, India', timezone: 'Asia/Kolkata', lat: 23.1667, long: 79.9333 },
    { city: 'Jacksonville', timezone: 'America/New_York', lat: 30.3369, long: -81.6614 },
    { city: 'Jaipur, Rajasthan, India', timezone: 'Asia/Kolkata', lat: 26.926, long: 75.8235 },
    { city: 'Jakarta, Indonesia', timezone: 'Asia/Jakarta', lat: -6.2, long: 106.8167 },
    { city: 'Jalandhar, Punjab, India', timezone: 'Asia/Kolkata', lat: 31.326, long: 75.576 },
    { city: 'Jammu, India', timezone: 'Asia/Kolkata', lat: 34.083656, long: 74.797371 },
    { city: 'Jamnagar, Gujarat, India', timezone: 'Asia/Kolkata', lat: 22.47, long: 70.07 },
    { city: 'Jamshedpur, Jharkhand, India', timezone: 'Asia/Kolkata', lat: 22.8, long: 86.3 },
    { city: 'Jeddah, Makkah, Saudi Arabia', timezone: 'Asia/Riyadh', lat: 21.5433, long: 39.1728 },
    { city: 'Jodhpur, Rajasthan, India', timezone: 'Asia/Kolkata', lat: 26.28, long: 73.02 },
    { city: 'Johannesburg, GP, South Africa', timezone: 'Africa/Johannesburg', lat: -26.2044, long: 28.0456 },
    { city: 'Kabul, Afghanistan', timezone: 'Asia/Kabul', lat: 34.5333, long: 69.1667 },
    { city: 'Kalyan, Maharashtra, India', timezone: 'Asia/Kolkata', lat: 19.2373, long: 73.1304 },
    { city: 'Kanpur, Uttar Pradesh, India', timezone: 'Asia/Kolkata', lat: 26.4607, long: 80.3334 },
    { city: 'Karachi, Sindh, Pakistan', timezone: 'Asia/Karachi', lat: 24.86, long: 67.01 },
    { city: 'Khambhat, Gujarat, India', timezone: 'Asia/Kolkata', lat: 22.3, long: 72.62 },
    { city: 'Kinshasa, Democratic Republic of the Congo', timezone: 'Africa/Kinshasa', lat: -4.325, long: 15.3222 },
    { city: 'Kobe, Hyogo, Japan', timezone: 'Asia/Tokyo', lat: 34.69, long: 135.1956 },
    { city: 'Kochi, Kerala, India', timezone: 'Asia/Kolkata', lat: 9.97, long: 76.28 },
    { city: 'Kolkata, West Bengal, India', timezone: 'Asia/Kolkata', lat: 22.5667, long: 88.3667 },
    { city: 'Kota, Rajasthan, India', timezone: 'Asia/Kolkata', lat: 25.18, long: 75.83 },
    { city: 'Kuala Lumpur, KL, Malaysia', timezone: 'Asia/Kuala_Lumpur', lat: 3.1357, long: 101.688 },
    { city: 'Kutch, Gujarat, India', timezone: 'Asia/Kolkata', lat: 23.915, long: 70.367 },
    { city: 'Lahore, Punjab, Pakistan', timezone: 'Asia/Karachi', lat: 31.5497, long: 74.3436 },
    { city: 'Las vegas, NV, United States', timezone: 'America/Los_Angeles', lat: 36.1215, long: -115.1739 },
    { city: 'Lisbon, Portugal', timezone: 'Europe/Lisbon', lat: 38.7138, long: -9.1394 },
    { city: 'London, England, United Kingdom', timezone: 'Europe/London', lat: 51.5072, long: -0.1275 },
    { city: 'Los Angeles, CA, United States', timezone: 'America/Los_Angeles', lat: 34.05, long: -118.25 },
    { city: 'Louisville, KY, United States', timezone: 'America/New_York', lat: 38.25, long: -85.7667 },
    { city: 'Lucknow, Uttar Pradesh, India', timezone: 'Asia/Kolkata', lat: 26.847, long: 80.947 },
    { city: 'Ludhiana, Punjab, India', timezone: 'Asia/Kolkata', lat: 30.91, long: 75.85 },
    { city: 'Madrid, Spain', timezone: 'Europe/Madrid', lat: 40.4, long: -3.6833 },
    { city: 'Madurai, Tamil Nadu, India', timezone: 'Asia/Kolkata', lat: 9.9197, long: 78.1194 },
    { city: 'Mahudi, Gujarat, India', timezone: 'Asia/Kolkata', lat: 23.4833, long: 72.7833 },
    { city: 'Manchester, England, United Kingdom', timezone: 'Europe/London', lat: 53.4667, long: -2.2333 },
    { city: 'Mangalore, Karnataka, India', timezone: 'Asia/Kolkata', lat: 12.87, long: 74.88 },
    { city: 'Manila, Philippines', timezone: 'Asia/Manila', lat: 14.5995124, long: 120.9842195 },
    { city: 'Meerut, Uttar Pradesh, India', timezone: 'Asia/Kolkata', lat: 28.99, long: 77.7 },
    { city: 'Melbourne, VIC, Australia', timezone: 'Australia/Melbourne', lat: -37.8136, long: 144.9631 },
    { city: 'Memphis, TN, United States', timezone: 'America/Chicago', lat: 35.1174, long: -89.9711 },
    { city: 'Mexico City, DF, Mexico', timezone: 'America/Mexico_City', lat: 19.4333, long: -99.1333 },
    { city: 'Miami, FL, United States', timezone: 'America/New_York', lat: 25.7877, long: -80.2241 },
    { city: 'Milan, Lombardy, Italy', timezone: 'Europe/Rome', lat: 45.4667, long: 9.1667 },
    { city: 'Milwaukee, WI, United States', timezone: 'America/Chicago', lat: 43.05, long: -87.95 },
    { city: 'Minneapolis, MN, United States', timezone: 'America/Chicago', lat: 44.9833, long: -93.2667 },
    { city: 'Montréal, QC, Canada', timezone: 'America/Montreal', lat: 45.5, long: -73.5667 },
    { city: 'Moradabad, Uttar Pradesh, India', timezone: 'Asia/Kolkata', lat: 28.83, long: 78.78 },
    { city: 'Moscow, Russia', timezone: 'Europe/Moscow', lat: 55.75, long: 37.6167 },
    { city: 'Mount Abu, Rajasthan, India', timezone: 'Asia/Kolkata', lat: 24.5925, long: 72.7083 },
    { city: 'Mumbai, Maharashtra, India', timezone: 'Asia/Kolkata', lat: 18.975, long: 72.8258 },
    { city: 'Mysore, Karnataka, India', timezone: 'Asia/Kolkata', lat: 12.3, long: 76.65 },
    { city: 'Nagpur, Maharashtra, India', timezone: 'Asia/Kolkata', lat: 21.15, long: 79.09 },
    { city: 'Nairobi, Kenya', timezone: 'Africa/Nairobi', lat: -1.2833, long: 36.8167 },
    { city: 'Nashik, Maharashtra, India', timezone: 'Asia/Kolkata', lat: 20, long: 73.78 },
    { city: 'Nashville-davidson, TN, United States', timezone: 'America/Chicago', lat: 36.1667, long: -86.7833 },
    { city: 'Navi Mumbai, Maharashtra, India', timezone: 'Asia/Kolkata', lat: 19.02, long: 73.02 },
    { city: 'Navsari, Gujarat, India', timezone: 'Asia/Kolkata', lat: 20.9491, long: 72.9136 },
    { city: 'New Delhi, Delhi, India', timezone: 'Asia/Kolkata', lat: 28.6139, long: 77.2089 },
    { city: 'New York, NY, United States', timezone: 'America/New_York', lat: 40.7127, long: -74.0059 },
    { city: 'Noida, Uttar Pradesh, India', timezone: 'Asia/Kolkata', lat: 28.57, long: 77.32 },
    { city: 'Oklahoma City, OK, United States', timezone: 'America/Chicago', lat: 35.4822, long: -97.535 },
    { city: 'Osaka, Japan', timezone: 'Asia/Tokyo', lat: 34.6939, long: 135.5022 },
    { city: 'Palitana, Gujarat, India', timezone: 'Asia/Kolkata', lat: 21.52, long: 71.83 },
    { city: 'Paris, Île-de-France, France', timezone: 'Europe/Paris', lat: 48.8567, long: 2.3508 },
    { city: 'Patna, Bihar, India', timezone: 'Asia/Kolkata', lat: 25.611, long: 85.144 },
    { city: 'Philadelphia, PA, United States', timezone: 'America/New_York', lat: 39.95, long: -75.1667 },
    { city: 'Phoenix, AZ, United States', timezone: 'America/Phoenix', lat: 33.45, long: -112.0667 },
    { city: 'Portland, OR, United States', timezone: 'America/Los_Angeles', lat: 45.52, long: -122.6819 },
    { city: 'Pune, Maharashtra, India', timezone: 'Asia/Kolkata', lat: 18.5203, long: 73.8567 },
    { city: 'Raipur, Chhattisgarh, India', timezone: 'Asia/Kolkata', lat: 21.14, long: 81.38 },
    { city: 'Rajkot, Gujarat, India', timezone: 'Asia/Kolkata', lat: 22.3, long: 70.7833 },
    { city: 'Ranakpur, Rajasthan, India', timezone: 'Asia/Kolkata', lat: 25.135, long: 73.447 },
    { city: 'Ranchi, Jharkhand, India', timezone: 'Asia/Kolkata', lat: 23.35, long: 85.33 },
    { city: 'Rawalpindi, Punjab, Pakistan', timezone: 'Asia/Karachi', lat: 33.6, long: 73.0333 },
    { city: 'Rio de Janeiro, RJ, Brazil', timezone: 'America/Sao_Paulo', lat: -22.9083, long: -43.1964 },
    { city: 'Riyadh, Saudi Arabia', timezone: 'Asia/Riyadh', lat: 24.6333, long: 46.7167 },
    { city: 'Rome, Latium, Italy', timezone: 'Europe/Rome', lat: 41.9, long: 12.5 },
    { city: 'Sacramento, CA, United States', timezone: 'America/Los_Angeles', lat: 38.5556, long: -121.4689 },
    { city: 'Verapaz, San Vicente, El Salvador', timezone: 'America/El_Salvador', lat: 13.6689, long: -88.8661 },
    { city: 'San Diego, CA, United States', timezone: 'America/Los_Angeles', lat: 32.715, long: -117.1625 },
    { city: 'San Francisco, CA, United States', timezone: 'America/Los_Angeles', lat: 37.7833, long: -122.4167 },
    { city: 'San Jose, CA, United States', timezone: 'America/Los_Angeles', lat: 37.3333, long: -121.9 },
    { city: 'Santa Clara, CA, United States', timezone: 'America/Los_Angeles', lat: 37.3544, long: -121.9692 },
    { city: 'Santiago, Chile', timezone: 'America/Santiago', lat: -33.45, long: -70.6667 },
    { city: 'São Paulo, SP, Brazil', timezone: 'America/Sao_Paulo', lat: -23.55, long: -46.6333 },
    { city: 'Seattle, WA, United States', timezone: 'America/Los_Angeles', lat: 47.6097, long: -122.3331 },
    { city: 'Seoul, South Korea', timezone: 'Asia/Seoul', lat: 37.5667, long: 126.9781 },
    { city: 'Shanghai, China', timezone: 'Asia/Shanghai', lat: 31.2, long: 121.5 },
    { city: 'Shankheshwar, Patan, India', timezone: 'Asia/Kolkata', lat: 23.3, long: 71.47 },
    { city: 'Shenzhen, Guangdong, China', timezone: 'Asia/Shanghai', lat: 22.55, long: 114.1 },
    { city: 'Shravanabelagola, Karnataka, India', timezone: 'Asia/Kolkata', lat: 12.859, long: 76.484 },
    { city: 'Singapore', timezone: 'Asia/Singapore', lat: 1.3, long: 103.8 },
    { city: 'Solapur, Maharashtra, India', timezone: 'Asia/Kolkata', lat: 17.68, long: 75.92 },
    { city: 'Srinagar, Jammu and Kashmir, India', timezone: 'Asia/Kolkata', lat: 34.0016247, long: 74.7627016 },
    { city: 'St Louis, MO, United States', timezone: 'America/Chicago', lat: 38.6272, long: -90.1978 },
    { city: 'Stockholm, Stockholm, Sweden', timezone: 'Europe/Stockholm', lat: 59.3294, long: 18.0686 },
    { city: 'Surat, Gujarat, India', timezone: 'Asia/Kolkata', lat: 21.17, long: 72.83 },
    { city: 'Suva, Fiji', timezone: 'Pacific/Fiji', lat: -18.1416, long: 178.4419 },
    { city: 'Sydney, NSW, Australia', timezone: 'Australia/Sydney', lat: -33.86, long: 151.2094 },
    { city: 'Taipei, Taiwan', timezone: 'Asia/Taipei', lat: 25.0333, long: 121.6333 },
    { city: 'Tampa, FL, United States', timezone: 'America/New_York', lat: 27.971, long: -82.465 },
    { city: 'Tehran, Iran', timezone: 'Asia/Tehran', lat: 35.6961, long: 51.4231 },
    { city: 'Tel aviv-yafo, Israel', timezone: 'Asia/Jerusalem', lat: 32.0833, long: 34.8 },
    { city: 'Thane, Maharashtra, India', timezone: 'Asia/Kolkata', lat: 19.1724, long: 72.957 },
    { city: 'Thiruvananthapuram, Kerala, India', timezone: 'Asia/Kolkata', lat: 8.4875, long: 76.9525 },
    { city: 'Tokyo, Japan', timezone: 'Asia/Tokyo', lat: 35.6895, long: 139.6917 },
    { city: 'Toronto, ON, Canada', timezone: 'America/Toronto', lat: 43.7, long: -79.4 },
    { city: 'Udaipur, Rajasthan, India', timezone: 'Asia/Kolkata', lat: 24.58, long: 73.68 },
    { city: 'Vadodara, Gujarat, India', timezone: 'Asia/Kolkata', lat: 22.3, long: 73.2003 },
    { city: 'Vancouver, BC, Canada', timezone: 'America/Vancouver', lat: 49.25, long: -123.1 },
    { city: 'Varanasi, Uttar Pradesh, India', timezone: 'Asia/Kolkata', lat: 25.282, long: 82.9563 },
    { city: 'Vasai, Maharashtra, India', timezone: 'Asia/Kolkata', lat: 19.47, long: 72.8 },
    { city: 'Vellore, Tamil Nadu, India', timezone: 'Asia/Kolkata', lat: 12.9202, long: 79.1333 },
    { city: 'Vijayawada, AP, India', timezone: 'Asia/Kolkata', lat: 16.5083, long: 80.6417 },
    { city: 'Visakhapatnam, AP, India', timezone: 'Asia/Kolkata', lat: 17.6883, long: 83.2186 },
    { city: 'Warsaw, Masovian, Poland', timezone: 'Europe/Warsaw', lat: 52.2333, long: 21.0167 },
    { city: 'Washington, United States', timezone: 'America/Los_Angeles', lat: 47.5, long: -120.5 },
    { city: 'Wembley, England, United Kingdom', timezone: 'Europe/London', lat: 51.556, long: -0.3042 },
    { city: 'Westborough, MA, United States', timezone: 'America/New_York', lat: 42.2694, long: -71.6167 },
    { city: 'Wollongong, NSW, Australia', timezone: 'Australia/Sydney', lat: -34.4331, long: 150.8831 },
    { city: 'Omdurman, Sudan', timezone: 'Africa/Khartoum', lat: 15.6445, long: 32.4777 },
];

const Home = ({ route, navigation }) => {
    const [activeTab, setActiveTab] = useState('pachakkhan');
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
    // Load selected city (from params first, else AsyncStorage)
    // In Home.js, update the initCity function in the useEffect
    useEffect(() => {
        const initCity = async () => {
            try {
                if (route.params?.city) {
                    const fromParams = route.params.city;
                    // Try to find the city in CITY_OPTIONS
                    const found = CITY_OPTIONS.find(c => c.city === fromParams);
                    if (found) {
                        // Store the full city data
                        await AsyncStorage.setItem('selectedCityData', JSON.stringify(found));
                        setSelectedCity(found);
                    }
                    return;
                }

                // Try to get the full city data first
                const savedCityData = await AsyncStorage.getItem('selectedCityData');
                if (savedCityData) {
                    setSelectedCity(JSON.parse(savedCityData));
                } else {
                    // Fallback to just the city name for backward compatibility
                    const savedCityName = await AsyncStorage.getItem('selectedCity');
                    if (savedCityName) {
                        const found = CITY_OPTIONS.find(c => c.city === savedCityName);
                        if (found) {
                            setSelectedCity(found);
                            // Update to store full data for next time
                            await AsyncStorage.setItem('selectedCityData', JSON.stringify(found));
                        }
                    }
                }
            } catch (e) {
                console.error('Error loading city:', e);
            }
        };
        initCity();
    }, [route.params?.city]);

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
                                        {((selectedCity && selectedCity.city) || (route.params && route.params.city)) ? (
                                            <Text style={styles.cityAbbr}>{((selectedCity && selectedCity.city) || (route.params && route.params.city)).slice(0, 3)}</Text>
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
                                            data={CITY_OPTIONS.filter(c => c.city.toLowerCase().includes(citySearch.toLowerCase()))}
                                            keyExtractor={(item, index) => `${item.city}-${index}`}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    style={[
                                                        styles.cityOption,
                                                        selectedCity && selectedCity.city === item.city && { backgroundColor: '#f8f8f8' }
                                                    ]}
                                                    onPress={async () => {
                                                        try { await AsyncStorage.setItem('selectedCity', item.city); } catch (e) { }
                                                        setSelectedCity(item);
                                                        setShowCityModal(false);
                                                    }}
                                                >
                                                    <Text style={styles.cityText}>{item.city}</Text>
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
        width: '80%',
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
        marginLeft: 6,
        fontWeight: 'bold',
        fontSize: 12,
        textTransform: 'uppercase'
    }
});

export default Home;

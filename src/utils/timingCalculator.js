import moment from 'moment-timezone';
import * as SolarCalc from 'suncalc';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default coordinates (Mumbai)
const DEFAULT_COORDS = {
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata'
};

const getCityData = async (cityName) => {
    try {
        const { default: HomeModule } = await import('../screens/Home/Home');
        const CITY_OPTIONS = HomeModule.CITY_OPTIONS || [];
        return CITY_OPTIONS.find(city => city.city === cityName);
    } catch (error) {
        console.error('Error getting city data:', error);
        return null;
    }
};

const calculateChoghadiya = (startTime, isDay = true, timeZone) => {
    const start = moment(startTime).tz(timeZone);
    const choghadiyaTypes = isDay
        ? ['amrut', 'shubh', 'rog', 'uday', 'chal', 'labh']
        : ['amrut', 'shubh', 'rog', 'uday', 'chal', 'labh'];

    const colors = [
        'rgba(100, 200, 255, 0.6)',
        'rgba(100, 255, 100, 0.6)',
        'rgba(255, 100, 0, 0.6)',
        'rgba(255, 230, 0, 0.6)',
        'rgba(255, 190, 0, 0.6)',
        'rgba(200, 150, 255, 0.6)'
    ];

    return choghadiyaTypes.map((type, index) => {
        const startSlot = moment(start).add(index * 1.5, 'hours');
        const endSlot = moment(startSlot).add(1.5, 'hours');

        return {
            id: (index + 1).toString(),
            name: `choghadiya.${type}`,
            time: `${startSlot.format('HH:mm')} - ${endSlot.format('HH:mm')}`,
            color: colors[index % colors.length]
        };
    });
};

export const calculateTimings = async (cityData = null, selectedDate = null) => {
    // Use provided city data or default to Mumbai
    const { latitude, longitude, timezone } = cityData || DEFAULT_COORDS;
    // console.log('Received city data:', latitude, longitude, timezone);

    // Create date in the target timezone
    const now = selectedDate ? moment(selectedDate).tz(timezone) : moment().tz(timezone);
    const targetDate = now.toDate();

    // Get sunrise and sunset times
    const sunTimes = SolarCalc.getTimes(targetDate, latitude, longitude);

    // Format times with proper timezone handling
    const formatTime = (date) => {
        if (!date) return '--:-- --';
        return moment(date).tz(timezone).format('hh:mm A');
    };

    // Calculate choghadiya times with proper timezone handling
    const choghadiyaDay = calculateChoghadiya(sunTimes.sunrise, true, timezone);
    const choghadiyaNight = calculateChoghadiya(sunTimes.sunset, false, timezone);

    // Calculate daily timings based on sunrise/sunset
    const calculateDailyTimings = () => {
        // Create moments in the target timezone
        const sunrise = moment(sunTimes.sunrise).tz(timezone);
        const sunset = moment(sunTimes.sunset).tz(timezone);

        // Calculate day duration in minutes
        const dayDurationMinutes = sunset.diff(sunrise, 'minutes');
        const daySegment = dayDurationMinutes / 4; // Divide day into 4 equal parts

        // Calculate timings based on the Java implementation
        const navkarshi = moment(sunrise).add(daySegment * 1 / 3, 'minutes');
        const porshi = moment(navkarshi).add(daySegment * 1 / 3, 'minutes');
        const sadhPorshi = moment(porshi).add(daySegment * 1 / 3, 'minutes');

        // For the evening timings, use fixed offsets from sunset as per Java code
        const purimaddh = moment(sunset).subtract(4, 'hours');
        const avaddh = moment(sunset).subtract(2, 'hours');
        const chovihar = moment(sunset).subtract(1, 'hour');

        return [
            { id: '1', name: 'timings.navkarshi', time: formatTime(navkarshi) },
            { id: '2', name: 'timings.porshi', time: formatTime(porshi) },
            { id: '3', name: 'timings.sadhPorshi', time: formatTime(sadhPorshi) },
            { id: '4', name: 'timings.purimaddh', time: formatTime(purimaddh) },
            { id: '5', name: 'timings.avaddh', time: formatTime(avaddh) },
            { id: '6', name: 'timings.chovihar', time: formatTime(chovihar) },
        ];
    };

    return {
        currentTime: now.format('hh:mm A') || '--:-- --',
        sunrise: formatTime(sunTimes.sunrise) || '--:-- --',
        sunset: formatTime(sunTimes.sunset) || '--:-- --',
        timings: calculateDailyTimings(),
        choghadiya: {
            day: choghadiyaDay,
            night: choghadiyaNight
        }
    };
};

export const getCurrentTimings = async (selectedDate = null) => {
    try {
        // Get the selected city data from AsyncStorage
        const savedCityData = await AsyncStorage.getItem('selectedCityData');
        if (savedCityData) {
            const cityData = JSON.parse(savedCityData);
            const formatedData = {
                latitude: cityData.latitude || cityData.lat,
                longitude: cityData.longitude || cityData.long,
                timezone: cityData.timezone || 'Asia/Kolkata'
            };
            // console.log('Saved city data:', formatedData);
            return calculateTimings(formatedData, selectedDate);
        }
        return calculateTimings(DEFAULT_COORDS, selectedDate);
    } catch (error) {
        console.error('Error calculating timings:', error);
        return calculateTimings(DEFAULT_COORDS, selectedDate);
    }
};
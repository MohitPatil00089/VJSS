export const baseUrl = "https://absolutewebdevelopment.in/vjss/api/public/v1/";

export const getFrontCalendar = async (flag, year, month, month_in_gujarati, type, latitude, longitude, country_code, vikram_samvat) => {
    try {
        const response = await fetch(
            `${baseUrl}getfrontcalendar`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    flag: flag,
                    year: year,
                    month: month,
                    month_in_gujarati: month_in_gujarati,
                    type: type,
                    latitude: latitude,
                    longitude: longitude,
                    country_code: country_code,
                    vikram_samvat: vikram_samvat,
                }),
            }
        );

        const result = await response.json();
        console.log('Calendar Response:', result);
        return result;
    } catch (error) {
        console.error('API Error:', error);
    }
};

// Add this function to global.js
export const getAllLocations = async () => {
    try {
        console.log('Fetching locations...', `${baseUrl}/getalllocationforapp`);
        const response = await fetch(
            `${baseUrl}getalllocationforapp`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        const result = await response.json();
        console.log('Location Response:', result);
        if (result && result.data) {
            return result.data.map(city => ({
                id: city.id.toString(),
                name: city.name,
                timezone: city.timezone || 'Asia/Kolkata',
                lat: city.latitude,
                long: city.longitude,
                country_code: city.country_code || 'IN'
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching locations:', error);
        return [];
    }
};
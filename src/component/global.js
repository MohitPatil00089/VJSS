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
        // console.log('Calendar Response:', result);
        return result;
    } catch (error) {
        console.error('API Error:', error);
    }
};

// Add this function to global.js
export const getAllLocations = async () => {
    try {
        // console.log('Fetching locations...', `${baseUrl}/getalllocationforapp`);
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
        // console.log('Location Response:', result);
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



export const getFrontDashboardData = async (day, year, month, latitude, longitude, country_code) => {
    try {
        const response = await fetch(
            `${baseUrl}getfrontbasicdata`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    day: day,
                    year: year,
                    month: month,
                    latitude: latitude,
                    longitude: longitude,
                    country_code: country_code,
                }),
            }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
    }
};


export const getDashboardData = async (week_name, day, year, month, latitude, longitude) => {
    // console.log('Fetching dashboard data...', `${baseUrl}getfrontchoghadiyaswithtimedata`, week_name, day, year, month, latitude, longitude);
    try {
        const response = await fetch(
            `${baseUrl}getfrontchoghadiyaswithtimedata`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    week_name: week_name,
                    type: "All",
                    day: day,
                    year: year,
                    month: month,
                    latitude: latitude,
                    longitude: longitude,
                }),
            }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
    }
};


export const getFrontPanchKalyanaks = async (today_date) => {
    try {
        const response = await fetch(
            `${baseUrl}getfrontpanchkalyanaks`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    today_date: today_date,

                }),
            }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
    }
};


export const getFrontPanchakhan = async () => {
    try {
        const response = await fetch(
            `${baseUrl}getfrontpanchakhan`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: "All",

                }),
            }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
    }
};

export const getThemeSettings = async () => {
    try {
        const response = await fetch(
            `${baseUrl}findthemesettingswithoutauth/NxOpZowo9GmjKqdR`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
};

export const getAllTapAaradhana = async () => {
    try {
        const response = await fetch(
            `${baseUrl}gettapaaradhna`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        const result = await response.json();
        if (result && result.data) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching tap aaradhana:', error);
        return [];
    }
};

export const getfaq = async () => {
    try {
        const response = await fetch(
            `${baseUrl}get-faq-list`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
};
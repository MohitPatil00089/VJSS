// This script will help convert the existing data into the required format
// You can run this in a Node.js environment to generate the JSON files

// Example usage:
// node convertData.js > src/data/converted/kshayData.json

// This is just a template. You'll need to modify it based on your actual data structure
// and run it with Node.js to generate the JSON files.

// Example data conversion for kshayData
const convertKshayData = (data) => {
    // Assuming data is an array of objects with gregorian_date and jain_date
    return data.map(item => ({
        gregorian_date: item.gregorian_date,
        jain_date: item.jain_date
    }));
};

// Example data conversion for kalyanakData
const convertKalyanakData = (data) => {
    // Assuming data is an array of objects with id, tirthankar_name, event_name, jain_date
    return data.map(item => ({
        id: item.id,
        tirthankar_name: item.tirthankar_name,
        event_name: item.event_name,
        jain_date: item.jain_date
    }));
};

// Example data conversion for calendarData
const convertCalendarData = (data) => {
    // Assuming data is an array of objects with the required fields
    return data.map(item => ({
        id: item.id,
        gregorian_date: item.gregorian_date,
        jain_month: item.jain_month,
        jain_paksha: item.jain_paksha,
        jain_date: item.jain_date,
        jain_date_full: item.jain_date_full,
        is_holiday: item.is_holiday || 0
    }));
};

// Example of how to use these functions with your data
// const kshayData = convertKshayData(require('../data/original/kshay.json'));
// const kalyanakData = convertKalyanakData(require('../data/original/kalyanak.json'));
// const calendarData = convertCalendarData(require('../data/original/calendar.json'));

// console.log(JSON.stringify(convertedData, null, 2));

module.exports = {
    convertKshayData,
    convertKalyanakData,
    convertCalendarData
};

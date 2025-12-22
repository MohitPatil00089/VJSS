const fs = require('fs');
const path = require('path');
const { openDatabase } = require('react-native-sqlite-storage');

// Get the database path
const dbPath = path.join(process.cwd(), 'src', 'database', 'jain_calendar.db');

// Create database connection
const db = openDatabase({
    name: dbPath,
    location: 'default'
});

// Import data functions
const importKshayData = (tx, data) => {
    return new Promise((resolve, reject) => {
        tx.executeSql('DELETE FROM tblKshay', [], () => {
            let completed = 0;
            if (data.length === 0) return resolve();

            data.forEach(item => {
                tx.executeSql(
                    'INSERT INTO tblKshay (gregorian_date, jain_date) VALUES (?, ?)',
                    [item.gregorian_date, item.jain_date],
                    () => {
                        completed++;
                        if (completed === data.length) resolve();
                    },
                    (_, error) => {
                        console.error('Error inserting kshay data:', error);
                        reject(error);
                        return false;
                    }
                );
            });
        });
    });
};

const importKalyanakData = (tx, data) => {
    return new Promise((resolve, reject) => {
        tx.executeSql('DELETE FROM tblKalyanak', [], () => {
            let completed = 0;
            if (data.length === 0) return resolve();

            data.forEach(item => {
                tx.executeSql(
                    'INSERT INTO tblKalyanak (id, tirthankar_name, event_name, jain_date) VALUES (?, ?, ?, ?)',
                    [item.id, item.tirthankar_name, item.event_name, item.jain_date],
                    () => {
                        completed++;
                        if (completed === data.length) resolve();
                    },
                    (_, error) => {
                        console.error('Error inserting kalyanak data:', error);
                        reject(error);
                        return false;
                    }
                );
            });
        });
    });
};

const importCalendarData = (tx, data) => {
    return new Promise((resolve, reject) => {
        tx.executeSql('DELETE FROM tblCalendar', [], () => {
            let completed = 0;
            if (data.length === 0) return resolve();

            data.forEach(item => {
                tx.executeSql(
                    `INSERT INTO tblCalendar 
                    (id, gregorian_date, jain_month, jain_paksha, jain_date, jain_date_full, is_holiday) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        item.id,
                        item.gregorian_date,
                        item.jain_month,
                        item.jain_paksha,
                        item.jain_date,
                        item.jain_date_full,
                        item.is_holiday || 0
                    ],
                    () => {
                        completed++;
                        if (completed === data.length) resolve();
                    },
                    (_, error) => {
                        console.error('Error inserting calendar data:', error);
                        reject(error);
                        return false;
                    }
                );
            });
        });
    });
};

// Main import function
const importData = async () => {
    try {
        console.log('Starting data import...');

        // Read data files
        console.log('Reading data files...');
        const kshayData = require('../src/data/kshayData.json');
        const kalyanakData = require('../src/data/kalyanakData.json');
        const calendarData = require('../src/data/calendarData.json');

        console.log('Found data:', {
            kshay: kshayData.length,
            kalyanak: kalyanakData.length,
            calendar: calendarData.length
        });

        // Start transaction
        await new Promise((resolve, reject) => {
            db.transaction(async (tx) => {
                try {
                    console.log('Importing Kshay data...');
                    await importKshayData(tx, kshayData);

                    console.log('Importing Kalyanak data...');
                    await importKalyanakData(tx, kalyanakData);

                    console.log('Importing Calendar data...');
                    await importCalendarData(tx, calendarData);

                    resolve();
                } catch (error) {
                    console.error('Error during import transaction:', error);
                    reject(error);
                }
            }, (error) => {
                console.error('Transaction error:', error);
                reject(error);
            }, () => {
                console.log('Transaction completed successfully');
                resolve();
            });
        });

        console.log('Data import completed successfully!');
    } catch (error) {
        console.error('Error during data import:', error);
    } finally {
        // Close the database connection
        db.close(() => {
            console.log('Database connection closed');
            process.exit(0);
        });
    }
};

// Run the import
importData();

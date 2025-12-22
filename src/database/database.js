// src/database/database.js
import { openDatabase } from 'react-native-sqlite-storage';

const database = openDatabase(
    { name: 'jain_calendar.db', location: 'default' },
    () => console.log('Database connected'),
    error => console.error('Database error:', error)
);

export const getTableCount = (tableName) => {
    return new Promise((resolve, reject) => {
        database.transaction(tx => {
            tx.executeSql(
                `SELECT COUNT(*) as count FROM ${tableName}`,
                [],
                (_, result) => {
                    resolve(result.rows.item(0).count);
                },
                (_, error) => {
                    reject(error);
                }
            );
        });
    });
};
export const getTableRecords = (tableName, startDate, endDate) => {
    return new Promise((resolve, reject) => {
        database.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM ${tableName} WHERE gregorian_date BETWEEN ? AND ?`,
                [startDate, endDate],
                (_, result) => {
                    const rows = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        rows.push(result.rows.item(i));
                    }
                    resolve(rows);
                },
                (_, error) => reject(error)
            );
        });
    });
};


export const initDatabase = () => {
    return new Promise((resolve, reject) => {
        database.transaction(tx => {
            // Create tables if they don't exist
            tx.executeSql(`
        CREATE TABLE IF NOT EXISTS tblKshay (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          gregorian_date TEXT NOT NULL,
          jain_date TEXT NOT NULL
        )
      `);

            tx.executeSql(`
        CREATE TABLE IF NOT EXISTS tblKalyanak (
          id INTEGER PRIMARY KEY,
          tirthankar_name TEXT NOT NULL,
          event_name TEXT NOT NULL,
          jain_date TEXT NOT NULL
        )
      `);

            tx.executeSql(`
        CREATE TABLE IF NOT EXISTS tblCalendar (
          id INTEGER PRIMARY KEY,
          gregorian_date TEXT NOT NULL,
          jain_month TEXT NOT NULL,
          jain_paksha TEXT NOT NULL,
          jain_date TEXT NOT NULL,
          jain_date_full TEXT NOT NULL,
          is_holiday INTEGER DEFAULT 0
        )
      `);

            tx.executeSql(`
        CREATE TABLE IF NOT EXISTS tblEvents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          gregorian_date TEXT NOT NULL,
          description TEXT NOT NULL
        )
      `);
        },
            error => {
                console.error('Error creating tables:', error);
                reject(error);
            },
            () => {
                console.log('Database initialized successfully');
                resolve(database);
            });
    });
};

export const getCalendarData = (startDate, endDate) => {

    return new Promise((resolve, reject) => {
        database.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM tblCalendar WHERE gregorian_date BETWEEN ? AND ?`,
                [startDate, endDate],
                (_, result) => {
                    const rows = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        rows.push(result.rows.item(i));
                    }
                    resolve(rows);
                },
                (_, error) => reject(error)
            );
        });
    });
};

// In database.js, add this function
export const getKalyanakEvents = () => {
    return new Promise((resolve, reject) => {
        database.transaction(tx => {
            tx.executeSql(
                "SELECT * FROM tblKalyanak",
                [],
                (_, result) => {
                    const data = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        data.push(result.rows.item(i));
                    }
                    resolve(data);
                },
                (_, err) => reject(err)
            );
        });
    });
};

export const getEventsForDate = (date) => {
    return new Promise((resolve) => {
        const events = [];

        // Get Kshay events
        database.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM tblKshay WHERE gregorian_date = ?',
                [date],
                (_, { rows }) => {
                    const kshayEvents = (rows._array || []).map(item => ({
                        ...item,
                        type: 'kshay'
                    }));
                    events.push(...kshayEvents);

                    // Get Kalyanak events
                    tx.executeSql(
                        `SELECT k.* FROM tblKalyanak k
             JOIN tblCalendar c ON k.jain_date = c.jain_date_full
             WHERE c.gregorian_date = ?`,
                        [date],
                        (_, { rows: kalyanakRows }) => {
                            const kalyanakEvents = (kalyanakRows._array || []).map(item => ({
                                ...item,
                                type: 'kalyanak'
                            }));
                            const combined = [...events, ...kalyanakEvents];

                            // Get generic Events (tblEvents)
                            tx.executeSql(
                                'SELECT * FROM tblEvents WHERE gregorian_date = ?',
                                [date],
                                (_, { rows: eventRows }) => {
                                    const generalEvents = (eventRows._array || []).map(item => ({
                                        ...item,
                                        type: 'event'
                                    }));
                                    resolve([...combined, ...generalEvents]);
                                },
                                (_) => {
                                    resolve(combined);
                                    return false;
                                }
                            );
                        },
                        (_, error) => {
                            console.error('Error fetching kalyanak events:', error);
                            // Attempt to still fetch generic events even if kalyanak fails
                            tx.executeSql(
                                'SELECT * FROM tblEvents WHERE gregorian_date = ?',
                                [date],
                                (_, { rows: eventRows }) => {
                                    const generalEvents = (eventRows._array || []).map(item => ({
                                        ...item,
                                        type: 'event'
                                    }));
                                    resolve([...events, ...generalEvents]);
                                },
                                (_) => {
                                    resolve(events);
                                    return false;
                                }
                            );
                            return false;
                        }
                    );
                },
                (_, error) => {
                    console.error('Error fetching kshay events:', error);
                    // As a fallback, try fetching generic events only
                    tx.executeSql(
                        'SELECT * FROM tblEvents WHERE gregorian_date = ?',
                        [date],
                        (_, { rows: eventRows }) => {
                            const generalEvents = (eventRows._array || []).map(item => ({
                                ...item,
                                type: 'event'
                            }));
                            resolve(generalEvents);
                        },
                        (_) => {
                            resolve(events);
                            return false;
                        }
                    );
                    return false;
                }
            );
        });
    });
};

export const importInitialData = (kshayData, kalyanakData, calendarData, eventsData = []) => {
    return new Promise((resolve, reject) => {
        database.transaction(tx => {
            // Clear existing data
            tx.executeSql('DELETE FROM tblKshay');
            tx.executeSql('DELETE FROM tblKalyanak');
            tx.executeSql('DELETE FROM tblCalendar');
            tx.executeSql('DELETE FROM tblEvents');

            // Import Kshay data
            kshayData.forEach(item => {
                tx.executeSql(
                    'INSERT INTO tblKshay (gregorian_date, jain_date) VALUES (?, ?)',
                    [item.gregorian_date, item.jain_date]
                );
            });

            // Import Kalyanak data
            kalyanakData.forEach(item => {
                tx.executeSql(
                    'INSERT OR REPLACE INTO tblKalyanak (id, tirthankar_name, event_name, jain_date) VALUES (?, ?, ?, ?)',
                    [item.id, item.tirthankar_name, item.event_name, item.jain_date]
                );
            });

            // Import Calendar data

            const insertCalendarRow = (vals) => {
                tx.executeSql(
                    `INSERT OR REPLACE INTO tblCalendar 
         (id, gregorian_date, jain_month, jain_paksha, jain_date, jain_date_full, is_holiday) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        parseInt(vals[0]),
                        vals[1],
                        vals[2],
                        vals[3],
                        vals[4],
                        vals[5],
                        parseInt(vals[6])
                    ]
                );
            };

            const parseSqlInserts = (sql) => {
                if (typeof sql !== 'string') return [];
                const regex = /INSERT\s+INTO\s+`?tblCalendar`?\s+VALUES\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*\)\s*;?/gi;
                const rows = [];
                let m;
                while ((m = regex.exec(sql)) !== null) {
                    rows.push([m[1], m[2], m[3], m[4], m[5], m[6], m[7]]);
                }
                return rows;
            };

            calendarData.forEach(item => {
                if (Array.isArray(item)) {
                    insertCalendarRow(item);
                } else if (typeof item === 'string') {
                    const rows = parseSqlInserts(item);
                    rows.forEach(vals => insertCalendarRow(vals));
                } else if (item && typeof item === 'object') {
                    const vals = [
                        item.id,
                        item.gregorian_date,
                        item.jain_month,
                        item.jain_paksha,
                        item.jain_date,
                        item.jain_date_full,
                        item.is_holiday ?? 0
                    ];
                    insertCalendarRow(vals);
                }
            });

            // Import Events data
            (eventsData || []).forEach(evt => {
                if (evt && evt.gregorian_date && evt.description) {
                    tx.executeSql(
                        'INSERT INTO tblEvents (gregorian_date, description) VALUES (?, ?)',
                        [evt.gregorian_date, evt.description]
                    );
                }
            });

        },
            error => {
                console.error('Error importing data:', error);
                reject(error);
            },
            async () => {
                console.log("Data imported successfully");

                const calendarRecords = await getTableRecords("tblCalendar", "2025-11-30", "2025-12-30");

                console.log("Calendar Records:", calendarRecords, "2025-11-30", "2025-12-30");

                resolve({
                    calendar: calendarRecords
                });
            });
    });
};

export default database;
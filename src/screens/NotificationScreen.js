import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    StatusBar,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserSettings, updateUserSettings } from '../component/global';
const NotificationScreen = ({ navigation }) => {
    const [tithisEnabled, setTithisEnabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const [kalyanakEnabled, setKalyanakEnabled] = useState(true);
    const [tithisHours, setTithisHours] = useState(1);
    const [kalyanakHours, setKalyanakHours] = useState(1);
    const [fcmToken, setFcmToken] = useState('');
    useEffect(() => {
        requestUserPermission();
    }, []);
    const requestUserPermission = async () => {
        setLoading(true);
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
            await getFcmToken();

        }
    };

    // Get FCM token
    const getFcmToken = async () => {
        try {
            // Check if token already exists in AsyncStorage

            // If no token exists, generate a new one
            const newToken = await messaging().getToken();
            if (newToken) {
                await setFcmToken(newToken);
                console.log('New FCM token:', newToken);
                await getIntialData(newToken)
                // Here you can send this token to your backend
                // await saveTokenToBackend(newToken);
            }
        } catch (error) {
            console.error('Error getting FCM token:', error);
            Alert.alert('Error', 'Failed to get FCM token. Please check your internet connection.');
        }
    };
    const getIntialData = async (fcmToken) => {
        try {
            const response = await getUserSettings(fcmToken);
            console.log('User Settings:', response);
            if (response && response.data) {
                setTithisEnabled(response.data.tithi_reminder == "yes" ? true : false);
                setKalyanakEnabled(response.data.panch_kalyanak == "yes" ? true : false);
                setTithisHours(response.data.tithi_notification_time);
                setKalyanakHours(response.data.kalyanak_notification_time);
                setLoading(false);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error getting user settings:', error);
            setLoading(false);
        }
    };
    const handleSave = async () => {
        setLoading(true);
        const response = await updateUserSettings(tithisEnabled, kalyanakEnabled, tithisHours, kalyanakHours, fcmToken);
        console.log('User Settings:', response);
        if (response.status == 200) {
            Alert.alert('Success', 'User settings updated successfully.');
            navigation.goBack();
        } else {
            setLoading(false);
        }
    };

    const incrementHours = (type) => {
        if (type === 'tithis') {
            setTithisHours(prevHours => {
                const newHours = Number(prevHours) + 1;
                return newHours <= 24 ? newHours : prevHours;
            });
        } else if (type === 'kalyanak') {
            setKalyanakHours(prevHours => {
                const newHours = Number(prevHours) + 1;
                return newHours <= 24 ? newHours : prevHours;
            });
        }
    };

    const decrementHours = (type) => {
        if (type === 'tithis') {
            setTithisHours(prevHours => {
                const newHours = Number(prevHours) - 1;
                return newHours >= 1 ? newHours : prevHours;
            });
        } else if (type === 'kalyanak') {
            setKalyanakHours(prevHours => {
                const newHours = Number(prevHours) - 1;
                return newHours >= 1 ? newHours : prevHours;
            });
        }
    };

    return (
        loading ? (
            <View style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#800020" />
            </View>
        ) : (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#800020" barStyle="light-content" />
                <View style={styles.header}>
                    <Text style={styles.headerText}>Notifications</Text>
                </View>

                <ScrollView style={styles.content}>
                    {/* Tithis Notification Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Tithis Notification</Text>
                            <Switch
                                value={tithisEnabled}
                                onValueChange={setTithisEnabled}
                                trackColor={{ false: "#767577", true: "#767577" }}
                                thumbColor={tithisEnabled ? "#800020" : "#f4f3f4"}
                            />
                        </View>

                        <View style={styles.notifyBeforeContainer}>
                            <Text style={styles.notifyBeforeText}>Notify Before</Text>
                            <View style={styles.hoursContainer}>
                                <TouchableOpacity
                                    style={styles.hourButton}
                                    onPress={() => decrementHours('tithis')}
                                >
                                    <Icon name="remove" size={20} color="#800020" />
                                </TouchableOpacity>
                                <Text style={styles.hoursText}>{tithisHours} Hrs</Text>
                                <TouchableOpacity
                                    style={styles.hourButton}
                                    onPress={() => incrementHours('tithis')}
                                >
                                    <Icon name="add" size={20} color="#800020" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.descriptionText}>
                            Application will notify of Tithis (Shubh 5, Shubh 8, Shubh 14, Vad 8 and Vad 14) and Religious Events Key before 15 hours (Previous day at 9:00 AM) by default.
                        </Text>
                        <Text style={styles.descriptionText}>
                            You can change notification time to receive notification early or late by hours, or enable/disable notifications here.
                        </Text>
                    </View>

                    {/* Kalyanak Notification Section */}
                    <View style={[styles.section, { marginTop: 20 }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Kalyanak Notification</Text>
                            <Switch
                                value={kalyanakEnabled}
                                onValueChange={setKalyanakEnabled}
                                trackColor={{ false: "#767577", true: "#767577" }}
                                thumbColor={kalyanakEnabled ? "#800020" : "#f4f3f4"}
                            />
                        </View>

                        <View style={styles.notifyBeforeContainer}>
                            <Text style={styles.notifyBeforeText}>Notify Before</Text>
                            <View style={styles.hoursContainer}>
                                <TouchableOpacity
                                    style={styles.hourButton}
                                    onPress={() => decrementHours('kalyanak')}
                                >
                                    <Icon name="remove" size={20} color="#800020" />
                                </TouchableOpacity>
                                <Text style={styles.hoursText}>{kalyanakHours} Hrs</Text>
                                <TouchableOpacity
                                    style={styles.hourButton}
                                    onPress={() => incrementHours('kalyanak')}
                                >
                                    <Icon name="add" size={20} color="#800020" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#800020' }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={[styles.buttonText, { color: 'white' }]}>BACK</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#4CAF50' }]}
                        onPress={handleSave}
                    >
                        <Text style={[styles.buttonText, { color: 'white' }]}>SAVE</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#800020',
        padding: 15,
        alignItems: 'center',
    },
    headerText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 15,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    notifyBeforeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    notifyBeforeText: {
        fontSize: 14,
        color: '#555',
    },
    hoursContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    hourButton: {
        padding: 5,
        marginHorizontal: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hoursText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 10,
        color: '#333',
        minWidth: 50,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 10,
        lineHeight: 18,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default NotificationScreen;
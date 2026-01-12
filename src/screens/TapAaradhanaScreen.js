import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n, { getCurrentLanguage } from '../i18n/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllTapAaradhana } from '../component/global';
import LanguageSelectorModal from '../component/LanguageSelectorModal';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


const TapAaradhanaScreen = ({ navigation }) => {
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    // const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);
    const [tapAaradhanaData, setTapAaradhanaData] = useState([]);
    const [language, setLanguage] = useState(i18n.locale);

    useEffect(() => {
        getAllTapAaradhana().then(data => {
            console.log('Tap Aaradhana Data:', data);
            setTapAaradhanaData(data);
        });
    }, [language]);

    useFocusEffect(
        useCallback(() => {
            setLanguage(i18n.locale);
            return undefined;
        }, [])
    );

    const handleItemPress = (item) => {
        const tapName = i18n.locale === 'gu' ? item.name_gujarati : i18n.locale === 'hi' ? item.name_hindi : item.name;
        const tapDetail = i18n.locale === 'gu' ? item.details_gujarati : i18n.locale === 'hi' ? item.details_hindi : item.details;
        navigation.navigate('TapAradhnaDetail', {
            tapName: tapName,
            tapNameEnglish: item.name,
            tapNameGujarati: item.name_gujarati,
            tapNameHindi: item.name_hindi,

            tapDetail: tapDetail,
            pachkkhan: item.pachakhan_details,
            tapData: item // Pass the entire tap data object
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: item.color }]}
            onPress={() => handleItemPress(item)}
        >
            <Text style={styles.title}>
                {i18n.locale === 'gu' ? item.name_gujarati : i18n.locale === 'hi' ? item.name_hindi : item.name}
            </Text>


            <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9E1B17" />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {i18n.locale === 'gu' ? 'તપ / આરાધના' : i18n.locale === 'hi' ? 'तप /आराधना' : 'Tap / Aaradhana'}
                </Text>
                <TouchableOpacity style={styles.headerRight} onPress={() => setShowLanguageModal(true)}>
                    <Ionicons name="language" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <FlatList
                    data={tapAaradhanaData}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            </View>
            <LanguageSelectorModal
                visible={showLanguageModal}
                onClose={() => setShowLanguageModal(false)}
                currentLang={i18n.locale}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',

    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#000000ff',
        paddingVertical: 15,
        paddingHorizontal: 10,
        elevation: 3,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,

    },
    listContainer: {
        paddingBottom: 20,

    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        borderRadius: 10,
        paddingTop: 15,
        paddingLeft: 15,
        paddingRight: 15,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
        flex: 1,
    },
    time: {
        fontSize: 14,
        color: '#666',
    },
});

export default TapAaradhanaScreen;

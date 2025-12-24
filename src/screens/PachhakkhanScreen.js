import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import i18n from '../i18n/i18n';
import { getFrontPanchakhan } from '../component/global';
import LanguageSelectorModal from '../component/LanguageSelectorModal';

const PachhakkhanScreen = ({ navigation }) => {
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [panchakhan, setPanchakhan] = useState([]);
    const [language, setLanguage] = useState(i18n.locale);
    useEffect(() => {
        setLanguage(i18n.locale);
        const loadPanchakhan = async () => {
            try {
                setLoading(true);
                const events = await getFrontPanchakhan();
                console.log("Panchakhan events:", events)
                setPanchakhan(events.data);

            } catch (err) {
                console.error("Error fetching panchakhan events:", err);
            } finally {
                setLoading(false);
            }
        };

        loadPanchakhan();
    }, [i18n.locale]);

    const handlePachhakkhanPress = (item) => {
        // Navigate to the detail screen with the selected item ID

        const content = language == "en" ? item.name_english : language == "gu" ? item.name_gujarati : item.name_hindi;


        navigation.navigate('PachhakkhanDetail', {
            pachhakkhanId: item.id,
            title: content,
            content: {
                gujarati: item.pachakhan_details.details_gujarati,
                hindi: item.pachakhan_details.details_hindi,
                english: item.pachakhan_details.details_english,
                detail: item.pachakhan_details.details_detail,
                audio: item.pachakhan_details.pachakhan_audio
            }

        });
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : (
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{i18n.t('tabs.pachakkhan')}</Text>
                        <TouchableOpacity style={styles.headerRight} onPress={() => setShowLanguageModal(true)}>
                            <Icon name="language" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Pachhakkhan List */}
                    <ScrollView style={styles.listContainer}>
                        {panchakhan.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={() => handlePachhakkhanPress(item)}
                            >
                                <View style={styles.menuItemContent}>
                                    <Text style={styles.menuItemTitle}>
                                        {language == "en" ? item.name_english : language == "gu" ? item.name_gujarati : item.name_hindi}
                                    </Text>
                                </View>
                                <Icon name="chevron-forward" size={20} color="#666" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            <LanguageSelectorModal
                visible={showLanguageModal}
                onClose={() => setShowLanguageModal(false)}
                currentLang={language}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#9E1B17',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#9E1B17',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerRight: {
        width: 30,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 0,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: 16,
        color: '#333',
        marginBottom: 2,
    },
    menuItemSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    emptyCell: {
        flex: 1,
    },
});

export default PachhakkhanScreen;

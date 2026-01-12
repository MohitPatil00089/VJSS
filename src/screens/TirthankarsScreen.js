import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Modal,
    TouchableWithoutFeedback,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { convertDigitsOnly, formatJainDate } from '../utils/numberConverter';
import i18n from '../i18n/i18n';
import { getFrontPanchKalyanaks, getFrontThirthankar } from '../component/global';
import LanguageSelectorModal from '../component/LanguageSelectorModal';

const TirthankarsScreen = ({ navigation, route }) => {


    const tirthankarDetails = {
        1: {
            name: 'Shree Aadinath',
            moksha: 'Posh Vad 13',
            kevalgyn: 'Maha Vad 11',
            diksha: 'Fagan Vad 8',
            janma: 'Fagan Vad 8',
            chyavan: 'Jeth Vad 4'
        },
        2: {
            name: 'Shree Ajitnath',
            moksha: 'Chaitra Sud 5',
            kevalgyn: 'Posh Sud 11',
            diksha: 'Maha Sud 9',
            janma: 'Maha Sud 8',
            chyavan: 'Vaishakh Sud 13'
        },
        3: {
            name: 'Shree Sambhavnath',
            moksha: 'Chaitra Sud 5',
            kevalgyn: 'Aasho Vad 5',
            diksha: 'Magsar Sud 15 (Poonam)',
            janma: 'Magsar Sud 14',
            chyavan: 'Fagan Sud 8'
        },
        4: {
            name: 'Shree Abhinandan Swami',
            moksha: 'Vaishakh Sud 8',
            kevalgyn: 'Posh Sud 14',
            diksha: 'Maha Sud 12',
            janma: 'Maha Sud 2',
            chyavan: 'Vaishakh Sud 4'
        },
        5: {
            name: 'Shree Sumatinath',
            moksha: 'Chaitra Sud 9',
            kevalgyn: 'Chaitra Sud 11',
            diksha: 'Vaishakh Sud 9',
            janma: 'Vaishakh Sud 8',
            chyavan: 'Shravan Sud 2'
        },
        6: {
            name: 'Shree Padmaprabh Swami',
            moksha: 'Chaitra Sud 9',
            kevalgyn: 'Chaitra Sud 11',
            diksha: 'Aasho Vad 13',
            janma: 'Aasho Vad 12',
            chyavan: 'Posh Vad 6'
        },
        7: {
            name: 'Shree Suparshvanath',
            moksha: 'Maha Vad 7',
            kevalgyn: 'Maha Vad 6',
            diksha: 'Jeth Sud 13',
            janma: 'Jeth Sud 12',
            chyavan: 'Shravan Vad 8'
        },
        8: {
            name: 'Shree Chandraprabh Swami',
            moksha: 'Shravan Vad 7',
            kevalgyn: 'Maha Vad 7',
            diksha: 'Magsar Vad 13',
            janma: 'Magsar Vad 12',
            chyavan: 'Fagan Vad 5'
        },
        9: {
            name: 'Shree Suvidhinath',
            moksha: 'Bhadarva Sud 9',
            kevalgyn: 'Kartak Sud 3',
            diksha: 'Kartak Vad 6',
            janma: 'Kartak Vad 5',
            chyavan: 'Maha Vad 9'
        },
        10: {
            name: 'Shree Sheetalnath',
            moksha: 'Chaitra Vad 2',
            kevalgyn: 'Magsar Vad 14',
            diksha: 'Posh Vad 13',
            janma: 'Posh Vad 12',
            chyavan: 'Chaitra Vad 6'
        },
        11: {
            name: 'Shree Shreyansnath',
            moksha: 'Ashadh Vad 3',
            kevalgyn: 'Posh Vad Amaas',
            diksha: 'Maha Vad 13',
            janma: 'Maha Vad 12',
            chyavan: 'Vaishakh Vad 6'
        },
        12: {
            name: 'Shree Vasupujya Swami',
            moksha: 'Ashadh Sud 14',
            kevalgyn: 'Maha Sud 2',
            diksha: 'Maha Vad Amaas',
            janma: 'Maha Vad 14',
            chyavan: 'Jeth Sud 9'
        },
        13: {
            name: 'Shree Vimalnath',
            moksha: 'Jeth Vad 7',
            kevalgyn: 'Posh Sud 6',
            diksha: 'Maha Sud 4',
            janma: 'Maha Sud 3',
            chyavan: 'Vaishakh Sud 12'
        },
        14: {
            name: 'Shree Anantnath',
            moksha: 'Chaitra Sud 5',
            kevalgyn: 'Chaitra Vad 14',
            diksha: 'Chaitra Vad 14',
            janma: 'Chaitra Vad 13',
            chyavan: 'Ashadh Vad 7'
        },
        15: {
            name: 'Shree Dharmanath',
            moksha: 'Jeth Sud 5',
            kevalgyn: 'Posh Sud 15 (Poonam) ',
            diksha: 'Maha Sud 12',
            janma: 'Maha Sud 3',
            chyavan: 'Vaishakh Sud 7'
        },
        16: {
            name: 'Shree Shantinath',
            moksha: 'Vaishakh Vad 13',
            kevalgyn: 'Posh Sud 9',
            diksha: 'Vaiskh Vad 14',
            janma: 'Vaishakh Vad 13',
            chyavan: 'Shravan Vad 7'
        },
        17: {
            name: 'Shree Kunthunath',
            moksha: 'Chaitra Vad 1',
            kevalgyn: 'Chaitra Vad 5',
            diksha: 'Chaitra Vad 5',
            janma: 'Chaitra Vad 14',
            chyavan: 'Ashadh Vad 9'
        },
        18: {
            name: 'Shree Arnath',
            moksha: 'Magsar Sud 10',
            kevalgyn: 'Kartik Sud 12',
            diksha: 'Magsar Sud 11',
            janma: 'Magsar Sud 10',
            chyavan: 'Fagan Sud 2'
        },
        19: {
            name: 'Shree Mallinath',
            moksha: 'Fagan Sud 12',
            kevalgyn: 'Magsar Sud 11',
            diksha: 'Magsar Sud 11',
            janma: 'Magsar Sud 11',
            chyavan: 'Fagan Sud 4'
        },
        20: {
            name: 'Shree Munisuvrata Swami',
            moksha: 'Vaishakh Vad 9',
            kevalgyn: 'Shravan Vad 12',
            diksha: 'Fagan Sud 12',
            janma: 'Vaishakh Vad 8',
            chyavan: 'Shravan Sud 15 (Poonam)'
        },
        21: {
            name: 'Shree Naminath',
            moksha: 'Chaitra Vad 10',
            kevalgyn: 'Magsar Sud 11',
            diksha: 'Jeth Vad 9',
            janma: 'Ashadh Vad 8',
            chyavan: 'Aasho Sud 15 (Poonam)'
        },
        22: {
            name: 'Shree Neminath',
            moksha: 'Ashadh Sud 8',
            kevalgyn: 'Bhadarva Vad Amaas',
            diksha: 'Shravan Sud 6',
            janma: 'Shravan Sud 5',
            chyavan: 'Aasho Vad 12'
        },
        23: {
            name: 'Shree Parshwnath',
            moksha: 'Shravan Sud 8',
            kevalgyn: 'Fagan Vad 4',
            diksha: 'Magsar Vad 11',
            janma: 'Magsar Vad 10',
            chyavan: 'Fagan Vad 4'
        },
        24: {
            name: 'Shree Mahavir Swami',
            moksha: 'Aasho Vad Amaas',
            kevalgyn: 'Vaishakh Sud 10',
            diksha: 'Kartak Vad 10',
            janma: 'Chaitra Sud 13',
            chyavan: 'Ashadh Sud 6'
        }
    };

    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);

    const [tirthankars, setTirthankars] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState(i18n.locale);
    const [selectedDate, setSelectedDate] = useState(route.params?.selectedDate || new Date().toISOString().split('T')[0]);

    // Get all tirthankar images
    useEffect(() => {
        setLanguage(i18n.locale);
        const loadTirthankars = async () => {
            // try {
            //     const tirthankarList = [
            //         { id: 1, name: 'Shri Adinath Bhagwan', image: require('./../assets/tirthankara/01ShriAdinathBhagwan.jpg') },
            //         { id: 2, name: 'Shri Ajitnath Bhagwan', image: require('./../assets/tirthankara/02ShriAjitnathBhagwan.jpg') },
            //         { id: 3, name: 'Shri Sambhavnath Bhagwan', image: require('./../assets/tirthankara/03ShriSambhavnathBhagwan.jpg') },
            //         { id: 4, name: 'Shri Abhinandan Swami', image: require('./../assets/tirthankara/04ShriAbhinandanSwami.jpg') },
            //         { id: 5, name: 'Shri Sumatinath Bhagwan', image: require('./../assets/tirthankara/05ShriSumatinathBhagwan.jpg') },
            //         { id: 6, name: 'Shri Padmaprabhu Swami', image: require('./../assets/tirthankara/06ShriPadmaprabhuSwami.jpg') },
            //         { id: 7, name: 'Shri Suparshva Bhagwan', image: require('./../assets/tirthankara/07ShriSuparshvaBhagwan.jpg') },
            //         { id: 8, name: 'Shri Chandraprabhu Swami', image: require('./../assets/tirthankara/08ShriChandraprabhuSwami.jpg') },
            //         { id: 9, name: 'Shri Suvidhinath Swami', image: require('./../assets/tirthankara/09ShriSuvidhinathSwami.jpg') },
            //         { id: 10, name: 'Shri Shitalnath Bhagwan', image: require('./../assets/tirthankara/10ShriShitalnathBhagwan.jpg') },
            //         { id: 11, name: 'Shri Shreyanshnath Swami', image: require('./../assets/tirthankara/11ShriShreyanshnathSwami.jpg') },
            //         { id: 12, name: 'Shri Vasupujya Swami', image: require('./../assets/tirthankara/12ShriVasupujyaSwami.jpg') },
            //         { id: 13, name: 'Shri Vimalnath Bhagwan', image: require('./../assets/tirthankara/13ShriVimalnathBhagwan.jpg') },
            //         { id: 14, name: 'Shri Anantnath Bhagwan', image: require('./../assets/tirthankara/14ShriAnantnathBhagwan.jpg') },
            //         { id: 15, name: 'Shri Dharmanath Bhagwan', image: require('./../assets/tirthankara/15ShriDharmanathBhagwan.jpg') },
            //         { id: 16, name: 'Shri Shantinath Bhagwan', image: require('./../assets/tirthankara/16ShriShantinathBhagwan.jpg') },
            //         { id: 17, name: 'Shri Kunthunath Bhagwan', image: require('./../assets/tirthankara/17ShriKunthunathBhagwan.jpg') },
            //         { id: 18, name: 'Shri Arnath Bhagwan', image: require('./../assets/tirthankara/18ShriArnathBhagwan.jpg') },
            //         { id: 19, name: 'Shri Mallinath Bhagwan', image: require('./../assets/tirthankara/19ShriMallinathBhagwan.jpg') },
            //         { id: 20, name: 'Shri Munisuvrat Swami', image: require('./../assets/tirthankara/20ShriMunisuvratSwami.jpg') },
            //         { id: 21, name: 'Shri Naminath Bhagwan', image: require('./../assets/tirthankara/21ShriNaminathBhagwan.jpg') },
            //         { id: 22, name: 'Shri Neminath Bhagwan', image: require('./../assets/tirthankara/22ShriNeminathBhagwan.jpg') },
            //         { id: 23, name: 'Shri Parshvanath Bhagwan', image: require('./../assets/tirthankara/23ShriParshvanathBhagwan.jpg') },
            //         { id: 24, name: 'Shri Mahavir Swami', image: require('./../assets/tirthankara/24ShriMahavirSwami.jpg') },
            //     ];
            //     setTirthankars(tirthankarList);
            // } catch (error) {
            //     console.error('Error loading tirthankars:', error);
            // }
            try {
                setLoading(true);
                const events = await getFrontThirthankar();
                console.log("Tirthankar events:", events)
                await setTirthankars(events.data);
                setLoading(false);

            } catch (err) {
                console.error("Error fetching tirthankar events:", err);
                setError("Failed to load tirthankar events");
            } finally {
                setLoading(false);
            }
        };

        loadTirthankars();
    }, [i18n.locale]);

    const renderItem = ({ item, index }) => {
        // const translatedName = tirthankarDetails[item.id].name;
        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={async () => {
                    await setSelectedImage(item);
                    console.log("Selected Image:", item);
                    setModalVisible(true);
                }}
            >
                <Text style={styles.index}>{convertDigitsOnly(index + 1, i18n.locale)}</Text>
                <Image source={{ uri: item?.tirthankar_image }} style={styles.image} resizeMode="contain" />
                <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
                    {language === 'gu' ? item?.name_gujarati : language === 'hi' ? item?.name_hindi : item?.name_english}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#9E1B17" />
                </View>
            ) :
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" backgroundColor="#9E1B17" />

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{i18n.t('menu.tirthankars')}</Text>
                        <TouchableOpacity style={styles.headerRight} onPress={() => setShowLanguageModal(true)}>
                            <Ionicons name="language" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Tirthankars Grid */}
                    <FlatList
                        data={tirthankars}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        numColumns={3}
                        contentContainerStyle={styles.grid}
                        columnWrapperStyle={styles.columnWrapper}
                    />

                    {/* Full Screen Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    {selectedImage && (
                                        <>
                                            <Text style={styles.detailTitle}>
                                                {language === 'gu' ? selectedImage?.name_gujarati : language === 'hi' ? selectedImage?.name_hindi : selectedImage?.name_english}
                                            </Text>
                                            <Image
                                                source={{ uri: selectedImage?.tirthankar_image }}
                                                style={styles.fullImage}
                                                resizeMode="contain"
                                            />
                                            <View style={styles.detailsList}>
                                                {selectedImage?.panchkalyanak_details?.map((item, index) => {
                                                    console.log("item", item)
                                                    return (
                                                        item.redirect_date ?
                                                            <TouchableOpacity style={styles.detailRow} key={index} onPress={() => navigation.navigate('Home', {
                                                                selectedDate: item.redirect_date
                                                            })}>
                                                                <Text style={styles.detailLabel}>{language == "gu" ? item.kalynak_name_gujarati : language == "hi" ? item.kalynak_name_hindi : item.kalynak_name}</Text>
                                                                <View style={{ flexDirection: 'row' }}>
                                                                    <Text style={styles.detailValue}>{language == "gu" ? item.tithi_name_gujarati : language == "hi" ? item.tithi_name_hindi : item.tithi_name}</Text>
                                                                    <Icon name="arrow-right" size={24} color="#9E1B17" />
                                                                </View>
                                                            </TouchableOpacity> :
                                                            <View style={styles.detailRow} key={index}>
                                                                <Text style={styles.detailLabel}>{language == "gu" ? item.kalynak_name_gujarati : language == "hi" ? item.kalynak_name_hindi : item.kalynak_name}</Text>
                                                                <Text style={styles.detailValue}>{language == "gu" ? item.tithi_name_gujarati : language == "hi" ? item.tithi_name_hindi : item.tithi_name}</Text>
                                                            </View>
                                                    )
                                                })}

                                            </View>
                                        </>
                                    )}
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Icon name="close" size={30} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </View>}
            <LanguageSelectorModal
                visible={showLanguageModal}
                onClose={() => setShowLanguageModal(false)}
                currentLang={currentLanguage}
            />
        </SafeAreaView>
    );
};

const { width, height } = Dimensions.get('window');
const itemSize = (width - 40) / 3;

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#000',
        paddingVertical: 15,
        paddingHorizontal: 15,
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
    grid: {
        padding: 10,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    itemContainer: {
        width: itemSize - 10,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    index: {
        fontSize: 12,
        color: '#fff',
        marginBottom: 2,
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#9E1B17',
        paddingHorizontal: 4,
        borderRadius: 2,
        borderBottomRightRadius: 10,
        zIndex: 10
    },
    image: {
        width: itemSize - 30,
        height: itemSize - 30,
        borderRadius: 4,
    },
    name: {
        marginTop: 5,
        fontSize: 10,
        textAlign: 'center',
        color: '#333',
        fontWeight: '500',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#FFFFFF',
    },
    fullImage: {
        width: 300,
        height: 300,
        borderWidth: 2,
        borderColor: '#9E1B17',
        borderRadius: 12,
    },
    detailTitle: {
        color: '#9E1B17',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    detailsList: {
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(158, 27, 23, 0.15)',
    },
    detailLabel: {
        color: '#9E1B17',
        fontSize: 14,
    },
    detailValue: {
        color: '#9E1B17',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 12,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: '#9E1B17',
        borderRadius: 20,
        padding: 10,
    },
});

export default TirthankarsScreen;
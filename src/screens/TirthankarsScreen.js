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
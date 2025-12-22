import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import i18n, { getCurrentLanguage } from '../i18n/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';

export const useLanguage = () => {
    const [language, setLanguage] = useState(getCurrentLanguage());

    useEffect(() => {
        const interval = setInterval(() => {
            const currentLang = getCurrentLanguage();
            if (currentLang !== language) {
                setLanguage(currentLang);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [language]);

    return language;
};

const TapAaradhanaScreen = ({ navigation }) => {
    const handleTapPress = (item) => {
        // Navigate to the detail screen with the selected tap data
        navigation.navigate('TapAradhnaDetail', {
            tapId: item.id,
            tapName: item.tapName,
            tapDetail: item.tapDetail,
            pachkkhan: item.pachkkhan || [],
            tapData: item // Pass the entire tap data object
        });
    };
    const language = useLanguage();

    // Tap Aaradhana data (from user-provided list)
    const tapAaradhanaData = [
        {
            id: '1',
            tapName: 'Ekasanu',
            tapDetail:
                'In Ekasanu, Eat only once in a day, Ekasanu needs to do while sitting at one place within less than 48 minutes. Other than that don’t eat or drink anything except boiled water. Boiled water can have up to sunset only. By doing Ekasanu, a person can shed karmas equivalent to 1 million years (10 Lac) of hell life – i.e. karma nirjara.',
            pachkkhan: ['ekasanu', 'panhar'],
            icon: 'restaurant',
            color: '#4CAF50',
            ekasanu: {
                gujarati: 'ઉગ્ગએ સૂરે, નમુક્કાર-સહિઅં, પોરિસિં, મુટ્ઠિસહિઅં, પચ્ચક્ ખાઇ (પચ્ચક્ ખામિ); ... એગાસણં બિયાસણં ...',
                hindi: 'उग्गए सूरे, नमुक्कार-सहिअं, पोरिसिं, मुट्ठिसहिअं, पच्चक्खाइ (पच्चक्खामि); ... एकासनं बियासनं ...',
                english: 'Uggae Sure, Namukkaar-Sahiam, Porisim, Mutthisahim, Pachchakkhaai ... Ekaasanam, Biyaasanam ...',
                detail: 'Ekasanu: Eat only once in a day within 48 minutes while sitting at one place; otherwise only boiled water till sunset. Biyasanu: Don’t eat or drink until Two Prahars after sunrise; then take food after Navkar 3 times.',
                audio: '4. Ekasanu_Biyasanu Pachhakkhan_Audio'
            },
        },
        {
            id: '2',
            tapName: 'Biyasanu',
            tapDetail:
                'In Biyasanu, don’t eat or drink anything until Two Prahars time after the sunrise, then sit at one place, fold your hand(Muththi vaalavi or handful), recite Navkar 3 times and then take food or water.',
            pachkkhan: ['ekasanu', 'panhar'],
            icon: 'restaurant-menu',
            color: '#2196F3',
            biyasanu: {
                gujarati: 'બિયાસણં',
                hindi: 'Biyasanam',
                english: 'Biyasanu',
                detail: 'Biyasanu: Don’t eat or drink anything until Two Prahars after sunrise; then take food after Navkar 3 times.',
                audio: '5. Ekasanu_Biyasanu Pachhakkhan_Audio'
            }
        },
        {
            id: '3',
            tapName: 'Ayambil',
            tapDetail:
                'In Ayambil, Eat only once in a day, don’t eat any Vigai-Fruits-Vegetables, and Ayambil needs to do while sitting at one place within less than 48 minutes. Other than that don’t eat or drink anything except boiled water. Boiled water can have up to sunset only. By doing Ayambil, a person can shed karmas equivalent to 100 billion years (1000 crore years) of hell life – i.e. karma nirjara.',
            pachkkhan: ['ayambil', 'panhar'],
            icon: 'spa',
            color: '#9C27B0',
            ayambil: {
                gujarati: 'ઉગ્ગએ સૂરે, નમુક્કાર-સહિઅં, પોરિસિં, સાડ્ઢપોરિસિં, મુટ્ઠિસહિઅં, ... આયંબિલં પચ્ચક્ ખાઇ ...',
                hindi: 'उग्गए सूरे, नमुक्कार-सहिअं, पोरिसिं, साड्ढपोरिसिं, ... आयंबिलं पच्चक् खाइ ...',
                english: 'Uggae Sure, Namukkaar-Sahiam, Porisim, Saaddhaporisim, ... Aayambilam Pachchakkhaai ...',
                detail: 'Ayambil: Eat once; no vigai/fruits/vegetables; finish within 48 minutes sitting at one place; only boiled water till sunset.',
                audio: '5-AyambilPachhakkhan'
            },
        },
        {
            id: '4',
            tapName: 'Tivihar Upvaas',
            tapDetail:
                "In Upvas, Don't eat or drink anything except boiled water. Boiled water can be drunk from Porsi to sunset Only. By doing Upvas, a person can shed karmas equivalent to 1000 billion years(10000 Crore years) of hell life – i.e. karma nirjara.",
            pachkkhan: ['tiviharUpvaas', 'panhar'],
            icon: 'brightness-3',
            color: '#FF9800',
            tiviharUpvaas: {
                gujarati: 'સૂરે ઉગ્ગએ અબ્ભત્તટ્ઠં ...',
                hindi: 'सूरे उग्गए अब्भत्तट्ठं ...',
                english: 'Sure, Uggae, Abbhattattham ...',
                detail: 'Tivihar Upvaas: Do not eat or drink anything except boiled water from Porsi to sunset only.',
                audio: '6-TiviharUpvaasPachhakkhan'
            },
        },
        {
            id: '5',
            tapName: 'Chovihar Upvaas',
            tapDetail:
                "In Chauvihar Upvas, Don't eat or drink anything. Dont drink even Boiled water too. By doing Upvas, a person can shed karmas equivalent to 1000 billion years(10000 Crore years) of hell life – i.e. karma nirjara.",
            pachkkhan: ['choviharUpvaas', 'choviharUpvaasEvening'],
            icon: 'brightness-4',
            color: '#795548',
            choviharUpvaas: {
                gujarati: 'સૂરે ઉગ્ગએ અબ્ભત્તટ્ઠં ... ચઉવ્વિહં ...',
                hindi: 'सूरे उग्गए अब्भत्तट्ठं ... चउव्विहं ...',
                english: 'Sure, Uggae, Abbhattattham ... Chauviham ...',
                detail: 'Chauvihar Upvaas: Don’t eat or drink anything at all; not even boiled water.',
                audio: '7-ChoviharUpvaasPachhakkhan'
            },
        },
        {
            id: '6',
            tapName: 'Chhath Pachhakkhan',
            tapDetail: 'Coming Soon',
            pachkkhan: ['chhath', 'panhar'],
            icon: 'filter-6',
            color: '#F44336',
            chhath: {
                gujarati: 'Coming Soon',
                hindi: 'Coming Soon',
                english: 'Coming Soon',
                detail: 'By doing Chhath, a person can shed karmas equivalent to 10000 billion years (1 lakh crore years) of hell life – i.e. karma nirjara.',
                audio: '8. Chhath_Audio'
            },
        },
        {
            id: '7',
            tapName: 'Attham Pachhakkhan',
            tapDetail: 'Coming Soon',
            pachkkhan: ['attham', 'panhar'],
            icon: 'filter-8',
            color: '#3F51B5',
            attham: {
                gujarati: 'Coming Soon',
                hindi: 'Coming Soon',
                english: 'Coming Soon',
                detail: 'By doing Attham, a person can shed karmas equivalent to 100000 billion years (10 lakh crore years) of hell life – i.e. karma nirjara.',
                audio: '9. Attham_Audio'
            },
        },
        {
            id: '8',
            tapName: 'Desavagasik Pachhakkhan',
            tapDetail: 'Coming Soon',
            pachkkhan: ['deshavagasik'],
            icon: 'public',
            color: '#009688',
            deshavagasik: {
                gujarati: 'Coming Soon',
                hindi: 'Coming Soon',
                english: 'Coming Soon',
                detail: '',
                audio: '14-DeshavagasikPachhakkhan'
            },
        },
        {
            id: '9',
            tapName: 'Tivihar',
            tapDetail:
                'In Tivihar one does not take food of any kind including liquids except water after the sunset until the sunrise of next day but can take water.',
            pachkkhan: ['tiviharUpvaas'],
            icon: 'brightness-3',
            color: '#673AB7',
            tivihar: {
                gujarati: 'દિવસચરિમં પચ્ચક્ ખાઇ ...',
                hindi: 'दिवसचरिमं पच्चक् खाइ ...',
                english: 'Divasacharimam, Pachchakkhaai ...',
                detail: 'Tivihar: After sunset until sunrise, no food or liquids except water (water allowed).',
                audio: '12-TiviharPachhakkhan'
            },
        },
        {
            id: '10',
            tapName: 'Duvihaar',
            tapDetail:
                'In Duvihar one does not take food of any kind including liquids except water and medicine after the sunset until the sunrise of next day but can take water and medicine.',
            pachkkhan: ['duvihaar'],
            icon: 'brightness-2',
            color: '#FF5722',
            duvihaar: {
                gujarati: 'દિવસચરિમં પચ્ચક્ ખાઇ ... દુવિહં ...',
                hindi: 'दिवसचरिमं पच्चक् खाइ ... दुविहं ...',
                english: 'Divasacharimam, Pachchakkhaai ... Duviham ...',
                detail: 'Duvihar: After sunset until sunrise, no food/liquids except water and medicine (both allowed).',
                audio: '13-DuvihaarPachhakkhan'
            },
        },
        {
            id: '11',
            tapName: 'Chovihar',
            tapDetail:
                'In Chovihar, one does not take any food or any liquids after the sunset until the sunrise next day.',
            pachkkhan: ['chovihar'],
            icon: 'brightness-1',
            color: '#E91E63',
            chovihar: {
                gujarati: 'દિવસચરિમં પચ્ચક્ ખાઇ ... ચઉવ્વિહં ...',
                hindi: 'दिवसचरिमं पच्चक् खाइ ... चउव्विहं ...',
                english: 'Divasacharimam, Pachchakkhaai ... Chauviham ...',
                detail: 'Chovihar: No food or any liquids after sunset until sunrise next day.',
                audio: '11-ChoviharUpvaasEveningPachhakkhan'
            },
        },
    ];

    const handleItemPress = (item) => {
        navigation.navigate('TapAradhnaDetail', {
            tapName: item.tapName,
            tapDetail: item.tapDetail,
            pachkkhan: item.pachkkhan,
            tapData: item // Pass the entire tap data object
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: item.color }]}
            onPress={() => handleItemPress(item)}
        >
            <Text style={styles.title}>
                {i18n.t(
                    `tapAaradhana.${(item?.tapName || '')
                        .trim()
                        .toLowerCase()
                        .replace(/\s+(\w)/g, (_, c) => c.toUpperCase())}`
                )}
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
                    {language === 'gu' ? 'તપ / આરાધના' : language === 'hi' ? 'तप /आराधना' : 'Tap / Aaradhana'}
                </Text>
                <View style={styles.headerRight} />
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
        backgroundColor: '#9E1B17',
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

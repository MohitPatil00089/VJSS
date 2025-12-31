import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n from '../i18n/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageSelectorModal from '../component/LanguageSelectorModal';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function TapAradhnaDetailScreen({ route, navigation }) {
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const { tapName, tapNameGujarati, tapNameHindi, tapNameEnglish, tapDetail, pachkkhan } = route.params || {};
    const [language, setLanguage] = useState(i18n.locale);
    useEffect(() => {
        setLanguage(i18n.locale);
    }, [i18n.locale]);

    useFocusEffect(
        useCallback(() => {
            setLanguage(i18n.locale);
            return undefined;
        }, [])
    );

    const translatedTitle = useMemo(() => {
        const raw = route.params?.tapData;
        if (!raw) return route.params?.tapName || '';
        return language === 'gu' ? raw.name_gujarati
            : language === 'hi' ? raw.name_hindi
                : raw.name_english;
    }, [language, route.params?.tapData]);

    const translatedDetail = useMemo(() => {
        const raw = route.params?.tapData;
        if (!raw) return route.params?.tapDetail || '';
        return language === 'gu' ? raw.details_gujarati
            : language === 'hi' ? raw.details_hindi
                : raw.details_english;
    }, [language, route.params?.tapData]);

    const CONTENT = {
        navkarshi: {
            gujarati: 'ઉગ્ગએ સૂરે, નમુક્કાર-સહિઅં, મુટ્ઠિસહિઅં, પચ્ચક્ખાઇ (પચ્ચક્ખામિ); ચઉવ્વિહં પિ આહારં, અસણં, પાણં, ખાઇમં, સાઇમં, અન્નત્થણાભોગેણં, સહસાગારેણં, મહત્તરાગારેણં,સવ્વસમાહિ-વત્તિયાગારેણં વોસિરઈ (વોસિરામિ).',
            hindi: 'उग्गए सूरे, नमुक्कार-सहिअं, मुट्ठिसहिअं, पच्चक्खाइ (पच्चक्खामि); चउव्विहं पि आहारं, असणं, पाणं, खाइमं, साइमं, अन्नत्थणाभोगेणं,सहसागारेणं, महत्तरागारेणं, सव्वसमाहि-वत्तियागारेणं वोसिरई (वोसिरामि).',
            english: 'Uggae Sure, Namukkaara-Sahiam, Mutthisahiam, Pachchakkhaai (Pachchakkhaami), Chauviham Pi, Aahaaram, Asanam, Paanam, Khaaimam, Saaimam, Annathanaabhogenam, Sahasaagaarenam, Mahattaraagaarenam, Savvasamaahivattiyaa-Gaarenam, Vosirai (Vosiraami).',
            detail: 'For Navkarshi don’t eat or drink anything until 48 minutes after the sunrise, then sit at one place, fold your hand (Muththi vaalavi or handful), recite Navkar 3 times and then take food or water. By doing Navkarshi one day, a person can shed karmas equivalent to 100 years of torture in hell – i.e. karma nirjara.',
            audio: 'navkarshipachhakkhan'
        },
        porshi: {
            gujarati: 'ઉગ્ગએ સૂરે, નમુક્કાર-સહિઅં, પોરિસિં, સાડ્ઢપોરિસિં, મુટ્ઠિસહિઅં, પચ્ચક્ખાઇ (પચ્ચક્ખામિ); ઉગ્ગએ સૂરે, ચઉવ્વિહં પિ આહારં, અસણં, પાણં, ખાઇમં, સાઇમં, અન્નત્થણાભોગેણં, સહસાગારેણં, પચ્છન્નકાલેણં, દિસામોહેણં, સાહુવયણેણં, મહત્તરાગારેણં, સવ્વસમાહિ-વત્તિયાગારેણં વોસિરઈ (વોસિરામિ).',
            hindi: 'उग्गए सूरे, नमुक्कार-सहिअं, पोरिसिं, साड्ढपोरिसिं, मुट्ठिसहिअं, पच्चक्खाइ (पच्चक्खामि); उग्गए सूरे, चउव्विहं पि आहारं, असणं, पाणं, खाइमं, साइमं, अन्नत्थणाभोगेणं, पच्छन्नकालेणं, दिसामोहेणं, साहुवयणेणं, महत्तरागारेणं, सव्वसमाहि-वत्तियागारेણं वोसिरई (वोसिरामि).',
            english: 'Uggae Sure, Namukkaara-Sahiam, Porisim, Saaddhaporisim, Mutthisahiam, Pachchakkhaai (Pachchakkhaami), Uggae Sure, Chauviham Pi, Aahaaram, Asanam, Paanam, Khaaimam, Saaimam, Annathanaabhogenam, Sahasaagaarenam, Pachchhanakaalenam, Disaamohenam, Saahuvayanenam, Mahattaraagaarenam, Savvasamaahivattiyaa-Gaarenam, Vosirai (Vosiraami).',
            detail: 'Porshi: Don’t eat or drink anything until One Prahar after sunrise. Sadhporshi: Don’t eat or drink anything until 1.5 Prahar after sunrise. Then sit at one place, fold your hand, recite Navkar 3 times and then take food or water.',
            audio: 'porshisadporshipachhakkhan'
        },
        purimaddh: {
            gujarati: 'ઉગ્ગએ સૂરે, સૂરે ઉગ્ગએ પુરિમડ્ઢ, અવડ્ઢ, પચ્ચક્ખાઇ (પચ્ચક્ખામિ); ચઉવ્વિહં પિ આહારં, અસણં, પાણં, ખાઇમં, સાઇમં, અન્નત્થણાભોગેણં, સહસાગારેણં, પચ્છન્નકાલેણં, દિસામોહેણં, સાહુવયણેણં, મહત્તરાગારેણં, સવ્વસમાહિ-વત્તિયાગારેણં વોસિરઈ (વોસિરામિ).',
            hindi: 'उग्गए सूरे, सूरे उग्गए पुरिमड्ढ, अवड्ढ, पच्चक्खाइ (पच्चक्खामि); चउव्विहं पि आहारं, असणं, पाणं, खाइमं, साइमं, अन्नत्थणाभोगेणं, सहसागारेणं, पच्छन्नकालेणं, दिसामोहेणं, साहुवयणेणं, महत्तरागारेणं, सव्वसमाहि-वत्तियागारेणं वोसिरई (वोसिरामि).',
            english: 'Uggae Sure, Sure, Uggae, Purimaddh, Avaddh, Pachchakkhaai (Pachchakkhaami), Chauviham Pi, Aahaaram, Asanam, Paanam, Khaaimam, Saaimam, Annathanaabhogenam, Sahasaagaarenam, Pachchhanakaalenam, Disaamohenam, Saahuvayanenam, Mahattaraagaarenam, Savvasamaahivattiyaa-Gaarenam, Vosirai (Vosiraami).',
            detail: 'Purimaddh: Don’t eat or drink anything until Two Prahars after sunrise. Avadhh: Don’t eat or drink anything until Three Prahars after sunrise. Then sit at one place, fold your hand, recite Navkar 3 times and then take food or water.',
            audio: ''
        },
        ekasanu: {
            gujarati: 'ઉગ્ગએ સૂરે, નમુક્કાર-સહિઅં, પોરિસિં, મુટ્ઠિસહિઅં, પચ્ચક્ ખાઇ (પચ્ચક્ ખામિ); ... એગાસણં બિયાસણં ...',
            hindi: 'उग्गए सूरे, नमुक्कार-सहिअं, पोरिसिं, मुट्ठिसहिअं, पच्चक्खाइ (पच्चक्खामि); ... एकासनं बियासनं ...',
            english: 'Uggae Sure, Namukkaar-Sahiam, Porisim, Mutthisahim, Pachchakkhaai ... Ekaasanam, Biyaasanam ...',
            detail: 'Ekasanu: Eat only once in a day within 48 minutes while sitting at one place; otherwise only boiled water till sunset. Biyasanu: Don’t eat or drink until Two Prahars after sunrise; then take food after Navkar 3 times.',
            audio: 'ekasanu_biyasanupachhakkhan_audio'
        },
        ayambil: {
            gujarati: 'ઉગ્ગએ સૂરે, નમુક્કાર-સહિઅં, પોરિસિં, સાડ્ઢપોરિસિં, મુટ્ઠિસહિઅં, ... આયંબિલં પચ્ચક્ ખાઇ ...',
            hindi: 'उग्गए सूरे, नमुक्कार-सहिअं, पोरिसिं, साड्ढपोरिसिं, ... आयंबिलं पच्चक् खाइ ...',
            english: 'Uggae Sure, Namukkaar-Sahiam, Porisim, Saaddhaporisim, ... Aayambilam Pachchakkhaai ...',
            detail: 'Ayambil: Eat once; no vigai/fruits/vegetables; finish within 48 minutes sitting at one place; only boiled water till sunset.',
            audio: 'ayambilpachhakkhan'
        },
        tiviharUpvaas: {
            gujarati: 'સૂરે ઉગ્ગએ અબ્ભત્તટ્ઠં ...',
            hindi: 'सूरे उग्गए अब्भत्तट्ठं ...',
            english: 'Sure, Uggae, Abbhattattham ...',
            detail: 'Tivihar Upvaas: Do not eat or drink anything except boiled water from Porsi to sunset only.',
            audio: 'tiviharupvaaspachhakkhan'
        },
        choviharUpvaas: {
            gujarati: 'સૂરે ઉગ્ગએ અબ્ભત્તટ્ઠં ... ચઉવ્વિહં ...',
            hindi: 'सूरे उग्गए अब्भत्तट्ठं ... चउव्विहं ...',
            english: 'Sure, Uggae, Abbhattattham ... Chauviham ...',
            detail: 'Chauvihar Upvaas: Don’t eat or drink anything at all; not even boiled water.',
            audio: 'choviharupvaaspachhakkhan'
        },
        chhath: {
            gujarati: 'Coming Soon',
            hindi: 'Coming Soon',
            english: 'Coming Soon',
            detail: 'By doing Chhath, a person can shed karmas equivalent to 10000 billion years (1 lakh crore years) of hell life – i.e. karma nirjara.',
            audio: 'chhath_audio'
        },
        attham: {
            gujarati: 'Coming Soon',
            hindi: 'Coming Soon',
            english: 'Coming Soon',
            detail: 'By doing Attham, a person can shed karmas equivalent to 100000 billion years (10 lakh crore years) of hell life – i.e. karma nirjara.',
            audio: 'attham_audio'
        },
        deshavagasik: {
            gujarati: 'Coming Soon',
            hindi: 'Coming Soon',
            english: 'Coming Soon',
            detail: '',
            audio: 'deshavagasikpachhakkhan'
        },
        tivihar: {
            gujarati: 'દિવસચરિમં પચ્ચક્ ખાઇ ...',
            hindi: 'दिवसचरिमं पच्चक् खाइ ...',
            english: 'Divasacharimam, Pachchakkhaai ...',
            detail: 'Tivihar: After sunset until sunrise, no food or liquids except water (water allowed).',
            audio: ''
        },
        panhar: {
            gujarati: 'પાણહાર દિવસચરિમં પચ્ચક્ ખાઇ ...',
            hindi: 'पाणहार दिवसचरिमं पच्चक् खाइ ...',
            english: 'Paanahaar, Divasacharimam, Pachchakkhaai ...',
            detail: 'Panhar: No food or any liquids after sunset until sunrise next day. Taken with Tivihar Upvas, Ayambil, Nivi, Ekasanu or Biyasanu.',
            audio: 'panharpachhakkhan'
        },
        choviharUpvaasEvening: {
            gujarati: 'Coming Soon',
            hindi: 'Coming Soon',
            english: 'Coming Soon',
            detail: '',
            audio: ''
        },
        duvihaar: {
            gujarati: 'દિવસચરિમં પચ્ચક્ ખાઇ ... દુવિહં ...',
            hindi: 'दिवसचरिमं पच्चक् खाइ ... दुविहं ...',
            english: 'Divasacharimam, Pachchakkhaai ... Duviham ...',
            detail: 'Duvihar: After sunset until sunrise, no food/liquids except water and medicine (both allowed).',
            audio: 'duvihaarpachhakkhan'
        },
        chovihar: {
            gujarati: 'દિવસચરિમં પચ્ચક્ ખાઇ ... ચઉવ્વિહં ...',
            hindi: 'दिवसचरिमं पच्चक् खाइ ... चउव्विहं ...',
            english: 'Divasacharimam, Pachchakkhaai ... Chauviham ...',
            detail: 'Chovihar: No food or any liquids after sunset until sunrise next day.',
            audio: 'choviharupvaaseveningpachhakkhan'
        },
    };
    const pachhakkhanData = Array.isArray(pachkkhan)
        ? pachkkhan.map((title, idx) => ({ id: String(idx + 1), title }))
        : [];

    const renderItem = ({ item }) => {

        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                    // console.log(item)
                    const title = language == "gu" ? item?.title?.name_gujarati : language == "hi" ? item?.title?.name_hindi : item?.title?.name_english
                    navigation.navigate('PachhakkhanDetail', {
                        title: title,
                        titleHindi: item?.title?.name_hindi,
                        titleEnglish: item?.title?.name_english,
                        titleGujarati: item?.title?.name_gujarati,
                        content: {
                            gujarati: item.title.details_gujarati,
                            hindi: item.title.details_hindi,
                            english: item.title.details_english,
                            detail: item.title.details_detail,
                            audio: item.title.pachakhan_audio
                        }
                    });
                    console.log('Selected:', item.title);
                }}
            >
                <Text style={styles.itemTitle}>{language == "gu" ? item?.title?.name_gujarati : language == "hi" ? item?.title?.name_hindi : item?.title?.name_english}</Text>
                <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#9E1B17" />
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {language == "gu" ? tapNameGujarati : language == "hi" ? tapNameHindi : tapNameEnglish}

                    </Text>
                    <TouchableOpacity style={styles.headerRight} onPress={() => setShowLanguageModal(true)}>
                        <Ionicons name="language" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <FlatList
                        data={pachhakkhanData}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        contentContainerStyle={styles.listContent}
                        ListFooterComponent={
                            <View style={styles.detailCard}>
                                <Text style={styles.detailTitle}>Detail</Text>
                                <Text style={styles.detailText}>
                                    {tapDetail || ''}
                                </Text>
                            </View>
                        }
                    />
                </View>
            </View>
            <LanguageSelectorModal
                visible={showLanguageModal}
                onClose={() => setShowLanguageModal(false)}
                currentLang={language}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        // padding: 15,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    itemTitle: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
    },

    detailCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginHorizontal: 15,
        marginTop: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    detailText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#555',
    },

    contentText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
});

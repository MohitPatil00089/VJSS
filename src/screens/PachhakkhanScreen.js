import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import i18n from '../i18n/i18n';

const PachhakkhanScreen = ({ navigation }) => {

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

    // Pachhakkhan options with translation keys
    const pachhakkhanOptions = [
        { id: 'navkarshi' },
        { id: 'porshi' },
        { id: 'purimaddh' },
        { id: 'ekasanu' },
        { id: 'ayambil' },
        { id: 'tiviharUpvaas' },
        { id: 'choviharUpvaas' },
        { id: 'chhath' },
        { id: 'attham' },
        { id: 'deshavagasik' },
        { id: 'tivihar' },
        { id: 'panhar' },
        { id: 'choviharUpvaasEvening' },
        { id: 'duvihaar' },
        { id: 'chovihar' },
    ];

    const handlePachhakkhanPress = (itemId) => {
        // Navigate to the detail screen with the selected item ID
        navigation.navigate('PachhakkhanDetail', {
            pachhakkhanId: itemId,
            title: i18n.t(`pachakkhanOptions.${itemId}`),
            content: CONTENT[itemId] || { gujarati: '', hindi: '', english: '', detail: '', audio: '' }
        });
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
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
                    <View style={styles.headerRight} />
                </View>

                {/* Pachhakkhan List */}
                <ScrollView style={styles.listContainer}>
                    {pachhakkhanOptions.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={() => handlePachhakkhanPress(item.id)}
                        >
                            <View style={styles.menuItemContent}>
                                <Text style={styles.menuItemTitle}>
                                    {i18n.t(`pachakkhanOptions.${item.id}`)}
                                </Text>
                                {i18n.locale === 'en' && (
                                    <Text style={styles.menuItemSubtitle}>
                                        {i18n.t(`pachakkhanOptions.${item.id}`, { locale: 'gu' })}
                                    </Text>
                                )}
                            </View>
                            <Icon name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

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

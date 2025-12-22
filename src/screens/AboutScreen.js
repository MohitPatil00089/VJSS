import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n/i18n';

const AboutScreen = ({ navigation }) => {
    const language = i18n.locale;

    const aboutContent = {
        en: {
            p1: "If India is a constellation of several religions, Jainism is the brightest star amongst them for the last two and a half millennia. Our Jain brothers and sisters have always held the flag of Jain Shasan very high wherever they are in the world, and Sydney is no exception. In spite of the din and bustle of Sydney, they managed to take time to perform Pratikaman during Paryushan.",
            p2: "During the 2007 Paryushan, we decided to form an organization where all Jains could congregate and practice this wonderful religion. Since its inception, Vitraag has grown by leaps and bounds, organizing various religious activities and attracting members along the way.",
            p3: "The increasing enthusiasm and involvement of participants from our biannual Snatra Pooja and monthly Samuh Samayik led us to organize our first mega event – a discourse by Munishree Jinchandraji (Bandhu Triputi). Soon after, Vitraag started the e-bulletin ‘Shrutvaani’, arranged group Ayambil Tap and Samuh Ekashna, which attracted devotees all across Sydney.",
            p4: "It was decided to conduct Mahavir Janma Vanchan Mahotsav by displaying all the dreams (14 Swapnas) that occurred to Trishla Mata – the mother of Lord Mahavir. The function became memorable for its huge attendance, cultural programs, and Swami Vatsalya – a first of its kind in Sydney.",
        },

        hi: {
            p1: "यदि भारत अनेक धर्मों का एक नक्षत्र है, तो जैन धर्म पिछले ढाई हज़ार वर्षों से उसमें सबसे चमकता सितारा है। हमारे जैन भाई-बहनों ने दुनिया भर में जहाँ भी वे रहे हैं, जैन शासन का ध्वज हमेशा ऊँचा रखा है और सिडनी भी इसका अपवाद नहीं है। सिडनी की व्यस्तता के बावजूद, उन्होंने पर्युषण के दौरान प्रतिक्रमण के लिए समय निकाला।",
            p2: "2007 के पर्युषण के दौरान, हमने एक ऐसे संगठन की स्थापना का निर्णय लिया जहाँ सभी जैन एकत्र होकर इस महान धर्म का पालन कर सकें। स्थापना के बाद से ही, वीतराग ने विभिन्न धार्मिक गतिविधियों का आयोजन करते हुए तेज़ी से प्रगति की है।",
            p3: "द्विवार्षिक स्नात्र पूजा और मासिक सामूहिक सामायिक में बढ़ते उत्साह और सहभागिता ने हमें पहला भव्य आयोजन करने के लिए प्रेरित किया — मुनिश्री जिनचंद्रजी (बंधु त्रिपुटी) का प्रवचन। इसके बाद वीतराग ने ई-बुलेटिन ‘श्रुतवाणी’ शुरू किया और समूह आयंबिल तप तथा सामूहिक एकाशना का आयोजन किया।",
            p4: "भगवान महावीर की माता त्रिशला माता को आए 14 स्वप्नों के प्रदर्शन के साथ महावीर जन्म वाचन महोत्सव आयोजित करने का निर्णय लिया गया। यह कार्यक्रम अपनी विशाल उपस्थिति, सांस्कृतिक कार्यक्रमों और स्वामी वात्सल्य के लिए स्मरणीय बन गया — जो सिडनी में पहली बार हुआ।",
        },

        gu: {
            p1: "જો ભારત અનેક ધર્મોનો એક તારામંડળ છે, તો જૈન ધર્મ છેલ્લા બે અડધા હજાર વર્ષોથી તેમાં સૌથી તેજસ્વી તારાની જેમ ઝળહળી રહ્યો છે. અમારા જૈન ભાઈ-બહેનોએ વિશ્વના કોઈપણ ખૂણે હોય ત્યાં જૈન શાસનની ધ્વજા હંમેશા ઊંચી રાખી છે અને સિડની પણ તેનો અપવાદ નથી. સિડનીની વ્યસ્તતા છતાં, તેઓ પર્યુષણ દરમ્યાન પ્રતિક્રમણ માટે સમય કાઢતા રહ્યા.",
            p2: "2007ના પર્યુષણ દરમિયાન, અમે એક એવું સંગઠન રચવાનો નિર્ણય લીધો જ્યાં બધા જૈનો એકત્ર થઈને આ અદભૂત ધર્મનું પાલન કરી શકે. સ્થાપનાથી લઈને આજદિન સુધી, વિતરાગે વિવિધ ધાર્મિક પ્રવૃત્તિઓનું આયોજન કરી મોટી પ્રગતિ કરી છે.",
            p3: "અમારી દ્વિવાર્ષિક સ્નાત્ર પૂજા અને માસિક સામૂહિક સામાયિકમાં ભાગ લેનારાઓના વધતા ઉત્સાહથી પ્રેરાઈને અમે પ્રથમ મહા કાર્યક્રમ — મુનિશ્રી જિંચન્દ્રજી (બંધુ ત્રિપુટી)ના પ્રવચનનું આયોજન કર્યું. ત્યારબાદ વિતરાગે ‘શ્રુતવાણી’ ઇ-બુલેટિન શરૂ કરી અને જૂથ આયંબિલ તપ તથા સામૂહિક એકાશણાનું આયોજન કર્યું.",
            p4: "ભગવાન મહાવીરના માતા ત્રિશલા માતાને આવેલા 14 સ્વપ્નોના દર્શન સાથે મહાવીર જન્મ વાચન મહોત્સવ આયોજિત કરવાનો નિર્ણય લેવામાં આવ્યો. આ કાર્યક્રમ તેની વિશાળ હાજરી, સાંસ્કૃતિક કાર્યક્રમો અને સ્વામી વત્સલ્ય માટે યાદગાર બન્યો — જે સિડનીમાં પ્રથમ વખત યોજાયો હતો.",
        },
    };

    const content = aboutContent[language] || aboutContent.en;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9E1B17" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{i18n.t('about')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.text}>{content.p1}</Text>
                <Text style={styles.text}>{content.p2}</Text>
                <Text style={styles.text}>{content.p3}</Text>
                <Text style={styles.text}>{content.p4}</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#9E1B17',
        paddingVertical: 15,
        paddingHorizontal: 10,
        elevation: 3,
    },
    backButton: { padding: 5 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    headerRight: { width: 40 },
    content: { flex: 1 },
    contentContainer: { padding: 16 },
    text: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 12 },
});

export default AboutScreen;

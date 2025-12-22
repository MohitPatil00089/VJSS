import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n/i18n';

const FAQScreen = ({ navigation }) => {
    const language = i18n.locale;
    console.log(language);
    const faqContent = {
        en: {
            q1: "Q: For which locations is this application available?",
            a1: `Adelaide
Ahmedabad
Brisbane
Canberra
Darwin
Hobart
Melbourne
Mumbai
Perth
Surat
Sydney`,
            q2: "Q: Which mobile platforms are compatible with this app?",
            a2: `We have both iPhone and Android apps.
You can search for VJSS on the App Store or Play Store.`,
            q3: "Q: How can I contact VJSS or send feedback?",
            a3: "Drop us an email at vjss_app@vitraagjainsangh.org",
        },

        hi: {
            q1: "प्र: यह एप्लिकेशन किन स्थानों के लिए उपलब्ध है?",
            a1: `एडिलेड
अहमदाबाद
ब्रिस्बेन
कैनबरा
डार्विन
होबार्ट
मेलबर्न
मुंबई
पर्थ
सूरत
सिडनी`,
            q2: "प्र: यह ऐप किन मोबाइल प्लेटफॉर्म पर उपलब्ध है?",
            a2: `यह ऐप iPhone और Android दोनों के लिए उपलब्ध है।
आप App Store या Play Store पर VJSS खोज सकते हैं।`,
            q3: "प्र: VJSS से संपर्क या फीडबैक कैसे भेजें?",
            a3: "हमें vjss_app@vitraagjainsangh.org पर ईमेल करें",
        },

        gu: {
            q1: "પ્ર: આ એપ્લિકેશન કયા સ્થળો માટે ઉપલબ્ધ છે?",
            a1: `એડિલેડ
અમદાવાદ
બ્રિસ્બેન
કેનબેરા
ડાર્વિન
હોબાર્ટ
મેલબોર્ન
મુંબઈ
પર્થ
સુરત
સિડની`,
            q2: "પ્ર: આ એપ કયા મોબાઇલ પ્લેટફોર્મ પર ઉપલબ્ધ છે?",
            a2: `આ એપ iPhone અને Android બંને માટે ઉપલબ્ધ છે.
App Store અથવા Play Store પર VJSS શોધો.`,
            q3: "પ્ર: VJSS નો સંપર્ક અથવા પ્રતિસાદ કેવી રીતે આપવો?",
            a3: "vjss_app@vitraagjainsangh.org પર અમને ઇમેઇલ કરો",
        },
    };

    const content = faqContent[language] || faqContent.en;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9E1B17" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{i18n.t('faq')}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.q}>{content.q1}</Text>
                <Text style={styles.a}>{content.a1}</Text>

                <Text style={styles.q}>{content.q2}</Text>
                <Text style={styles.a}>{content.a2}</Text>

                <Text style={styles.q}>{content.q3}</Text>
                <Text style={styles.a}>{content.a3}</Text>
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
    q: { fontSize: 16, fontWeight: 'bold', color: '#222', marginTop: 12 },
    a: { fontSize: 14, color: '#444', marginTop: 6, lineHeight: 22 },
});

export default FAQScreen;

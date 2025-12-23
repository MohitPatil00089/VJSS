import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n/i18n';
import { getfaq } from '../component/global';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AccordionItem = ({ question, answer, isOpen, onPress }) => {
  const isEmail = answer?.includes('@');

  return (
    <View style={[styles.card, isOpen && styles.activeCard]}>
      <TouchableOpacity
        style={styles.questionHeader}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconCircle}>
          <Icon name="help-outline" size={18} color="#9E1B17" />
        </View>

        <Text style={styles.questionText}>{question}</Text>

        <Icon
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color="#999"
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.answerContainer}>
          <View style={styles.divider} />

          <View style={styles.answerRow}>
            {/* <Icon name="chat-bubble-outline" size={18} color="#666" style={styles.answerIcon} /> */}

            {/* {isEmail ? (
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${answer}`)}>
                <Text style={[styles.answerText, styles.linkText]}>{answer}</Text>
              </TouchableOpacity>
            ) : ( */}
              <Text style={styles.answerText}>{answer}</Text>
            {/* )} */}
          </View>
        </View>
      )}
    </View>
  );
};

const FAQScreen = ({ navigation }) => {
  const language = i18n.locale; // en | hi | gu
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
  (async () => {
    try {
      const res = await getfaq();
      if (res?.data && res.data.length > 0) {
        setList(res.data);
        setExpandedIndex(0);
      }
    } catch (e) {
      console.log('FAQ API error', e);
    } finally {
      setLoading(false);
    }
  })();
}, []);


  const qKey = `${language}_question`;
  const aKey = `${language}_answer`;

  const toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#9E1B17" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#9E1B17" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{i18n.t('faq')}</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {list.map((item, index) => (
          <AccordionItem
            key={item.id || index}
            question={item[qKey] || item.en_question}
            answer={item[aKey] || item.en_answer}
            isOpen={expandedIndex === index}
            onPress={() => toggleExpand(index)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#9E1B17',
    paddingVertical: 15,
    paddingHorizontal: 12,
    elevation: 4,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  contentContainer: {
    padding: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDF0F3',
    overflow: 'hidden',
  },

  activeCard: {
    borderColor: '#9E1B17',
    elevation: 4,
    shadowColor: '#9E1B17',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FCECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1C1E',
  },

  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },

  answerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  answerIcon: {
    marginTop: 2,
    marginRight: 12,
  },

  answerText: {
    fontSize: 14,
    color: '#4F5E71',
    lineHeight: 22,
    flex: 1,
  },

  linkText: {
    color: '#9E1B17',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

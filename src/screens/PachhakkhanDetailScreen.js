import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Alert, ToastAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Sound from 'react-native-sound';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n/i18n';
import LanguageSelectorModal from '../component/LanguageSelectorModal';

const { width } = Dimensions.get('window');

const PachhakkhanDetailScreen = ({ navigation }) => {

    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [language, setLanguage] = useState(i18n.locale);
    const route = useRoute();
    const { title, titleHindi, titleEnglish, titleGujarati, content } = route.params;
    const [activeTab, setActiveTab] = useState('gujarati');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const soundRef = useRef(null);
    const intervalRef = useRef(null);
    console.log("content", content)
    useEffect(() => {
        setLanguage(i18n.locale);
        if (!content?.audio) {
            console.log('No audio URL provided');
            return;
        }

        setIsLoading(true);

        // Stop any existing sound
        if (soundRef.current) {
            soundRef.current.stop();
            soundRef.current.release();
        }

        // Initialize the sound player with the audio URL
        soundRef.current = new Sound(content.audio, '', (error) => {
            setIsLoading(false);
            if (error) {
                console.log('Failed to load sound:', error);
                ToastAndroid.show('Failed to load audio', ToastAndroid.SHORT);
                return;
            }
            console.log('Audio loaded successfully');
            setDuration(soundRef?.current?.getDuration());
        });

        // Clean up on unmount
        return () => {
            if (soundRef.current) {
                soundRef.current.stop();
                soundRef.current.release();
                soundRef.current = null;
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [i18n.locale]);


    // Handle play/pause
    const togglePlayback = () => {
        if (!soundRef.current) return;

        if (isPlaying) {
            soundRef.current.pause();
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        } else {
            soundRef.current.play((success) => {
                if (success) {
                    console.log('Playback finished');
                    setIsPlaying(false);
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                } else {
                    console.log('Playback failed');
                }
            });

            // Update progress every second
            if (!intervalRef.current) {
                intervalRef.current = setInterval(() => {
                    soundRef.current.getCurrentTime((seconds) => {
                        setCurrentTime(seconds);
                    });
                }, 1000);
            }
        }

        setIsPlaying(!isPlaying);
    };

    // Handle slider change
    const onSliderValueChange = (value) => {
        if (soundRef.current) {
            soundRef.current.setCurrentTime(value);
            setCurrentTime(value);
        }
    };

    // Format time (seconds to MM:SS)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    const togglePlayPause = () => {
        if (!soundRef.current) return;

        if (isPlaying) {
            soundRef.current.pause();
            setIsPlaying(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        } else {
            soundRef.current.play((success) => {
                if (success) {
                    console.log('Playback finished');
                    setIsPlaying(false);
                    setCurrentTime(0);
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }
                } else {
                    console.log('Playback failed');
                    ToastAndroid.show('Failed to play audio', ToastAndroid.SHORT);
                }
            });
            setIsPlaying(true);

            // Update progress
            intervalRef.current = setInterval(() => {
                soundRef.current?.getCurrentTime((seconds) => {
                    setCurrentTime(seconds);
                });
            }, 500);
        }
    };


    const selectedContent = content || {
        gujarati: '',
        hindi: '',
        english: '',
        detail: '',
        audio: ''
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
                        {i18n.locale === 'hi' ? titleHindi : i18n.locale === 'gu' ? titleGujarati : titleEnglish}
                    </Text>
                    <TouchableOpacity style={styles.headerRight} onPress={() => setShowLanguageModal(true)}>
                        <Ionicons name="language" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Audio Player */}
                {content?.audio && (
                    <View style={{ backgroundColor: '#f5f5f5', }}>
                        <View style={styles.audioPlayer}>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progress,
                                            { width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }
                                        ]}
                                    />
                                </View>
                                <View style={styles.timeContainer}>
                                    <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={togglePlayPause}
                            style={styles.playButton}
                            disabled={isLoading}
                        >
                            <Icon
                                name={isPlaying ? 'pause' : 'play-arrow'}
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'gujarati' && styles.activeTab]}
                        onPress={() => setActiveTab('gujarati')}
                    >
                        <Text style={[styles.tabText, activeTab === 'gujarati' && styles.activeTabText]}>
                            GUJARATI
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'hindi' && styles.activeTab]}
                        onPress={() => setActiveTab('hindi')}
                    >
                        <Text style={[styles.tabText, activeTab === 'hindi' && styles.activeTabText]}>
                            HINDI
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'english' && styles.activeTab]}
                        onPress={() => setActiveTab('english')}
                    >
                        <Text style={[styles.tabText, activeTab === 'english' && styles.activeTabText]}>
                            ENGLISH
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView style={styles.contentContainer}>
                    <Text style={styles.contentText}>
                        {activeTab === 'gujarati' ? selectedContent.gujarati : activeTab === 'hindi' ? selectedContent.hindi : selectedContent.english}
                    </Text>

                    {/* Detail Section */}
                    {/* <View style={styles.detailContainer}>
                        <Text style={styles.detailHeader}>Detail</Text>
                        <Text style={styles.detailText}>
                            {selectedContent.detail}
                        </Text>
                    </View> */}
                </ScrollView>
            </View>
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
        flex: 1,
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 10,
        textAlign: 'center',
    },
    headerRight: {
        width: 30,
    },
    audioPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginTop: 15,
    },
    progressContainer: {
        flex: 1,
        marginRight: 12,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        marginTop: 4,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        backgroundColor: '#9E1B17',
        width: '0%',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    timeText: {
        fontSize: 12,
        color: '#666',
        width: 50,
        textAlign: 'center',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        alignSelf: 'center',
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#9E1B17',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#8B4513',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#8B4513',
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        padding: 15,
    },
    contentText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        textAlign: 'left',
        marginBottom: 20,
    },
    detailContainer: {
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        padding: 15,
        marginTop: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#8B4513',
    },
    detailHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8B4513',
        marginBottom: 10,
    },
    detailText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
        textAlign: 'left',
    },
});

export default PachhakkhanDetailScreen;

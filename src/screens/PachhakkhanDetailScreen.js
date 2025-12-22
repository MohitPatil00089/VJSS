import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Alert, ToastAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Sound from 'react-native-sound';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

const PachhakkhanDetailScreen = ({ navigation }) => {

    const route = useRoute();
    const { pachhakkhanId, title, content } = route.params;
    const [activeTab, setActiveTab] = useState('gujarati');
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const soundRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        Sound.setCategory('Playback');
        const sound = new Sound(content?.audio, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('Error loading sound:', content?.audio);
                ToastAndroid.show('Audio not available. Coming soon', ToastAndroid.LONG);
                return;
            }

            console.log('Sound loaded successfully');
            setDuration(sound.getDuration());
            soundRef.current = sound;

            intervalRef.current = setInterval(() => {
                sound.getCurrentTime(sec => setCurrentTime(sec));
            }, 1000);
        });

        return () => {
            if (soundRef.current) {
                soundRef.current.stop();
                soundRef.current.release();
            }
            clearInterval(intervalRef.current);
        };
    }, []);


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
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
                        {title}
                    </Text>
                    <View style={styles.headerRight} />
                </View>

                {/* Audio Player */}
                <View style={styles.audioPlayer}>
                    <View style={styles.progressContainer}>
                        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                        <Slider
                            style={styles.progressBar}
                            minimumValue={0}
                            maximumValue={duration || 1}
                            value={currentTime}
                            onSlidingComplete={onSliderValueChange}
                            minimumTrackTintColor="#4CAF50"
                            maximumTrackTintColor="#BDBDBD"
                            thumbTintColor="#4CAF50"
                        />
                        <View style={styles.timeContainer}>

                            <Text style={styles.timeText}>
                                {formatTime(duration)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.controls}>
                        <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                            <Icon
                                name={isPlaying ? 'pause' : 'play-arrow'}
                                size={32}
                                color="#8B4513"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

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
                    <View style={styles.detailContainer}>
                        <Text style={styles.detailHeader}>Detail</Text>
                        <Text style={styles.detailText}>
                            {selectedContent.detail}
                        </Text>
                    </View>
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
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    progressBar: {
        flex: 1,
        height: 4,
        marginHorizontal: 10,
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
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0e6d2',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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

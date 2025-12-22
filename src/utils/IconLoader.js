import { useEffect } from 'react';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Preload the icons to prevent flickering
const loadIcons = async () => {
    // List of all icons used in the app
    const icons = [
        'share-social-outline',
        'notifications-outline',
        'chevron-forward',
    ];

    const iconPromises = icons.map(iconName => {
        return Icon.getImageSource(iconName, 24);
    });

    return Promise.all(iconPromises);
};

export const useIconLoader = () => {
    useEffect(() => {
        loadIcons().catch(console.error);
    }, []);
};

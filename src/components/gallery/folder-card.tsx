import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Image} from 'expo-image';
import {SymbolView} from 'expo-symbols';

import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {Spacing} from '@/constants/theme';
import {useTheme} from '@/hooks/use-theme';
import {GalleryFolder} from '@/services/media-service';

type Props = {
    folder: GalleryFolder;
    onPress: () => void;
};

export function FolderCard({folder, onPress}: Props) {
    const theme = useTheme();

    return (
        <Pressable
            onPress={onPress}
            android_ripple={{color: 'rgba(0, 0, 0, 0.12)', borderless: false}}
            style={({pressed}) => [styles.pressable, pressed && styles.pressed]}>
            <ThemedView type="backgroundElement" style={styles.card}>
                <View style={styles.imageContainer}>
                    {folder.coverUri ? (
                        <Image
                            source={{uri: folder.coverUri}}
                            style={styles.coverImage}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <View style={[styles.placeholder, {backgroundColor: theme.backgroundSelected}]}>
                            <SymbolView
                                name={{ios: 'folder', android: 'folder', web: 'folder'}}
                                size={40}
                                tintColor={theme.textSecondary}
                            />
                        </View>
                    )}

                    {folder.latestMediaType === 'video' && (
                        <View style={styles.videoBadge}>
                            <SymbolView
                                name={{ios: 'video.fill', android: 'videocam', web: 'videocam'}}
                                size={14}
                                tintColor="#ffffff"
                            />
                        </View>
                    )}

                    <View style={styles.countBadge}>
                        <ThemedText type="smallBold" style={styles.countText}>
                            {folder.assetCount.toLocaleString()}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <ThemedText type="subtitle" numberOfLines={1} style={styles.title}>
                        {folder.title}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                        {folder.assetCount === 1 ? '1 item' : `${folder.assetCount.toLocaleString()} items`}
                    </ThemedText>
                </View>
            </ThemedView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressable: {
        flex: 1,
        margin: Spacing.one,
        borderRadius: 20,
        overflow: 'hidden',
    },
    pressed: {
        opacity: 0.9,
        transform: [{scale: 0.98}],
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        position: 'relative',
        backgroundColor: '#1a1a1a',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoBadge: {
        position: 'absolute',
        top: Spacing.two,
        left: Spacing.two,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        paddingHorizontal: Spacing.one + 2,
        paddingVertical: Spacing.half,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    countBadge: {
        position: 'absolute',
        bottom: Spacing.two,
        right: Spacing.two,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        paddingHorizontal: Spacing.two,
        paddingVertical: Spacing.half,
        borderRadius: 12,
    },
    countText: {
        color: '#ffffff',
        fontSize: 11,
    },
    infoContainer: {
        padding: Spacing.two + 2,
        gap: 2,
    },
    title: {
        fontSize: 15,
    },
});

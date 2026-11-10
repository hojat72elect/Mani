import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Image} from 'expo-image';
import {SymbolView} from 'expo-symbols';
import * as MediaLibrary from 'expo-media-library/legacy';
import {ThemedText} from '@/components/themed-text';
import {formatDuration} from '@/services/media-service';
import {Spacing} from '@/constants/theme';

type Props = {
    asset: MediaLibrary.Asset;
    onPress: () => void;
    numColumns: number;
};

export function MediaGridItem({asset, onPress, numColumns}: Props) {
    const isVideo = asset.mediaType === 'video';

    return (
        <Pressable
            onPress={onPress}
            android_ripple={{color: 'rgba(255, 255, 255, 0.3)'}}
            style={({pressed}) => [
                styles.container,
                {margin: 1},
                pressed && styles.pressed,
            ]}>
            <Image
                source={{uri: asset.uri}}
                style={styles.image}
                contentFit="cover"
                transition={150}
                recyclingKey={asset.id}
            />

            {isVideo && (
                <View style={styles.videoOverlay}>
                    <SymbolView
                        name={{ios: 'play.fill', android: 'play_arrow'}}
                        size={12}
                        tintColor="#ffffff"
                    />
                    <ThemedText style={styles.durationText}>
                        {formatDuration(asset.duration)}
                    </ThemedText>
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        aspectRatio: 1,
        position: 'relative',
        backgroundColor: '#1f1f1f',
        overflow: 'hidden',
    },
    pressed: {
        opacity: 0.85,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        position: 'absolute',
        bottom: Spacing.one,
        right: Spacing.one,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        paddingHorizontal: Spacing.one + 2,
        paddingVertical: 2,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    durationText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '600',
    },
});

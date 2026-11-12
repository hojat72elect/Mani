import React from 'react';
import {Pressable, View} from 'react-native';
import {Image} from 'expo-image';
import {SymbolView} from 'expo-symbols';
import * as MediaLibrary from 'expo-media-library/legacy';
import {ThemedText} from '@/shared/ui/ThemedText';
import {Spacing} from "@/shared/ui/Spacing";
import {formatVideoDurationUseCase} from "@/shared/usecases/formatVideoDurationUseCase";

export function MediaGridItem({asset, onPress}: {
    asset: MediaLibrary.Asset;
    onPress: () => void;
}) {
    const isVideo = asset.mediaType === 'video';

    return (
        <Pressable
            onPress={onPress}
            android_ripple={{color: 'rgba(255, 255, 255, 0.3)'}}
            style={({pressed}) => [
                {
                    flex: 1,
                    aspectRatio: 1,
                    position: 'relative',
                    backgroundColor: '#1f1f1f',
                    overflow: 'hidden',
                    margin: 1
                },
                pressed && {opacity: 0.85},
            ]}>
            <Image
                source={{uri: asset.uri}}
                style={{
                    width: '100%',
                    height: '100%'
                }}
                contentFit="cover"
                transition={150}
                recyclingKey={asset.id}
                cachePolicy="memory-disk"
                allowDownscaling={true}
            />

            {isVideo && (
                <View style={{
                    position: 'absolute',
                    bottom: Spacing.one,
                    right: Spacing.one,
                    backgroundColor: 'rgba(0, 0, 0, 0.72)',
                    paddingHorizontal: Spacing.one + 2,
                    paddingVertical: 2,
                    borderRadius: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3
                }}>
                    <SymbolView
                        name={{ios: 'play.fill', android: 'play_arrow'}}
                        size={12}
                        tintColor="#ffffff"
                    />
                    <ThemedText style={{
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: '600'
                    }}>
                        {formatVideoDurationUseCase(asset.duration)}
                    </ThemedText>
                </View>
            )}
        </Pressable>
    );
}

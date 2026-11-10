import React from 'react';
import {Pressable, View} from 'react-native';
import {Image} from 'expo-image';
import {SymbolView} from 'expo-symbols';
import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {Spacing} from '@/constants/theme';
import {useTheme} from '@/hooks/use-theme';
import {GalleryFolder} from '@/services/media-service';

export function FolderCard({folder, onPress}: {
    folder: GalleryFolder;
    onPress: () => void;
}) {
    const theme = useTheme();

    return (
        <Pressable
            onPress={onPress}
            android_ripple={{color: 'rgba(0, 0, 0, 0.12)', borderless: false}}
            style={({pressed}) => [{
                flex: 1,
                margin: Spacing.one,
                borderRadius: 20,
                overflow: 'hidden'
            }, pressed && {
                opacity: 0.9,
                transform: [{scale: 0.98}]
            }]}>
            <ThemedView type="backgroundElement" style={{
                borderRadius: 20,
                overflow: 'hidden',
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.08,
                shadowRadius: 6
            }}>
                <View style={{
                    width: '100%',
                    aspectRatio: 1,
                    position: 'relative',
                    backgroundColor: '#1a1a1a'
                }}>
                    {folder.coverUri ? (
                        <Image
                            source={{uri: folder.coverUri}}
                            style={{
                                width: '100%',
                                height: '100%'
                            }}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <View style={[{
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }, {backgroundColor: theme.backgroundSelected}]}>
                            <SymbolView
                                name={{ios: 'folder', android: 'folder'}}
                                size={40}
                                tintColor={theme.textSecondary}
                            />
                        </View>
                    )}

                    {folder.latestMediaType === 'video' && (
                        <View style={{
                            position: 'absolute',
                            top: Spacing.two,
                            left: Spacing.two,
                            backgroundColor: 'rgba(0, 0, 0, 0.65)',
                            paddingHorizontal: Spacing.one + 2,
                            paddingVertical: Spacing.half,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <SymbolView
                                name={{ios: 'video.fill', android: 'videocam'}}
                                size={14}
                                tintColor="#ffffff"
                            />
                        </View>
                    )}

                    <View style={{
                        position: 'absolute',
                        bottom: Spacing.two,
                        right: Spacing.two,
                        backgroundColor: 'rgba(0, 0, 0, 0.72)',
                        paddingHorizontal: Spacing.two,
                        paddingVertical: Spacing.half,
                        borderRadius: 12
                    }}>
                        <ThemedText type="smallBold" style={{
                            color: '#ffffff',
                            fontSize: 11
                        }}>
                            {folder.assetCount.toLocaleString()}
                        </ThemedText>
                    </View>
                </View>

                <View style={{
                    padding: Spacing.two + 2,
                    gap: 2
                }}>
                    <ThemedText type="subtitle" numberOfLines={1} style={{fontSize: 15}}>
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

import React from 'react';
import {Pressable, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SymbolView} from 'expo-symbols';
import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {Spacing} from '@/constants/theme';
import {useTheme} from '@/hooks/use-theme';

export function PermissionView({onRequestPermission, status}: {
    onRequestPermission: () => void;
    status: 'denied' | 'undetermined' | 'loading';
}) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: Spacing.four
        }, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
            <ThemedView type="backgroundElement" style={{
                width: '100%',
                maxWidth: 480,
                borderRadius: 28,
                padding: Spacing.four,
                alignItems: 'center',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 12
            }}>
                <View style={[{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: Spacing.three
                }, {backgroundColor: theme.backgroundSelected}]}>
                    <SymbolView
                        name={{ios: 'photo.on.rectangle.angled', android: 'photo_library'}}
                        size={56}
                        tintColor={theme.text}
                    />
                </View>

                <ThemedText type="title" style={{
                    textAlign: 'center',
                    marginBottom: Spacing.two
                }}>
                    Android Gallery Access
                </ThemedText>

                <ThemedText style={{
                    textAlign: 'center',
                    lineHeight: 22,
                    marginBottom: Spacing.four,
                    paddingHorizontal: Spacing.two
                }} themeColor="textSecondary">
                    Mani Gallery needs permission to view and organize the photos and videos stored on your device into
                    folders.
                </ThemedText>

                <View style={{
                    width: '100%',
                    gap: Spacing.three,
                    marginBottom: Spacing.five,
                    paddingHorizontal: Spacing.two
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: Spacing.two
                    }}>
                        <SymbolView
                            name={{ios: 'folder', android: 'folder'}}
                            size={20}
                            tintColor={theme.text}
                        />
                        <ThemedText type="small" style={{flex: 1}}>
                            Browse folders: Camera, Screenshots, Downloads & more
                        </ThemedText>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: Spacing.two
                    }}>
                        <SymbolView
                            name={{ios: 'play.circle', android: 'play_circle'}}
                            size={20}
                            tintColor={theme.text}
                        />
                        <ThemedText type="small" style={{flex: 1}}>
                            Play and inspect all device videos with duration badges
                        </ThemedText>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: Spacing.two
                    }}>
                        <SymbolView
                            name={{ios: 'lock.shield', android: 'security'}}
                            size={20}
                            tintColor={theme.text}
                        />
                        <ThemedText type="small" style={{flex: 1}}>
                            Private and offline: your media stays strictly on your device
                        </ThemedText>
                    </View>
                </View>

                <Pressable
                    android_ripple={{color: 'rgba(255,255,255,0.2)'}}
                    style={[{
                        width: '100%',
                        paddingVertical: Spacing.three,
                        borderRadius: 100,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }, {backgroundColor: '#208AEF'}]}
                    onPress={onRequestPermission}
                    disabled={status === 'loading'}>
                    <ThemedText type="subtitle" style={{
                        color: '#ffffff',
                        fontSize: 16,
                        fontWeight: '600'
                    }}>
                        {status === 'loading'
                            ? 'Checking...'
                            : status === 'denied'
                                ? 'Try Again / Grant Access'
                                : 'Grant Media Permission'}
                    </ThemedText>
                </Pressable>
            </ThemedView>
        </View>
    );
}

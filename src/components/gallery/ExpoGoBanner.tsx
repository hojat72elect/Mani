import React, {useState} from 'react';
import {Platform, Pressable, View} from 'react-native';
import Constants from 'expo-constants';
import {SymbolView} from 'expo-symbols';
import * as MediaLibrary from 'expo-media-library/legacy';
import {ThemedText} from '@/components/ThemedText';
import {Spacing} from '@/constants/theme';

export function ExpoGoBanner({onRefresh}: { onRefresh: () => void; }) {
    const [dismissed, setDismissed] = useState(false);

    const isExpoGo = Constants.appOwnership === 'expo';

    if (!isExpoGo || dismissed || Platform.OS !== 'android') {
        return null;
    }

    const handleSelectMore = async () => {
        try {
            if (typeof MediaLibrary.presentPermissionsPickerAsync === 'function') {
                await MediaLibrary.presentPermissionsPickerAsync(['photo', 'video']);
                onRefresh();
            }
        } catch {
            // Fallback
            onRefresh();
        }
    };

    return (
        <View style={[{
            marginHorizontal: Spacing.three,
            marginTop: Spacing.two,
            marginBottom: Spacing.one,
            padding: Spacing.three,
            borderRadius: 16,
            borderWidth: 1,
            gap: Spacing.two
        }, {backgroundColor: '#1E293B', borderColor: '#334155'}]}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: Spacing.two
            }}>
                <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 2
                }}>
                    <SymbolView
                        name={{ios: 'exclamationmark.triangle.fill', android: 'warning'}}
                        size={18}
                        tintColor="#F59E0B"
                    />
                </View>

                <View style={{
                    flex: 1,
                    gap: 3
                }}>
                    <ThemedText style={{
                        color: '#F8FAFC',
                        fontSize: 14,
                        fontWeight: '700'
                    }}>Expo Go Android Limitation</ThemedText>
                    <ThemedText style={{
                        color: '#94A3B8',
                        fontSize: 12,
                        lineHeight: 17
                    }}>
                        Android 13+ limits broad media scanning in Expo Go. Use a development build (
                        <ThemedText style={{
                            color: '#38BDF8',
                            fontSize: 11,
                            fontFamily: Platform.select({android: 'monospace', default: 'monospace'})
                        }}>npx expo run:android</ThemedText>) for full storage
                        access, or select photos below.
                    </ThemedText>
                </View>

                <Pressable
                    onPress={() => setDismissed(true)}
                    android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: true}}
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    <SymbolView
                        name={{ios: 'xmark', android: 'close'}}
                        size={16}
                        tintColor="rgba(255,255,255,0.7)"
                    />
                </Pressable>
            </View>

            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing.two,
                paddingTop: Spacing.half
            }}>
                <Pressable
                    onPress={handleSelectMore}
                    android_ripple={{color: 'rgba(255,255,255,0.2)'}}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: Spacing.one,
                        paddingHorizontal: Spacing.two + 2,
                        paddingVertical: Spacing.one,
                        borderRadius: 8,
                        backgroundColor: 'rgba(56, 189, 248, 0.15)'
                    }}>
                    <SymbolView
                        name={{ios: 'plus.circle', android: 'add_photo_alternate'}}
                        size={16}
                        tintColor="#38BDF8"
                    />
                    <ThemedText style={{
                        color: '#38BDF8',
                        fontSize: 12,
                        fontWeight: '600'
                    }}>Select Device Photos</ThemedText>
                </Pressable>
            </View>
        </View>
    );
}

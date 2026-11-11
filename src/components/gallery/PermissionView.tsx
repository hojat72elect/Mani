import React from 'react';
import {Pressable, View} from 'react-native';
import {SymbolView} from 'expo-symbols';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useTheme} from '@/hooks/useTheme';
import {Spacing} from "@/constants/Spacing";

export function PermissionView({onRequestPermission, status}: {
    onRequestPermission: () => void;
    status: 'denied' | 'undetermined' | 'loading';
}) {
    const theme = useTheme();

    return (
        <ThemedView type="backgroundElement" style={{
            justifyContent:"space-between",
            flex: 1,
            padding: Spacing.four,
            alignItems: 'center',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 12
        }}>
            <View style={{ alignItems: 'center'}}>
                <View style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: Spacing.four,
                    marginBottom: Spacing.four,
                    backgroundColor: theme.backgroundSelected
                }}>
                    <SymbolView
                        name={{ios: 'photo.on.rectangle.angled', android: 'photo_library'}}
                        size={56}
                        tintColor={theme.text}
                    />
                </View>

                <ThemedText type="default" style={{
                    textAlign: 'center',
                    marginBottom: Spacing.three
                }}>
                    Android Gallery Access
                </ThemedText>

                <ThemedText style={{
                    textAlign: 'center',
                    lineHeight: 22,
                    marginBottom: Spacing.four,
                    paddingHorizontal: Spacing.two
                }} themeColor="textSecondary">
                    In order to work correctly, Mani Gallery needs permission to view and organize the photos and videos
                    stored on your device.
                </ThemedText>

            </View>


            <Pressable
                android_ripple={{color: 'rgba(255,255,255,0.2)'}}
                style={{
                    width: '100%',
                    paddingVertical: Spacing.three,
                    borderRadius: 100,
                    alignItems: 'center',
                    backgroundColor: '#208AEF',

                }}
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

    );
}

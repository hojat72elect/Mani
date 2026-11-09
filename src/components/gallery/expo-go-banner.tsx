import React, {useState} from 'react';
import {Platform, Pressable, StyleSheet, View} from 'react-native';
import Constants from 'expo-constants';
import {SymbolView} from 'expo-symbols';
import * as MediaLibrary from 'expo-media-library/legacy';

import {ThemedText} from '@/components/themed-text';
import {Spacing} from '@/constants/theme';
import {useTheme} from '@/hooks/use-theme';

type Props = {
    onRefresh: () => void;
};

export function ExpoGoBanner({onRefresh}: Props) {
    const theme = useTheme();
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
        <View style={[styles.container, {backgroundColor: '#1E293B', borderColor: '#334155'}]}>
            <View style={styles.contentRow}>
                <View style={styles.iconCircle}>
                    <SymbolView
                        name={{ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning'}}
                        size={18}
                        tintColor="#F59E0B"
                    />
                </View>

                <View style={styles.textBox}>
                    <ThemedText style={styles.title}>Expo Go Android Limitation</ThemedText>
                    <ThemedText style={styles.description}>
                        Android 13+ limits broad media scanning in Expo Go. Use a development build (
                        <ThemedText style={styles.codeText}>npx expo run:android</ThemedText>) for full storage
                        access, or select photos below.
                    </ThemedText>
                </View>

                <Pressable
                    onPress={() => setDismissed(true)}
                    android_ripple={{color: 'rgba(255,255,255,0.2)', borderless: true}}
                    style={styles.closeButton}>
                    <SymbolView
                        name={{ios: 'xmark', android: 'close', web: 'close'}}
                        size={16}
                        tintColor="rgba(255,255,255,0.7)"
                    />
                </Pressable>
            </View>

            <View style={styles.actionRow}>
                <Pressable
                    onPress={handleSelectMore}
                    android_ripple={{color: 'rgba(255,255,255,0.2)'}}
                    style={styles.actionBtn}>
                    <SymbolView
                        name={{ios: 'plus.circle', android: 'add_photo_alternate', web: 'add'}}
                        size={16}
                        tintColor="#38BDF8"
                    />
                    <ThemedText style={styles.actionBtnText}>Select Device Photos</ThemedText>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: Spacing.three,
        marginTop: Spacing.two,
        marginBottom: Spacing.one,
        padding: Spacing.three,
        borderRadius: 16,
        borderWidth: 1,
        gap: Spacing.two,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.two,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    textBox: {
        flex: 1,
        gap: 3,
    },
    title: {
        color: '#F8FAFC',
        fontSize: 14,
        fontWeight: '700',
    },
    description: {
        color: '#94A3B8',
        fontSize: 12,
        lineHeight: 17,
    },
    codeText: {
        color: '#38BDF8',
        fontSize: 11,
        fontFamily: Platform.select({android: 'monospace', default: 'monospace'}),
    },
    closeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
        paddingTop: Spacing.half,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.one,
        paddingHorizontal: Spacing.two + 2,
        paddingVertical: Spacing.one,
        borderRadius: 8,
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
    },
    actionBtnText: {
        color: '#38BDF8',
        fontSize: 12,
        fontWeight: '600',
    },
});

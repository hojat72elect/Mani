import React from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  onRequestPermission: () => void;
  status: 'denied' | 'undetermined' | 'loading';
};

export function PermissionView({ onRequestPermission, status }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={[styles.iconWrapper, { backgroundColor: theme.backgroundSelected }]}>
          <SymbolView
            name={{ ios: 'photo.on.rectangle.angled', android: 'photo_library', web: 'photo_library' }}
            size={56}
            tintColor={theme.text}
          />
        </View>

        <ThemedText type="title" style={styles.title}>
          Android Gallery Access
        </ThemedText>

        <ThemedText style={styles.description} themeColor="textSecondary">
          Mani Gallery needs permission to view and organize the photos and videos stored on your device into folders.
        </ThemedText>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <SymbolView
              name={{ ios: 'folder', android: 'folder', web: 'folder' }}
              size={20}
              tintColor={theme.text}
            />
            <ThemedText type="small" style={styles.featureText}>
              Browse folders: Camera, Screenshots, Downloads & more
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <SymbolView
              name={{ ios: 'play.circle', android: 'play_circle', web: 'play_circle' }}
              size={20}
              tintColor={theme.text}
            />
            <ThemedText type="small" style={styles.featureText}>
              Play and inspect all device videos with duration badges
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <SymbolView
              name={{ ios: 'lock.shield', android: 'security', web: 'security' }}
              size={20}
              tintColor={theme.text}
            />
            <ThemedText type="small" style={styles.featureText}>
              Private and offline: your media stays strictly on your device
            </ThemedText>
          </View>
        </View>

        <Pressable
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          style={[styles.button, { backgroundColor: '#208AEF' }]}
          onPress={onRequestPermission}
          disabled={status === 'loading'}>
          <ThemedText type="subtitle" style={styles.buttonText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 28,
    padding: Spacing.four,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.four,
    paddingHorizontal: Spacing.two,
  },
  featuresList: {
    width: '100%',
    gap: Spacing.three,
    marginBottom: Spacing.five,
    paddingHorizontal: Spacing.two,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  featureText: {
    flex: 1,
  },
  button: {
    width: '100%',
    paddingVertical: Spacing.three,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

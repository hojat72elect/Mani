import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import * as MediaLibrary from 'expo-media-library/legacy';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { GalleryFolder, MediaFilterType } from '@/services/media-service';
import { MediaGridItem } from './media-grid-item';

type Props = {
  folder: GalleryFolder;
  assets: MediaLibrary.Asset[];
  totalCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  mediaFilter: MediaFilterType;
  onFilterChange: (filter: MediaFilterType) => void;
  onBack: () => void;
  onSelectAsset: (index: number) => void;
  onRefresh: () => void;
  onLoadMore: () => void;
};

export function FolderDetailView({
  folder,
  assets,
  totalCount,
  isLoading,
  isLoadingMore,
  mediaFilter,
  onFilterChange,
  onBack,
  onSelectAsset,
  onRefresh,
  onLoadMore,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [numColumns, setNumColumns] = useState<3 | 4>(3);

  const filterOptions: { label: string; value: MediaFilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Photos', value: 'photo' },
    { label: 'Videos', value: 'video' },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Top Header App Bar */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <Pressable
          onPress={onBack}
          android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: true }}
          style={styles.backButton}>
          <SymbolView
            name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }}
            size={24}
            tintColor={theme.text}
          />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <ThemedText type="subtitle" numberOfLines={1}>
            {folder.title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {totalCount.toLocaleString()} {totalCount === 1 ? 'item' : 'items'}
          </ThemedText>
        </View>

        {/* Toggle Column Count button */}
        <Pressable
          onPress={() => setNumColumns((prev) => (prev === 3 ? 4 : 3))}
          android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: true }}
          style={styles.actionButton}>
          <SymbolView
            name={{ ios: 'square.grid.3x3', android: 'grid_view', web: 'grid_view' }}
            size={22}
            tintColor={theme.text}
          />
        </Pressable>
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filterBar}>
        {filterOptions.map((opt) => {
          const isSelected = mediaFilter === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onFilterChange(opt.value)}
              android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? '#208AEF' : theme.backgroundElement,
                },
              ]}>
              <ThemedText
                type="smallBold"
                style={{ color: isSelected ? '#ffffff' : theme.textSecondary }}>
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Grid of Assets */}
      {isLoading && assets.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#208AEF" />
          <ThemedText style={styles.loadingText} themeColor="textSecondary">
            Loading folder media...
          </ThemedText>
        </View>
      ) : assets.length === 0 ? (
        <View style={styles.centerContainer}>
          <SymbolView
            name={{ ios: 'photo', android: 'image_not_supported', web: 'image' }}
            size={48}
            tintColor={theme.textSecondary}
          />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No media found
          </ThemedText>
          <ThemedText style={styles.emptySubtitle} themeColor="textSecondary">
            This folder does not contain any {mediaFilter === 'all' ? 'media' : `${mediaFilter}s`}.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          key={`grid-${numColumns}`}
          data={assets}
          numColumns={numColumns}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <MediaGridItem
              asset={item}
              numColumns={numColumns}
              onPress={() => onSelectAsset(index)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && assets.length > 0}
              onRefresh={onRefresh}
              colors={['#208AEF']}
            />
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#208AEF" />
              </View>
            ) : undefined
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: 18,
  },
  listContent: {
    paddingTop: Spacing.one,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  loadingText: {
    marginTop: Spacing.two,
  },
  emptyTitle: {
    marginTop: Spacing.two,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
  },
});

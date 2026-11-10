import React, {useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, RefreshControl, View,} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SymbolView} from 'expo-symbols';
import * as MediaLibrary from 'expo-media-library/legacy';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useTheme} from '@/hooks/useTheme';
import {GalleryFolder, MediaFilterType} from '@/services/media-service';
import {MediaGridItem} from './MediaGridItem';
import {Spacing} from "@/constants/Spacing";

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
                                     onLoadMore
                                 }: {
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
}) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [numColumns, setNumColumns] = useState<3 | 4>(3);

    const filterOptions: { label: string; value: MediaFilterType }[] = [
        {label: 'All', value: 'all'},
        {label: 'Photos', value: 'photo'},
        {label: 'Videos', value: 'video'},
    ];

    return (
        <ThemedView style={{flex: 1}}>
            {/* Top Header App Bar */}
            <View style={[{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: Spacing.two,
                paddingBottom: Spacing.two,
                gap: Spacing.two,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(150, 150, 150, 0.1)'
            }, {paddingTop: insets.top + Spacing.two}]}>
                <Pressable
                    onPress={onBack}
                    android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: true}}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    <SymbolView
                        name={{ios: 'arrow.left', android: 'arrow_back'}}
                        size={24}
                        tintColor={theme.text}
                    />
                </Pressable>

                <View style={{flex: 1}}>
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
                    android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: true}}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <SymbolView
                        name={{ios: 'square.grid.3x3', android: 'grid_view'}}
                        size={22}
                        tintColor={theme.text}
                    />
                </Pressable>
            </View>

            {/* The filtering chips in the top bar. */}
            <View style={{
                flexDirection: 'row',
                paddingHorizontal: Spacing.three,
                paddingVertical: Spacing.two,
                gap: Spacing.two
            }}>
                {filterOptions.map((opt) => {
                    const isSelected = mediaFilter === opt.value;
                    return (
                        <Pressable
                            key={opt.value}
                            onPress={() => onFilterChange(opt.value)}
                            android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: false}}
                            style={[
                                {
                                    paddingHorizontal: Spacing.three,
                                    paddingVertical: Spacing.one + 2,
                                    borderRadius: 18
                                },
                                {
                                    backgroundColor: isSelected ? '#208AEF' : theme.backgroundElement,
                                },
                            ]}>
                            <ThemedText
                                type="smallBold"
                                style={{color: isSelected ? '#ffffff' : theme.textSecondary}}>
                                {opt.label}
                            </ThemedText>
                        </Pressable>
                    );
                })}
            </View>

            {/* Grid of Assets */}
            {isLoading && assets.length === 0 ? (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: Spacing.four,
                    gap: Spacing.two
                }}>
                    <ActivityIndicator size="large" color="#208AEF"/>
                    <ThemedText style={{marginTop: Spacing.two}} themeColor="textSecondary">
                        Loading folder media...
                    </ThemedText>
                </View>
            ) : assets.length === 0 ? (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: Spacing.four,
                    gap: Spacing.two
                }}>
                    <SymbolView
                        name={{ios: 'photo', android: 'image_not_supported'}}
                        size={48}
                        tintColor={theme.textSecondary}
                    />
                    <ThemedText type="subtitle" style={{marginTop: Spacing.two}}>
                        No media found
                    </ThemedText>
                    <ThemedText style={{textAlign: 'center'}} themeColor="textSecondary">
                        This folder does not contain any {mediaFilter === 'all' ? 'media' : `${mediaFilter}s`}.
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    key={`grid-${numColumns}`}
                    data={assets}
                    numColumns={numColumns}
                    keyExtractor={(item) => item.id}
                    renderItem={({item, index}) => (
                        <MediaGridItem
                            asset={item}
                            onPress={() => onSelectAsset(index)}
                        />
                    )}
                    contentContainerStyle={[
                        {paddingTop: Spacing.one,},
                        {paddingBottom: insets.bottom + Spacing.six},
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
                            <View style={{
                                paddingVertical: Spacing.four,
                                alignItems: 'center'
                            }}>
                                <ActivityIndicator size="small" color="#208AEF"/>
                            </View>
                        ) : undefined
                    }
                />
            )}
        </ThemedView>
    );
}

import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View,} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SymbolView} from 'expo-symbols';
import * as MediaLibrary from 'expo-media-library/legacy';
import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {BottomTabInset, Spacing} from '@/constants/theme';
import {useTheme} from '@/hooks/use-theme';
import {
    checkMediaPermissionsAsync,
    deleteAssetsAsync,
    getAssetsPageAsync,
    MediaFilterType,
    requestMediaPermissionsAsync,
} from '@/services/media-service';
import {MediaGridItem} from '@/components/gallery/media-grid-item';
import {MediaViewerModal} from '@/components/gallery/media-viewer-modal';
import {PermissionView} from '@/components/gallery/permission-view';
import {ExpoGoBanner} from '@/components/gallery/expo-go-banner';

export default function TimelineScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [numColumns, setNumColumns] = useState<3 | 4>(3);

    const [permissionStatus, setPermissionStatus] = useState<
        'loading' | 'granted' | 'denied' | 'undetermined'
    >('loading');
    const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [mediaFilter, setMediaFilter] = useState<MediaFilterType>('all');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
    const [hasNextPage, setHasNextPage] = useState(false);

    // Fullscreen viewer
    const [activeAssetIndex, setActiveAssetIndex] = useState<number | null>(null);

    const filterOptions: { label: string; value: MediaFilterType }[] = [
        {label: 'All', value: 'all'},
        {label: 'Photos', value: 'photo'},
        {label: 'Videos', value: 'video'},
    ];

    const hasInitialized = useRef(false);

    const checkPermissions = async () => {
        setIsLoading(true);
        try {
            const res = await checkMediaPermissionsAsync();
            if (res.granted) {
                setPermissionStatus('granted');
            } else if (res.canAskAgain) {
                setPermissionStatus('undetermined');
            } else {
                setPermissionStatus('denied');
            }
        } catch {
            setPermissionStatus('denied');
        } finally {
            setIsLoading(false);
        }
    };

    const requestPermission = async () => {
        setIsLoading(true);
        try {
            const res = await requestMediaPermissionsAsync();
            if (res.granted) {
                setPermissionStatus('granted');
            } else {
                setPermissionStatus('denied');
            }
        } catch {
            setPermissionStatus('denied');
        } finally {
            setIsLoading(false);
        }
    };

    const loadAssets = async (filter: MediaFilterType) => {
        if (permissionStatus !== 'granted') return;
        setIsLoading(true);
        try {
            const result = await getAssetsPageAsync({
                mediaFilter: filter,
                first: 48,
            });
            setAssets(result.assets);
            setEndCursor(result.endCursor);
            setHasNextPage(result.hasNextPage);
            setTotalCount(result.totalCount);
        } catch (err) {
            console.warn('Failed to load media', err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoreAssets = async () => {
        if (!hasNextPage || isLoadingMore || !endCursor || permissionStatus !== 'granted') return;
        setIsLoadingMore(true);
        try {
            const result = await getAssetsPageAsync({
                mediaFilter,
                first: 48,
                after: endCursor,
            });
            setAssets((prev) => [...prev, ...result.assets]);
            setEndCursor(result.endCursor);
            setHasNextPage(result.hasNextPage);
        } catch (err) {
            console.warn('Failed to load more media', err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!hasInitialized.current) {
            checkPermissions();
            hasInitialized.current = true;
        }
    }, []);

    useEffect(() => {
        if (permissionStatus === 'granted') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadAssets(mediaFilter);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permissionStatus, mediaFilter]);

    const handleDelete = async (asset: MediaLibrary.Asset) => {
        const success = await deleteAssetsAsync([asset.id]);
        if (success) {
            setAssets((prev) => prev.filter((a) => a.id !== asset.id));
            setTotalCount((prev) => Math.max(0, prev - 1));
            if (activeAssetIndex !== null) {
                if (assets.length <= 1) {
                    setActiveAssetIndex(null);
                } else if (activeAssetIndex >= assets.length - 1) {
                    setActiveAssetIndex(assets.length - 2);
                }
            }
        }
    };

    if (permissionStatus !== 'granted') {
        return (
            <ThemedView style={styles.container}>
                <PermissionView
                    status={permissionStatus}
                    onRequestPermission={requestPermission}
                />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {/* App Bar */}
            <View style={[styles.header, {paddingTop: insets.top + Spacing.two}]}>
                <View style={styles.headerTitleBox}>
                    <ThemedText type="title" style={styles.title}>
                        Photos
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                        {totalCount.toLocaleString()} items on device
                    </ThemedText>
                </View>

                <Pressable
                    onPress={() => setNumColumns((prev) => (prev === 3 ? 4 : 3))}
                    android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: true}}
                    style={styles.actionButton}>
                    <SymbolView
                        name={{ios: 'square.grid.3x3', android: 'grid_view'}}
                        size={22}
                        tintColor={theme.text}
                    />
                </Pressable>
            </View>

            <ExpoGoBanner onRefresh={() => loadAssets(mediaFilter)}/>

            {/* Filter Chips Bar */}
            <View style={styles.filterBar}>
                {filterOptions.map((opt) => {
                    const isSelected = mediaFilter === opt.value;
                    return (
                        <Pressable
                            key={opt.value}
                            onPress={() => setMediaFilter(opt.value)}
                            android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: false}}
                            style={[
                                styles.chip,
                                {backgroundColor: isSelected ? '#208AEF' : theme.backgroundElement},
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

            {/* Grid */}
            {isLoading && assets.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#208AEF"/>
                    <ThemedText style={styles.loadingText} themeColor="textSecondary">
                        Loading photos and videos...
                    </ThemedText>
                </View>
            ) : assets.length === 0 ? (
                <View style={styles.centerContainer}>
                    <SymbolView
                        name={{ios: 'photo', android: 'image_not_supported'}}
                        size={48}
                        tintColor={theme.textSecondary}
                    />
                    <ThemedText type="subtitle" style={styles.emptyTitle}>
                        No media found
                    </ThemedText>
                    <ThemedText style={styles.emptySubtitle} themeColor="textSecondary">
                        No {mediaFilter === 'all' ? 'photos or videos' : `${mediaFilter}s`} found on your device.
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    key={`timeline-${numColumns}`}
                    data={assets}
                    numColumns={numColumns}
                    keyExtractor={(item) => item.id}
                    renderItem={({item, index}) => (
                        <MediaGridItem
                            asset={item}
                            numColumns={numColumns}
                            onPress={() => setActiveAssetIndex(index)}
                        />
                    )}
                    contentContainerStyle={[
                        styles.listContent,
                        {paddingBottom: insets.bottom + BottomTabInset + Spacing.four},
                    ]}
                    onEndReached={loadMoreAssets}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading && assets.length > 0}
                            onRefresh={() => loadAssets(mediaFilter)}
                            colors={['#208AEF']}
                        />
                    }
                    ListFooterComponent={
                        isLoadingMore ? (
                            <View style={styles.footerLoader}>
                                <ActivityIndicator size="small" color="#208AEF"/>
                            </View>
                        ) : undefined
                    }
                />
            )}

            <MediaViewerModal
                visible={activeAssetIndex !== null}
                assets={assets}
                initialIndex={activeAssetIndex ?? 0}
                onClose={() => setActiveAssetIndex(null)}
                onDeleteAsset={handleDelete}
                folderTitle="All Media"
            />
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
        paddingHorizontal: Spacing.three,
        paddingBottom: Spacing.two,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(150, 150, 150, 0.08)',
    },
    headerTitleBox: {
        flex: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
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

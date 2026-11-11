import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, RefreshControl, View,} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SymbolView} from 'expo-symbols';
import * as MediaLibrary from 'expo-media-library/legacy';
import {ThemedText} from '@/shared/ui/ThemedText';
import {ThemedView} from '@/shared/ui/ThemedView';
import {useTheme} from '@/shared/hooks/useTheme';
import {MediaGridItem} from '@/shared/ui/MediaGridItem';
import {MediaViewerModal} from '@/shared/ui/MediaViewerModal';
import {PermissionView} from '@/shared/ui/PermissionView';
import {Spacing} from "@/shared/ui/Spacing";
import {MediaFilterType} from "@/services/MediaFilterType";
import {checkMediaPermissionsUseCase} from "@/services/checkMediaPermissionsUseCase";
import {requestMediaPermissionsUseCase} from "@/services/requestMediaPermissionsUseCase";
import {getAssetsPageUseCase} from "@/services/getAssetsPageUseCase";
import {deleteAssetsUseCase} from "@/services/deleteAssetsUseCase";

/**
 * A big GridView that shows all the photos we have on the device.
 */
export default function PhotosScreen() {
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
            const res = await checkMediaPermissionsUseCase();
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
            const res = await requestMediaPermissionsUseCase();
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
            const result = await getAssetsPageUseCase({
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
            const result = await getAssetsPageUseCase({
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
            loadAssets(mediaFilter);
        }
    }, [permissionStatus, mediaFilter]);

    const handleDelete = async (asset: MediaLibrary.Asset) => {
        const success = await deleteAssetsUseCase([asset.id]);
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
            <ThemedView style={{flex: 1}}>
                <PermissionView
                    status={permissionStatus}
                    onRequestPermission={requestPermission}
                />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={{flex: 1}}>
            {/* App Bar */}
            <View style={[{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: Spacing.three,
                paddingBottom: Spacing.two,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(150, 150, 150, 0.08)'
            }, {paddingTop: insets.top + Spacing.two}]}>
                <View style={{flex: 1}}>
                    <ThemedText type="title" style={{
                        fontSize: 26,
                        fontWeight: '700'
                    }}>
                        Photos
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                        {totalCount.toLocaleString()} items on device
                    </ThemedText>
                </View>

                <Pressable
                    onPress={() => setNumColumns((prev) => (prev === 3 ? 4 : 3))}
                    android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: true}}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    <SymbolView
                        name={{ios: 'square.grid.3x3', android: 'grid_view'}}
                        size={22}
                        tintColor={theme.text}
                    />
                </Pressable>
            </View>

            {/* Filter Chips Bar */}
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
                            onPress={() => setMediaFilter(opt.value)}
                            android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: false}}
                            style={[
                                {
                                    paddingHorizontal: Spacing.three,
                                    paddingVertical: Spacing.one + 2,
                                    borderRadius: 18
                                },
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
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: Spacing.four,
                    gap: Spacing.two
                }}>
                    <ActivityIndicator size="large" color="#208AEF"/>
                    <ThemedText style={{marginTop: Spacing.two}} themeColor="textSecondary">
                        Loading photos and videos...
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
                            onPress={() => setActiveAssetIndex(index)}
                        />
                    )}
                    contentContainerStyle={[
                        {paddingTop: Spacing.one},
                        {paddingBottom: insets.bottom + 80 + Spacing.four},
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
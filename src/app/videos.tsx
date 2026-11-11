import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, RefreshControl, View,} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SymbolView} from 'expo-symbols';
import * as MediaLibrary from 'expo-media-library/legacy';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useTheme} from '@/hooks/useTheme';
import {MediaGridItem} from '@/components/gallery/MediaGridItem';
import {MediaViewerModal} from '@/components/gallery/MediaViewerModal';
import {PermissionView} from '@/shared/ui/PermissionView';
import {Spacing} from "@/constants/Spacing";
import {checkMediaPermissionsUseCase} from "@/services/checkMediaPermissionsUseCase";
import {requestMediaPermissionsUseCase} from "@/services/requestMediaPermissionsUseCase";
import {getAssetsPageUseCase} from "@/services/getAssetsPageUseCase";
import {deleteAssetsUseCase} from "@/services/deleteAssetsUseCase";

/**
 * A big GridView that shows all the videos we have on the device.
 */
export default function VideosScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [numColumns, setNumColumns] = useState<3 | 4>(3);

    const [permissionStatus, setPermissionStatus] = useState<
        'loading' | 'granted' | 'denied' | 'undetermined'
    >('loading');
    const [videos, setVideos] = useState<MediaLibrary.Asset[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
    const [hasNextPage, setHasNextPage] = useState(false);

    // Fullscreen viewer
    const [activeAssetIndex, setActiveAssetIndex] = useState<number | null>(null);

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

    const loadVideos = async () => {
        if (permissionStatus !== 'granted') return;
        setIsLoading(true);
        try {
            const result = await getAssetsPageUseCase({
                mediaFilter: 'video',
                first: 48,
            });
            setVideos(result.assets);
            setEndCursor(result.endCursor);
            setHasNextPage(result.hasNextPage);
            setTotalCount(result.totalCount);
        } catch (err) {
            console.warn('Failed to load videos', err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoreVideos = async () => {
        if (!hasNextPage || isLoadingMore || !endCursor || permissionStatus !== 'granted') return;
        setIsLoadingMore(true);
        try {
            const result = await getAssetsPageUseCase({
                mediaFilter: 'video',
                first: 48,
                after: endCursor,
            });
            setVideos((prev) => [...prev, ...result.assets]);
            setEndCursor(result.endCursor);
            setHasNextPage(result.hasNextPage);
        } catch (err) {
            console.warn('Failed to load more videos', err);
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
            loadVideos();
        }
    }, [permissionStatus]);

    const handleDelete = async (asset: MediaLibrary.Asset) => {
        const success = await deleteAssetsUseCase([asset.id]);
        if (success) {
            setVideos((prev) => prev.filter((a) => a.id !== asset.id));
            setTotalCount((prev) => Math.max(0, prev - 1));
            if (activeAssetIndex !== null) {
                if (videos.length <= 1) {
                    setActiveAssetIndex(null);
                } else if (activeAssetIndex >= videos.length - 1) {
                    setActiveAssetIndex(videos.length - 2);
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
                        Videos
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                        {totalCount.toLocaleString()} {totalCount === 1 ? 'video' : 'videos'} on device
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


            {/* Grid */}
            {isLoading && videos.length === 0 ? (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: Spacing.four,
                    gap: Spacing.two
                }}>
                    <ActivityIndicator size="large" color="#208AEF"/>
                    <ThemedText style={{marginTop: Spacing.two}} themeColor="textSecondary">
                        Scanning device for videos...
                    </ThemedText>
                </View>
            ) : videos.length === 0 ? (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: Spacing.four,
                    gap: Spacing.two
                }}>
                    <SymbolView
                        name={{ios: 'video.slash', android: 'videocam_off'}}
                        size={48}
                        tintColor={theme.textSecondary}
                    />
                    <ThemedText type="subtitle" style={{marginTop: Spacing.two}}>
                        No videos found
                    </ThemedText>
                    <ThemedText style={{textAlign: 'center'}} themeColor="textSecondary">
                        No video files were found on this device storage.
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    key={`videos-${numColumns}`}
                    data={videos}
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
                    onEndReached={loadMoreVideos}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading && videos.length > 0}
                            onRefresh={loadVideos}
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
                assets={videos}
                initialIndex={activeAssetIndex ?? 0}
                onClose={() => setActiveAssetIndex(null)}
                onDeleteAsset={handleDelete}
                folderTitle="Videos"
            />
        </ThemedView>
    );
}
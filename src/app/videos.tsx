import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View,} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SymbolView} from 'expo-symbols';
import * as MediaLibrary from 'expo-media-library/legacy';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useTheme} from '@/hooks/useTheme';
import {
    checkMediaPermissionsAsync,
    deleteAssetsAsync,
    getAssetsPageAsync,
    requestMediaPermissionsAsync,
} from '@/services/media-service';
import {MediaGridItem} from '@/components/gallery/MediaGridItem';
import {MediaViewerModal} from '@/components/gallery/MediaViewerModal';
import {PermissionView} from '@/components/gallery/PermissionView';
import {ExpoGoBanner} from '@/components/gallery/ExpoGoBanner';
import {Spacing} from "@/constants/Spacing";

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

    const loadVideos = async () => {
        if (permissionStatus !== 'granted') return;
        setIsLoading(true);
        try {
            const result = await getAssetsPageAsync({
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
            const result = await getAssetsPageAsync({
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
        const success = await deleteAssetsAsync([asset.id]);
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
                        Videos
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                        {totalCount.toLocaleString()} {totalCount === 1 ? 'video' : 'videos'} on device
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

            <ExpoGoBanner onRefresh={loadVideos}/>

            {/* Grid */}
            {isLoading && videos.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#208AEF"/>
                    <ThemedText style={styles.loadingText} themeColor="textSecondary">
                        Scanning device for videos...
                    </ThemedText>
                </View>
            ) : videos.length === 0 ? (
                <View style={styles.centerContainer}>
                    <SymbolView
                        name={{ios: 'video.slash', android: 'videocam_off'}}
                        size={48}
                        tintColor={theme.textSecondary}
                    />
                    <ThemedText type="subtitle" style={styles.emptyTitle}>
                        No videos found
                    </ThemedText>
                    <ThemedText style={styles.emptySubtitle} themeColor="textSecondary">
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
                        styles.listContent,
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
                            <View style={styles.footerLoader}>
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

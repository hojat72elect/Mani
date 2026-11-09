import React, {useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View,} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SymbolView} from 'expo-symbols';

import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {BottomTabInset, Spacing} from '@/constants/theme';
import {useTheme} from '@/hooks/use-theme';
import {useMediaLibrary} from '@/hooks/use-media-library';
import {PermissionView} from '@/components/gallery/permission-view';
import {FolderCard} from '@/components/gallery/folder-card';
import {FolderDetailView} from '@/components/gallery/folder-detail-view';
import {MediaViewerModal} from '@/components/gallery/media-viewer-modal';
import {ExpoGoBanner} from '@/components/gallery/expo-go-banner';

export default function FoldersScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const {
        permissionStatus,
        requestPermission,
        folders,
        allFolder,
        isLoadingFolders,
        refreshFolders,
        selectedFolder,
        setSelectedFolder,
        assets,
        totalCount,
        mediaFilter,
        setMediaFilter,
        isLoadingAssets,
        isLoadingMore,
        loadMoreAssets,
        refreshAssets,
        activeAssetIndex,
        setActiveAssetIndex,
        deleteAsset,
    } = useMediaLibrary();

    // Combine All Media folder and other device folders
    const allFoldersList = useMemo(() => {
        const list = [];
        if (allFolder && allFolder.assetCount > 0) {
            list.push(allFolder);
        }
        return [...list, ...folders];
    }, [allFolder, folders]);

    // Filter folders by search
    const filteredFolders = useMemo(() => {
        if (!searchQuery.trim()) return allFoldersList;
        const q = searchQuery.toLowerCase();
        return allFoldersList.filter((f) => f.title.toLowerCase().includes(q));
    }, [allFoldersList, searchQuery]);

    // 1. Permission Gate
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

    // 2. Folder Detail View (when user opens a folder)
    if (selectedFolder) {
        return (
            <ThemedView style={styles.container}>
                <FolderDetailView
                    folder={selectedFolder}
                    assets={assets}
                    totalCount={totalCount}
                    isLoading={isLoadingAssets}
                    isLoadingMore={isLoadingMore}
                    mediaFilter={mediaFilter}
                    onFilterChange={setMediaFilter}
                    onBack={() => setSelectedFolder(null)}
                    onSelectAsset={(idx) => setActiveAssetIndex(idx)}
                    onRefresh={refreshAssets}
                    onLoadMore={loadMoreAssets}
                />

                <MediaViewerModal
                    visible={activeAssetIndex !== null}
                    assets={assets}
                    initialIndex={activeAssetIndex ?? 0}
                    onClose={() => setActiveAssetIndex(null)}
                    onDeleteAsset={deleteAsset}
                    folderTitle={selectedFolder.title}
                />
            </ThemedView>
        );
    }

    // 3. Folders Grid View
    return (
        <ThemedView style={styles.container}>
            {/* Android Top App Bar */}
            <View style={[styles.appBar, {paddingTop: insets.top + Spacing.two}]}>
                <View style={styles.appBarTitleRow}>
                    <ThemedText type="title" style={styles.appBarTitle}>
                        Folders
                    </ThemedText>

                    <View style={styles.appBarActions}>
                        <Pressable
                            onPress={() => setShowSearch((prev) => !prev)}
                            android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: true}}
                            style={styles.iconButton}>
                            <SymbolView
                                name={{ios: 'magnifyingglass', android: 'search', web: 'search'}}
                                size={22}
                                tintColor={theme.text}
                            />
                        </Pressable>

                        <Pressable
                            onPress={refreshFolders}
                            android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: true}}
                            style={styles.iconButton}>
                            <SymbolView
                                name={{ios: 'arrow.clockwise', android: 'refresh', web: 'refresh'}}
                                size={22}
                                tintColor={theme.text}
                            />
                        </Pressable>
                    </View>
                </View>

                {showSearch && (
                    <View style={[styles.searchBar, {backgroundColor: theme.backgroundElement}]}>
                        <SymbolView
                            name={{ios: 'magnifyingglass', android: 'search', web: 'search'}}
                            size={18}
                            tintColor={theme.textSecondary}
                        />
                        <TextInput
                            style={[styles.searchInput, {color: theme.text}]}
                            placeholder="Search folders..."
                            placeholderTextColor={theme.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')}>
                                <SymbolView
                                    name={{ios: 'xmark.circle.fill', android: 'close', web: 'close'}}
                                    size={18}
                                    tintColor={theme.textSecondary}
                                />
                            </Pressable>
                        )}
                    </View>
                )}
            </View>

            <ExpoGoBanner onRefresh={refreshFolders}/>

            {/* Folders 2-Column Grid */}
            {isLoadingFolders && allFoldersList.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#208AEF"/>
                    <ThemedText style={styles.loadingText} themeColor="textSecondary">
                        Scanning device folders...
                    </ThemedText>
                </View>
            ) : filteredFolders.length === 0 ? (
                <View style={styles.centerContainer}>
                    <SymbolView
                        name={{ios: 'folder', android: 'folder_open', web: 'folder'}}
                        size={48}
                        tintColor={theme.textSecondary}
                    />
                    <ThemedText type="subtitle" style={styles.emptyTitle}>
                        No folders found
                    </ThemedText>
                    <ThemedText style={styles.emptySubtitle} themeColor="textSecondary">
                        {searchQuery
                            ? `No folders matching "${searchQuery}"`
                            : 'No media folders detected on this device.'}
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={filteredFolders}
                    numColumns={2}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => (
                        <FolderCard
                            folder={item}
                            onPress={() => setSelectedFolder(item)}
                        />
                    )}
                    contentContainerStyle={[
                        styles.gridContent,
                        {paddingBottom: insets.bottom + BottomTabInset + Spacing.four},
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoadingFolders}
                            onRefresh={refreshFolders}
                            colors={['#208AEF']}
                        />
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
    appBar: {
        paddingHorizontal: Spacing.three,
        paddingBottom: Spacing.two,
        gap: Spacing.two,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(150, 150, 150, 0.08)',
    },
    appBarTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    appBarTitle: {
        fontSize: 26,
        fontWeight: '700',
    },
    appBarActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.one + 4,
        borderRadius: 24,
        gap: Spacing.two,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        padding: 0,
    },
    gridContent: {
        padding: Spacing.one,
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
});

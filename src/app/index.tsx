import React, {useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, RefreshControl, TextInput, View,} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SymbolView} from 'expo-symbols';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useTheme} from '@/hooks/use-theme';
import {useMediaLibrary} from '@/hooks/use-media-library';
import {PermissionView} from '@/components/gallery/PermissionView';
import {FolderCard} from '@/components/gallery/FolderCard';
import {FolderDetailView} from '@/components/gallery/FolderDetailView';
import {MediaViewerModal} from '@/components/gallery/MediaViewerModal';
import {ExpoGoBanner} from '@/components/gallery/ExpoGoBanner';
import {Spacing} from "@/constants/Spacing";

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
            <ThemedView style={{flex: 1}}>
                <PermissionView
                    status={permissionStatus}
                    onRequestPermission={requestPermission}
                />
            </ThemedView>
        );
    }

    // 2. Folder Detailed View (when user opens a folder)
    if (selectedFolder) {
        return (
            <ThemedView style={{flex: 1}}>
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
        <ThemedView style={{flex: 1}}>
            {/*The top bar of the app.*/}
            <View style={[{
                paddingHorizontal: Spacing.three,
                paddingBottom: Spacing.two,
                gap: Spacing.two,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(150, 150, 150, 0.08)'
            }, {paddingTop: insets.top + Spacing.two}]}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <ThemedText type="title" style={{
                        fontSize: 26,
                        fontWeight: '700'
                    }}>
                        Folders
                    </ThemedText>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4
                    }}>
                        <Pressable
                            onPress={() => setShowSearch((prev) => !prev)}
                            android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: true}}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                            <SymbolView
                                name={{ios: 'magnifyingglass', android: 'search'}}
                                size={22}
                                tintColor={theme.text}
                            />
                        </Pressable>

                        <Pressable
                            onPress={refreshFolders}
                            android_ripple={{color: 'rgba(0,0,0,0.1)', borderless: true}}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                            <SymbolView
                                name={{ios: 'arrow.clockwise', android: 'refresh'}}
                                size={22}
                                tintColor={theme.text}
                            />
                        </Pressable>
                    </View>
                </View>

                {showSearch && (
                    <View style={[{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: Spacing.three,
                        paddingVertical: Spacing.one + 4,
                        borderRadius: 24,
                        gap: Spacing.two
                    }, {backgroundColor: theme.backgroundElement}]}>
                        <SymbolView
                            name={{ios: 'magnifyingglass', android: 'search'}}
                            size={18}
                            tintColor={theme.textSecondary}
                        />
                        <TextInput
                            style={[{
                                flex: 1,
                                fontSize: 15,
                                padding: 0
                            }, {color: theme.text}]}
                            placeholder="Search folders..."
                            placeholderTextColor={theme.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')}>
                                <SymbolView
                                    name={{ios: 'xmark.circle.fill', android: 'close'}}
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
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: Spacing.four,
                    gap: Spacing.two
                }}>
                    <ActivityIndicator size="large" color="#208AEF"/>
                    <ThemedText style={{marginTop: Spacing.two}} themeColor="textSecondary">
                        Scanning device folders...
                    </ThemedText>
                </View>
            ) : filteredFolders.length === 0 ? (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: Spacing.four,
                    gap: Spacing.two
                }}>
                    <SymbolView
                        name={{ios: 'folder', android: 'folder_open'}}
                        size={48}
                        tintColor={theme.textSecondary}
                    />
                    <ThemedText type="subtitle" style={{marginTop: Spacing.two}}>
                        No folders found
                    </ThemedText>
                    <ThemedText style={{textAlign: 'center'}} themeColor="textSecondary">
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
                        {padding: Spacing.one},
                        {paddingBottom: insets.bottom + 80 + Spacing.four},
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

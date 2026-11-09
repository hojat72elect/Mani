import * as MediaLibrary from 'expo-media-library/legacy';
import { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler } from 'react-native';

import {
  checkMediaPermissionsAsync,
  deleteAssetsAsync,
  GalleryFolder,
  getAssetsPageAsync,
  getFoldersWithCoversAsync,
  MediaFilterType,
  requestMediaPermissionsAsync,
} from '@/services/media-service';

export function useMediaLibrary() {
  const [permissionStatus, setPermissionStatus] = useState<
    'loading' | 'granted' | 'denied' | 'undetermined'
  >('loading');
  const [folders, setFolders] = useState<GalleryFolder[]>([]);
  const [allFolder, setAllFolder] = useState<GalleryFolder | null>(null);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);

  // Active folder view
  const [selectedFolder, setSelectedFolder] = useState<GalleryFolder | null>(null);
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [mediaFilter, setMediaFilter] = useState<MediaFilterType>('all');
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fullscreen Viewer
  const [activeAssetIndex, setActiveAssetIndex] = useState<number | null>(null);

  // Check initial permissions
  const checkPermissions = useCallback(async () => {
    setIsLoadingFolders(true);
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
      setIsLoadingFolders(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setIsLoadingFolders(true);
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
      setIsLoadingFolders(false);
    }
  }, []);

  // Load Folders
  const loadFolders = useCallback(async () => {
    if (permissionStatus !== 'granted') return;
    setIsLoadingFolders(true);
    try {
      const data = await getFoldersWithCoversAsync();
      setAllFolder(data.allFolder);
      setFolders(data.folders);
    } catch (err) {
      console.warn('Failed to load albums', err);
    } finally {
      setIsLoadingFolders(false);
    }
  }, [permissionStatus]);

  // Load Assets for selected folder
  const loadAssets = useCallback(
    async (folder: GalleryFolder | null, filter: MediaFilterType) => {
      if (permissionStatus !== 'granted') return;
      setIsLoadingAssets(true);
      try {
        const result = await getAssetsPageAsync({
          folderId: folder?.id,
          mediaFilter: filter,
          first: 40,
        });
        setAssets(result.assets);
        setEndCursor(result.endCursor);
        setHasNextPage(result.hasNextPage);
        setTotalCount(result.totalCount);
      } catch (err) {
        console.warn('Failed to load folder assets', err);
      } finally {
        setIsLoadingAssets(false);
      }
    },
    [permissionStatus]
  );

  // Load next page
  const loadMoreAssets = useCallback(async () => {
    if (!hasNextPage || isLoadingMore || !endCursor || permissionStatus !== 'granted') return;
    setIsLoadingMore(true);
    try {
      const result = await getAssetsPageAsync({
        folderId: selectedFolder?.id,
        mediaFilter,
        first: 40,
        after: endCursor,
      });
      setAssets((prev) => [...prev, ...result.assets]);
      setEndCursor(result.endCursor);
      setHasNextPage(result.hasNextPage);
    } catch (err) {
      console.warn('Failed to load more assets', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasNextPage, isLoadingMore, endCursor, permissionStatus, selectedFolder?.id, mediaFilter]);

  // Initialize permission check
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // Auto load folders when permission granted
  useEffect(() => {
    if (permissionStatus === 'granted') {
      loadFolders();
    }
  }, [permissionStatus, loadFolders]);

  // Auto load assets when selected folder or filter changes
  useEffect(() => {
    if (selectedFolder) {
      loadAssets(selectedFolder, mediaFilter);
    }
  }, [selectedFolder, mediaFilter, loadAssets]);

  // Android hardware back button handler
  useEffect(() => {
    const backAction = () => {
      // 1. If viewer is open, close viewer
      if (activeAssetIndex !== null) {
        setActiveAssetIndex(null);
        return true;
      }
      // 2. If inside a folder, return to folder list
      if (selectedFolder !== null) {
        setSelectedFolder(null);
        return true;
      }
      return false; // let system handle (minimize app)
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [activeAssetIndex, selectedFolder]);

  // Asset deletion
  const deleteAsset = useCallback(
    async (asset: MediaLibrary.Asset) => {
      Alert.alert(
        'Delete Media',
        `Are you sure you want to permanently delete this ${asset.mediaType}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const success = await deleteAssetsAsync([asset.id]);
                if (success) {
                  setAssets((prev) => prev.filter((a) => a.id !== asset.id));
                  if (activeAssetIndex !== null) {
                    if (assets.length <= 1) {
                      setActiveAssetIndex(null);
                    } else if (activeAssetIndex >= assets.length - 1) {
                      setActiveAssetIndex(assets.length - 2);
                    }
                  }
                  // Refresh folders count
                  loadFolders();
                }
              } catch (e) {
                Alert.alert('Error', 'Could not delete item.');
              }
            },
          },
        ]
      );
    },
    [activeAssetIndex, assets.length, loadFolders]
  );

  return {
    permissionStatus,
    requestPermission,
    folders,
    allFolder,
    isLoadingFolders,
    refreshFolders: loadFolders,
    selectedFolder,
    setSelectedFolder,
    assets,
    totalCount,
    mediaFilter,
    setMediaFilter,
    isLoadingAssets,
    isLoadingMore,
    loadMoreAssets,
    refreshAssets: () => loadAssets(selectedFolder, mediaFilter),
    activeAssetIndex,
    setActiveAssetIndex,
    activeAsset: activeAssetIndex !== null ? assets[activeAssetIndex] ?? null : null,
    deleteAsset,
  };
}

import * as MediaLibrary from 'expo-media-library/legacy';
import {Platform} from 'react-native';

export type GalleryFolder = {
    id: string;
    title: string;
    assetCount: number;
    coverUri?: string;
    latestMediaType?: MediaLibrary.MediaTypeValue;
    isVirtual?: boolean;
};

export type MediaFilterType = 'all' | 'photo' | 'video';

export type PaginatedAssets = {
    assets: MediaLibrary.Asset[];
    endCursor?: string;
    hasNextPage: boolean;
    totalCount: number;
};

/**
 * Check existing media permissions.
 */
export async function checkMediaPermissionsAsync(): Promise<MediaLibrary.PermissionResponse> {
    return await MediaLibrary.getPermissionsAsync(false, ['photo', 'video']);
}

/**
 * Request media permissions for images and videos.
 */
export async function requestMediaPermissionsAsync(): Promise<MediaLibrary.PermissionResponse> {
    return await MediaLibrary.requestPermissionsAsync(false, ['photo', 'video']);
}

/**
 * Fetch all folders (albums) from the device and attach a preview cover URI for each folder
 */
export async function getFoldersWithCoversAsync(): Promise<{
    allFolder: GalleryFolder;
    folders: GalleryFolder[];
}> {

    // Fetch all albums from device
    const albums = await MediaLibrary.getAlbumsAsync({includeSmartAlbums: true});

    // Query overall device media to create the "All Media" master folder
    const overallResult = await MediaLibrary.getAssetsAsync({
        first: 1,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: [MediaLibrary.SortBy.creationTime],
    });

    const allFolder: GalleryFolder = {
        id: '__all__',
        title: 'All Media',
        assetCount: overallResult.totalCount,
        coverUri: overallResult.assets[0]?.uri,
        latestMediaType: overallResult.assets[0]?.mediaType,
        isVirtual: true,
    };

    // For each album, fetch its latest asset as a thumbnail cover
    const folderPromises = albums.map(async (album): Promise<GalleryFolder> => {
        try {
            const coverResult = await MediaLibrary.getAssetsAsync({
                album: album.id,
                first: 1,
                mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
                sortBy: [MediaLibrary.SortBy.creationTime],
            });

            return {
                id: album.id,
                title: album.title,
                assetCount: album.assetCount,
                coverUri: coverResult.assets[0]?.uri,
                latestMediaType: coverResult.assets[0]?.mediaType,
            };
        } catch {
            return {
                id: album.id,
                title: album.title,
                assetCount: album.assetCount,
            };
        }
    });

    const folders = await Promise.all(folderPromises);

    // Filter out empty albums if any, and sort standard Android albums first (Camera, Screenshots, Download)
    const prioritizedFolders = folders.filter((f) => f.assetCount > 0);
    prioritizedFolders.sort((a, b) => {
        const priority = ['Camera', 'DCIM', 'Screenshots', 'Download', 'Pictures', 'Movies'];
        const indexA = priority.findIndex((p) => a.title.toLowerCase().includes(p.toLowerCase()));
        const indexB = priority.findIndex((p) => b.title.toLowerCase().includes(p.toLowerCase()));

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return b.assetCount - a.assetCount;
    });

    return {
        allFolder,
        folders: prioritizedFolders,
    };
}

/**
 * Fetch media assets within a specific folder (or all folders) with pagination and media filtering
 */
export async function getAssetsPageAsync({folderId, mediaFilter = 'all', first = 50, after}: {
    folderId?: string;
    mediaFilter?: MediaFilterType;
    first?: number;
    after?: string;
}): Promise<PaginatedAssets> {

    const mediaTypes: MediaLibrary.MediaTypeValue[] =
        mediaFilter === 'photo'
            ? [MediaLibrary.MediaType.photo]
            : mediaFilter === 'video'
                ? [MediaLibrary.MediaType.video]
                : [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video];

    const options: MediaLibrary.AssetsOptions = {
        first,
        after,
        mediaType: mediaTypes,
        sortBy: [MediaLibrary.SortBy.creationTime],
    };

    if (folderId && folderId !== '__all__') {
        options.album = folderId;
    }

    const result = await MediaLibrary.getAssetsAsync(options);

    return {
        assets: result.assets,
        endCursor: result.endCursor,
        hasNextPage: result.hasNextPage,
        totalCount: result.totalCount,
    };
}

/**
 * Delete one or more assets with native permission confirmation
 */
export async function deleteAssetsAsync(assetIds: string[]): Promise<boolean> {
    return await MediaLibrary.deleteAssetsAsync(assetIds);
}

/**
 * Helper to format duration in MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '0:00';
    const rounded = Math.round(seconds);
    const hrs = Math.floor(rounded / 3600);
    const mins = Math.floor((rounded % 3600) / 60);
    const secs = rounded % 60;

    const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    if (hrs > 0) {
        const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
        return `${hrs}:${paddedMins}:${paddedSecs}`;
    }
    return `${mins}:${paddedSecs}`;
}

/**
 * Helper to format date in Android friendly format
 */
export function formatMediaDate(timestamp: number): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

import {GalleryFolder} from "@/shared/domain/GalleryFolder";
import {getAlbumsAsync, getAssetsAsync, MediaType, SortBy} from 'expo-media-library/legacy';

/**
 * Fetch all folders (albums) from the device and attach a preview cover URI for each folder
 */
export async function getFoldersWithCoversUseCase(): Promise<{
    allFolder: GalleryFolder;
    folders: GalleryFolder[];
}> {

    // Fetch all albums from device
    const albums = await getAlbumsAsync({includeSmartAlbums: true});

    // Query overall device media to create the "All Media" master folder
    const overallResult = await getAssetsAsync({
        first: 1,
        mediaType: [MediaType.photo, MediaType.video],
        sortBy: [SortBy.creationTime],
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
            const coverResult = await getAssetsAsync({
                album: album.id,
                first: 1,
                mediaType: [MediaType.photo, MediaType.video],
                sortBy: [SortBy.creationTime],
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

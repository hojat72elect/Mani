import * as MediaLibrary from 'expo-media-library/legacy';
import {MediaFilterType} from "@/services/MediaFilterType";

/**
 * Fetch media assets within a specific folder (or all folders) with pagination and media filtering
 */
export async function getAssetsPageUseCase({folderId, mediaFilter = 'all', first = 50, after}: {
    folderId?: string;
    mediaFilter?: MediaFilterType;
    first?: number;
    after?: string;
}): Promise<{
    assets: MediaLibrary.Asset[];
    endCursor?: string;
    hasNextPage: boolean;
    totalCount: number;
}> {

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

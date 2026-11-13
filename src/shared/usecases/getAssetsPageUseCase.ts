import {Asset, AssetsOptions, getAssetsAsync, MediaType, MediaTypeValue, SortBy} from 'expo-media-library/legacy';
import {MediaFilterType} from "@/shared/domain/MediaFilterType";

/**
 * Fetch media assets within a specific folder (or all folders) with pagination and media filtering
 */
export async function getAssetsPageUseCase({folderId, mediaFilter = 'all', first = 50, after}: {
    folderId?: string;
    mediaFilter?: MediaFilterType;
    first?: number;
    after?: string;
}): Promise<{
    assets: Asset[];
    endCursor?: string;
    hasNextPage: boolean;
    totalCount: number;
}> {

    const mediaTypes: MediaTypeValue[] =
        mediaFilter === 'photo'
            ? [MediaType.photo]
            : mediaFilter === 'video'
                ? [MediaType.video]
                : [MediaType.photo, MediaType.video];

    const options: AssetsOptions = {
        first,
        after,
        mediaType: mediaTypes,
        sortBy: [SortBy.creationTime],
    };

    if (folderId && folderId !== '__all__') {
        options.album = folderId;
    }

    const result = await getAssetsAsync(options);

    return {
        assets: result.assets,
        endCursor: result.endCursor,
        hasNextPage: result.hasNextPage,
        totalCount: result.totalCount,
    };
}

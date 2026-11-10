import * as MediaLibrary from 'expo-media-library/legacy';

/**
 * Delete one or more assets with native permission confirmation
 */
export async function deleteAssetsUseCase(assetIds: string[]): Promise<boolean> {
    return await MediaLibrary.deleteAssetsAsync(assetIds);
}

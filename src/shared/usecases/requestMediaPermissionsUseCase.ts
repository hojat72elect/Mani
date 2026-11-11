import {requestPermissionsAsync, PermissionResponse} from "expo-media-library/legacy";

/**
 * Request media permissions for images and videos.
 */
export async function requestMediaPermissionsUseCase(): Promise<PermissionResponse> {
    return await requestPermissionsAsync(false, ['photo', 'video']);
}

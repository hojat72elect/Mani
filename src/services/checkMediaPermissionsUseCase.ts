import {PermissionResponse, getPermissionsAsync} from 'expo-media-library/legacy';

/**
 * Check existing media permissions.
 */
export async function checkMediaPermissionsUseCase(): Promise<PermissionResponse> {
    return await getPermissionsAsync(false, ['photo', 'video']);
}

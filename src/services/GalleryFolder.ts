import {MediaTypeValue} from "expo-media-library/legacy";

export type GalleryFolder = {
    id: string;
    title: string;
    assetCount: number;
    coverUri?: string;
    latestMediaType?: MediaTypeValue;
    isVirtual?: boolean;
};
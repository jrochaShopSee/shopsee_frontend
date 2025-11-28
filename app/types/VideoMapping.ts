// Video Mapping Types

export interface VideoInformation {
    episodeId: number;
    episodeDisplayName: string;
    videoUrl: string;
    sourceType: string;
    companyId: number;
    productsPerVideo: number;
    videoDockIconsBehaviorTypeId: number;
}

export interface ProductListItem {
    id: number;
    name: string;
    productImage: string;
    productType: string;
}

export interface ContentItem {
    itemContentId: number;
    name: string;
    contentType: string;
    itemContentValue?: string;
    itemImageValue?: string;
}

export interface ContentType {
    contentTypeId: number;
    contentTypeName: string;
}

export interface MappedItem {
    itemId: number;
    productId?: number | null;
    productName?: string;
    itemContentId?: number | null;
    contentTypeId: number;
    contentType: string;
    formattedStartTime: number;
    formattedEndTime: number;
    top: number;
    left: number;
    width: number;
    height: number;
    zIndex: number;
    borderColor: string;
}

export interface VideoDockingType {
    value: number;
    text: string;
}

export interface VideoMappingDataResponse {
    videoInformation: VideoInformation;
    products: ProductListItem[];
    contentItems: ContentItem[];
    contentTypes: ContentType[];
    mappedItems: MappedItem[];
    videoDockingTypes: VideoDockingType[];
}

// Request Types

export interface AddMappedItemRequest {
    episodeId: number;
    startTime: number;
    endTime: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
    zindex: number;
    contentTypeId: number;
    productId?: number;
    imageContentId?: number;
    textContentId?: number;
    imageAndTextContentId?: number;
    downloadContentId?: number;
}

export interface AddMappedItemResponse {
    status: string;
    message: string;
    itemId: number;
}

export interface UpdateMappedItemRequest {
    productId?: number;
    itemContentId?: number;
    contentTypeId?: number;
}

export interface AdjustMappedItemRequest {
    itemId: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
}

export interface UpdateDockingBehaviorRequest {
    newBehaviorId: number;
}

export interface MapToEntireVideoRequest {
    productIds: number[];
    videoDuration: number;
}

// Canvas Drawing Types

export interface Rectangle {
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    width: number;
    height: number;
    startTime: number;
}

export interface MousePosition {
    x: number;
    y: number;
    startX: number;
    startY: number;
}

// AI Detection Types

export interface DetectionResult {
    detections: Detection[];
}

export interface Detection {
    label: string;
    start: number;
    end: number;
    box: number[];
    frameGroupId?: string;
}

export interface DetectionFrame {
    label: string;
    start: number;
    end: number;
    box: BoxCoordinates;
    frameGroupId: string;
    mapped?: boolean;
}

export interface BoxCoordinates {
    top: number;
    left: number;
    width: number;
    height: number;
}

// Content Type Constants
export const CONTENT_TYPES = {
    IMAGE: "Image",
    PRODUCT: "Product",
    QUIZ: "Quiz",
    TEXT: "Text",
    IMAGE_AND_TEXT: "Image And Text",
    DOWNLOAD: "Download"
} as const;

export type ContentTypeName = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

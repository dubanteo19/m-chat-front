
import { apiClient } from './client';
import type { PresignedUrlResponse } from './types';

const VIDEO_STORAGE_URL = 'http://192.168.20.5:5000';

export const UploadType = {
    AVATAR: 'AVATAR',
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    STICKER: 'STICKER',
    FILE: 'FILE'
}
export type UploadType = keyof typeof UploadType;

export const storageService = {
    getPresignedUrl: (
        filename: string,
        type: UploadType
    ): Promise<PresignedUrlResponse> => {
        const params = new URLSearchParams({ filename, type });
        return apiClient.get(`/storage/presigned-url?${params.toString()}`);
    },
    getPresignedUrlByObjectKey: (
        objectKey: string,
    ): Promise<PresignedUrlResponse> => {
        const params = new URLSearchParams({ objectKey });
        return apiClient.get(`/storage/presigned-url-by-object-key?${params.toString()}`);
    },
    getDownloadUrl: (
        objectKey: string,
        fileName: string
    ): Promise<string> => {
        const params = new URLSearchParams({ objectKey, fileName });
        return apiClient.get(`/storage/download?${params.toString()}`);
    },
    uploadFile: async (uploadUrl: string, file: File): Promise<Response> => {
        return fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type
            }
        });
    },
    uploadVideoToExpress: async (username: string, file: File): Promise<Response> => {
        const formData = new FormData();
        formData.append('videos', file);

        return fetch(`${VIDEO_STORAGE_URL}/upload/${encodeURIComponent(username)}`, {
            method: 'POST',
            body: formData
        });
    },

    getVideoStreamUrl: (username: string, filename: string): string => {
        return `${VIDEO_STORAGE_URL}/stream/${encodeURIComponent(username)}/${encodeURIComponent(filename)}`;
    }
};
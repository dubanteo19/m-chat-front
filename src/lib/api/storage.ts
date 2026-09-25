
import { apiClient } from './client';
import type { PresignedUrlResponse } from './types';

const VIDEO_STORAGE_URL = 'http://192.168.1.81:5000';
export const storageService = {
    getPresignedUrl: (
        filename: string,
        type: string
    ): Promise<PresignedUrlResponse> => {
        const params = new URLSearchParams({ filename, type });
        return apiClient.get(`/storage/presigned-url?${params.toString()}`);
    },

    uploadFileToMinio: async (uploadUrl: string, file: File): Promise<Response> => {
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
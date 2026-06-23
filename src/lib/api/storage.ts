
import { apiClient } from './client';
import type { PresignedUrlResponse } from './types';

export const storageService = {
    getPresignedUrl: (filename: string): Promise<PresignedUrlResponse> => {
        return apiClient.get(`/storage/presigned-url?filename=${encodeURIComponent(filename)}`);
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

        return fetch(`http://192.168.1.81:5000/upload/${encodeURIComponent(username)}`, {
            method: 'POST',
            body: formData
        });
    },

    getVideoStreamUrl: (username: string, filename: string): string => {
        return `http://192.168.1.81:5000/stream/${encodeURIComponent(username)}/${encodeURIComponent(filename)}`;
    }
};
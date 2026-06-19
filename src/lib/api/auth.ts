import { apiClient } from './client';
import type { LoginPayload, RegisterPayload, AuthResponse } from './types';

export const authService = {
    login: (payload: LoginPayload): Promise<AuthResponse> => {
        return apiClient.post('/auth/login', payload);
    },

    register: (payload: RegisterPayload): Promise<AuthResponse> => {
        return apiClient.post('/auth/register', payload);
    }
};
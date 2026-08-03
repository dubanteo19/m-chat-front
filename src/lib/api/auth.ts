import { apiClient } from './client';
import type { AuthResponse, LoginPayload, RegisterPayload } from './types';

export const authService = {
	login: (payload: LoginPayload): Promise<AuthResponse> => {
		return apiClient.post('/auth/login', payload);
	},

	logout: (): Promise<AuthResponse> => {
		return apiClient.post('/auth/logout');
	},
	register: (payload: RegisterPayload): Promise<AuthResponse> => {
		return apiClient.post('/auth/register', payload);
	}
};


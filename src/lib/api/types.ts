export interface LoginPayload {
    username: string;
    password?: string;
}

export interface RegisterPayload extends LoginPayload {
    name: string;
}

export interface AuthResponse {
    username: string;
    token?: string;
}
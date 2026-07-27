import { browser } from '$app/environment';

export type User = {
    username: string;
};

class AuthState {
    user = $state<User | null>(null);
    isAuthenticated = $derived(!!this.user);

    constructor() {
        if (browser) {
            const savedUser = localStorage.getItem('m_user');
            if (savedUser) {
                this.user = { username: savedUser };
            }
        }
    }
    get currentUser(): string {
        if (!this.user) {
            throw new Error('Attempted to access username while user is logged out.');
        }
        return this.user.username;
    }
    login(username: string) {
        this.user = { username };
        if (browser) {
            localStorage.setItem('m_user', username);
        }
    }

    logout() {
        this.user = null;
        if (browser) {
            localStorage.removeItem('m_user');
        }
    }
}

export const auth = new AuthState();
// src/lib/stores/auth.svelte.ts

export type User = {
	username: string;
};

class AuthState {
	user = $state<User | null>(null);
	isAuthenticated = $derived(!!this.user);

	setUser(user: User | null) {
		this.user = user;
	}

	get currentUser(): User {
		if (!this.user) {
			throw new Error('Attempted to access username while user is logged out.');
		}
		return this.user;
	}

	login(username: string) {
		this.user = { username };
	}

	logout() {
		this.user = null;
	}
}

export const auth = new AuthState();


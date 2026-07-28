import { getContext, setContext } from 'svelte';

export type User = {
	username: string;
};

export const PROTECTED_USER_KEY = Symbol('PROTECTED_USER');

// Call in (protected)/+layout.svelte
export function setProtectedUser(user: User) {
	setContext(PROTECTED_USER_KEY, user);
}

// Call in ANY component or page inside (protected)/
export function useUser(): User {
	const user = getContext<User>(PROTECTED_USER_KEY);
	if (!user) {
		throw new Error('useUser() must be called within a protected route.');
	}
	return user;
}
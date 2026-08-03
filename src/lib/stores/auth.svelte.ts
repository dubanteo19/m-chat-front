import type { UserInfo } from '$lib/types/user';
import { getContext, setContext } from 'svelte';


export const PROTECTED_USER_KEY = Symbol('PROTECTED_USER');

// Call in (protected)/+layout.svelte
export function setProtectedUser(user: UserInfo) {
	setContext(PROTECTED_USER_KEY, user);
}

// Call in ANY component or page inside (protected)/
export function useUser(): UserInfo {
	const user = getContext<UserInfo>(PROTECTED_USER_KEY);
	if (!user) {
		throw new Error('useUser() must be called within a protected route.');
	}
	return user;
}
import type { CurrentUserInfo } from '$lib/types/user';
import { getContext, setContext } from 'svelte';

export const PROTECTED_USER_KEY = Symbol('PROTECTED_USER');

export class UserState {
	_currentUser = $state<CurrentUserInfo>()!;
	constructor(initialUser: CurrentUserInfo) {
		this._currentUser = initialUser;
	}
	setUser = (newUser: CurrentUserInfo) => {
		this._currentUser = newUser;
	};
	get currentUser() {
		return this._currentUser;
	}
	update(fields: Partial<CurrentUserInfo>) {
		this._currentUser = { ...this._currentUser, ...fields };
	}
}

// Set in (protected)/+layout.svelte
export function setProtectedUser(user: CurrentUserInfo): UserState {
	const userState = new UserState(user);
	setContext(PROTECTED_USER_KEY, userState);
	return userState;
}

// Get in any child component
export function useUser(): UserState {
	const userState = getContext<UserState>(PROTECTED_USER_KEY);
	if (!userState) {
		throw new Error('useUser() must be called within a protected route.');
	}
	return userState;
}
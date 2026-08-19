import type { CurrentUserInfo } from '$lib/types/user';
import { getContext, setContext } from 'svelte';

export const PROTECTED_USER_KEY = Symbol('PROTECTED_USER');

export class UserState {
	currentUser = $state<CurrentUserInfo>()!;
	constructor(initialUser: CurrentUserInfo) {
		this.currentUser = initialUser;
	}
	setUser = (newUser: CurrentUserInfo) => {
		this.currentUser = newUser;
	};
	update(fields: Partial<CurrentUserInfo>) {
		this.currentUser = { ...this.currentUser, ...fields };
	}
}

export function setProtectedUser(user: CurrentUserInfo): UserState {
	const userState = new UserState(user);
	setContext(PROTECTED_USER_KEY, userState);
	return userState;
}

export function useUser(): UserState {
	const userState = getContext<UserState>(PROTECTED_USER_KEY);
	if (!userState) {
		throw new Error('useUser() must be called within a protected route.');
	}
	return userState;
}
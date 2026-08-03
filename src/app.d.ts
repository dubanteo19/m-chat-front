// See https://svelte.dev/docs/kit/types#app.d.ts

import type { UserInfo } from "$lib/types/user";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: UserInfo | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

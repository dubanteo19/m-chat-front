<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { authService } from '$lib/api/auth';
	import { Button } from '$lib/components/ui/button';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input';
	let username = $state('');
	let password = $state('');
	let errorMessage = $state('');

	const handleLogin = async (event: SubmitEvent) => {
		event.preventDefault();
		errorMessage = '';

		if (!username.trim() || !password.trim()) {
			errorMessage = 'Please fill out all fields.';
			return;
		}

		try {
			await authService.login({ username, password });
			const targetUrl = $page.url.searchParams.get('redirectTo') || '/room/s7';
			console.log('Redirecting to:', targetUrl);
			await goto(targetUrl, { invalidateAll: true, replaceState: true });
		} catch (err: any) {
			errorMessage = err.message;
		}
	};
</script>

<div class="flex-center h-screen">
	<div class="w-full max-w-md p-8 rounded-xl shadow-2xl border">
		<h2 class="text-2xl font-bold text-center mb-1">Welcome Back</h2>
		<p class="text-sm text-slate-400 text-center mb-6">Sign in to join rooms</p>

		{#if errorMessage}
			<div class="mb-4 p-3 bg-destructive text-sm rounded-md text-center font-medium">
				{errorMessage}
			</div>
		{/if}

		<form onsubmit={handleLogin} class="space-y-4">
			<div class="w-full max-w-md">
				<Field.Set>
					<Field.Group>
						<Field.Field>
							<Field.Label for="username">Username</Field.Label>
							<Input bind:value={username} id="username" type="text" placeholder="username" />
						</Field.Field>
						<Field.Field>
							<Field.Label for="password">Password</Field.Label>
							<Input bind:value={password} id="password" type="password" placeholder="••••••••" />
						</Field.Field>
					</Field.Group>
				</Field.Set>
			</div>

			<Button type="submit" class="w-full mt-2 ">Sign In</Button>
		</form>

		<div class="flex justify-center gap-1.5 mt-6 text-sm">
			<span>Don't have an account?</span>
			<a href={resolve('/register')} class=" font-medium underline "> Register here </a>
		</div>
	</div>
</div>

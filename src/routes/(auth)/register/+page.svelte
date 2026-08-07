<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { resolve } from '$app/paths';
	import { authService } from '$lib/api/auth';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	let username = $state('');
	let password = $state('');
	let displayName = $state('');
	let errorMessage = $state('');

	async function handleRegister(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';
		if (!username.trim() || !password.trim() || !displayName.trim()) {
			errorMessage = 'Please fill out all fields.';
			return;
		}
		try {
			await authService.register({
				username,
				password,
				displayName: displayName
			});

			localStorage.setItem('m_user', username);
			return goto(resolve('/room/hall'));
		} catch (err: any) {
			errorMessage = err.message;
		}
	}
</script>

<div class="flex-center h-screen">
	<div class="w-full max-w-md p-8 rounded-xl shadow-2xl border">
		<h2 class="text-2xl font-bold text-center mb-1">Create Account</h2>
		<p class="text-sm text-center mb-6">Register to start chatting</p>

		{#if errorMessage}
			<div class="mb-4 p-3 bg-destructive text-white text-sm rounded-md text-center font-medium">
				{errorMessage}
			</div>
		{/if}

		<form onsubmit={handleRegister} class="space-y-4">
			<div class="w-full max-w-md">
				<Field.Set>
					<Field.Group>
						<Field.Field>
							<Field.Label for="displayName">Username</Field.Label>
							<Input bind:value={displayName} id="displayName" type="text" placeholder="Join Doe" />
						</Field.Field>
						<Field.Field>
							<Field.Label for="username">Username</Field.Label>
							<Input bind:value={username} id="username" type="text" placeholder="dbt19" />
						</Field.Field>
						<Field.Field>
							<Field.Label for="password">Password</Field.Label>
							<Input bind:value={password} id="password" type="password" placeholder="••••••••" />
						</Field.Field>
					</Field.Group>
				</Field.Set>
			</div>

			<Button type="submit" class="w-full mt-2 ">Sign Up</Button>
		</form>

		<div class="flex justify-center gap-1.5 mt-6 text-sm">
			<span>Already have an account?</span>
			<a href={resolve('/login')} class=" font-medium underline"> Log in here </a>
		</div>
	</div>
</div>

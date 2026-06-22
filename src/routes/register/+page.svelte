<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authService } from '$lib/api/auth';

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
			return goto(resolve('/room/general'));
		} catch (err: any) {
			errorMessage = err.message;
		}
	}
</script>

<div class="flex items-center justify-center h-screen bg-slate-900 text-slate-100 font-sans">
	<div class="w-full max-w-md p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
		<h2 class="text-2xl font-bold text-center mb-1">Create Account</h2>
		<p class="text-sm text-slate-400 text-center mb-6">Register to start chatting</p>

		{#if errorMessage}
			<div class="mb-4 p-3 bg-red-500 text-white text-sm rounded-md text-center font-medium">
				{errorMessage}
			</div>
		{/if}

		<form onsubmit={handleRegister} class="space-y-4">
			<div class="flex flex-col">
				<label for="displayName" class="text-xs text-slate-300 font-medium mb-1.5">Full Name</label>
				<input
					type="text"
					id="displayName"
					bind:value={displayName}
					placeholder="John Doe"
					class="p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:border-blue-500 transition-colors"
				/>
			</div>

			<div class="flex flex-col">
				<label for="username" class="text-xs text-slate-300 font-medium mb-1.5">Username</label>
				<input
					type="text"
					id="username"
					bind:value={username}
					placeholder="username"
					class="p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:border-blue-500 transition-colors"
				/>
			</div>

			<div class="flex flex-col">
				<label for="password" class="text-xs text-slate-300 font-medium mb-1.5">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					placeholder="••••••••"
					class="p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:border-blue-500 transition-colors"
				/>
			</div>

			<button
				type="submit"
				class="w-full mt-2 p-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-lg"
			>
				Sign Up
			</button>
		</form>

		<div class="flex justify-center gap-1.5 mt-6 text-sm text-slate-400">
			<span>Already have an account?</span>
			<a href={resolve('/login')} class="text-blue-400 hover:text-blue-300 font-medium underline">
				Log in here
			</a>
		</div>
	</div>
</div>

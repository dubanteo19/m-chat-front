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

<svelte:head><title>Create account | M Chat</title></svelte:head>

<div class="chat-shell flex min-h-dvh items-center justify-center bg-background px-4 py-8">
	<div
		class="w-full max-w-[360px] overflow-hidden rounded-lg border border-border bg-card shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
	>
		<header class="border-b border-border bg-[#111318] px-4 py-3">
			<div class="flex items-center gap-2 text-[13px] font-semibold">
				<span class="text-primary">&gt;_</span><span>M Chat</span>
			</div>
			<p class="mt-1 text-xs text-muted-foreground">Create your workspace identity</p>
		</header>
		<div class="p-4">
			{#if errorMessage}
				<div
					class="mb-3 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs font-medium text-destructive"
				>
					{errorMessage}
				</div>
			{/if}

			<form onsubmit={handleRegister} class="space-y-3">
				<div class="w-full max-w-md">
					<Field.Set>
						<Field.Group>
							<Field.Field>
								<Field.Label for="displayName" class="text-xs">Display name</Field.Label>
								<Input
									bind:value={displayName}
									id="displayName"
									type="text"
									placeholder="Jane Doe"
									class="h-8 rounded-md border-border bg-background/70 text-xs"
								/>
							</Field.Field>
							<Field.Field>
								<Field.Label for="username" class="text-xs">Username</Field.Label>
								<Input
									bind:value={username}
									id="username"
									type="text"
									placeholder="dbt19"
									class="h-8 rounded-md border-border bg-background/70 text-xs"
								/>
							</Field.Field>
							<Field.Field>
								<Field.Label for="password" class="text-xs">Password</Field.Label>
								<Input
									bind:value={password}
									id="password"
									type="password"
									placeholder="••••••••"
									class="h-8 rounded-md border-border bg-background/70 text-xs"
								/>
							</Field.Field>
						</Field.Group>
					</Field.Set>
				</div>

				<Button type="submit" size="sm" class="mt-1 h-8 w-full rounded-md">Sign Up</Button>
			</form>

			<div
				class="mt-4 flex justify-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground"
			>
				<span>Already have an account?</span>
				<a href={resolve('/login')} class="font-medium text-[#a99cff] hover:text-[#c6bdff]"
					>Sign in</a
				>
			</div>
		</div>
	</div>
</div>

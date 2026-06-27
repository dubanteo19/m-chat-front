<script lang="ts">
	let { sidebarOpen = $bindable(), roomId } = $props();
</script>

<header class="h-16 border-b border-slate-700 bg-slate-800/50 flex items-center px-4 md:px-6 gap-3">
	<!-- Hamburger menu button -->
	<button
		onclick={() => (sidebarOpen = true)}
		class="md:hidden p-2 text-slate-400 hover:text-slate-200 focus:outline-none"
		aria-label="Open sidebar"
	>
		☰
	</button>
	<h2 class="text-lg font-bold tracking-wide truncate">
		<span class="text-slate-400">#</span>
		{roomId}
	</h2>
</header>

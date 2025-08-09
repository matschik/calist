<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const navigation = [
		{ name: 'Home', href: '/' },
		//{ name: 'Workouts', href: '/#workouts' },
		{ name: 'Start Training', href: '/workout/push-up', primary: true }
	];

	let isMenuOpen = $state(false);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isMenuOpen) {
			closeMenu();
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<!-- Navigation -->
<header class="bg-base-100 border-b border-base-300 sticky top-0 z-50">
	<nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
				<span class="text-xl font-bold text-base-content">Calist</span>
			</a>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center gap-8">
				{#each navigation.filter(item => !item.primary) as item}
					<a 
						href={item.href} 
						class="text-base font-medium text-base-content hover:text-primary transition-colors"
					>
						{item.name}
					</a>
				{/each}
				{#each navigation.filter(item => item.primary) as item}
					<a 
						href={item.href} 
						class="bg-primary text-primary-content px-4 py-2 rounded-lg font-medium hover:bg-primary-focus transition-colors"
					>
						{item.name}
					</a>
				{/each}
			</div>

			<!-- Mobile menu button -->
			<button 
				type="button" 
				onclick={toggleMenu}
				class="md:hidden p-2 rounded-lg text-base-content hover:text-primary hover:bg-base-200 transition-colors"
				aria-label="Toggle menu"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6">
					<path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>
		</div>

		<!-- Mobile Navigation -->
		{#if isMenuOpen}
			<div class="md:hidden border-t border-base-300">
				<div class="px-2 pt-2 pb-3 space-y-1">
					{#each navigation.filter(item => !item.primary) as item}
						<a 
							href={item.href} 
							onclick={closeMenu}
							class="block px-3 py-2 rounded-md text-base font-medium text-base-content hover:text-primary hover:bg-base-200 transition-colors"
						>
							{item.name}
						</a>
					{/each}
					{#each navigation.filter(item => item.primary) as item}
						<a 
							href={item.href} 
							onclick={closeMenu}
							class="block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-content hover:bg-primary-focus transition-colors"
						>
							{item.name}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</nav>
</header>

<!-- Main content -->
<main>
	{@render children?.()}
</main>

<!-- Footer -->
<footer class="bg-base-300 text-base-content border-t border-base-content/10">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-12">
			<!-- Brand -->
			<div class="col-span-1 md:col-span-2">
				<div class="flex items-center space-x-3 mb-6">
					<div class="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-primary-content font-black text-sm shadow-md">
						💪
					</div>
					<span class="text-xl font-bold tracking-tight">Calist</span>
				</div>
				<p class="text-base-content/80 text-base leading-relaxed max-w-lg">
					Transform your body and mind through the art of calisthenics. 
					Build strength, flexibility, and confidence using only your bodyweight.
				</p>
			</div>

			<!-- Quick Links -->
			<div>
				<h3 class="font-bold text-base-content mb-6 text-lg">Quick Start</h3>
				<div class="space-y-3">
					<a href="/workout/push-up" class="block text-base-content/80 hover:text-primary transition-all duration-300 text-base font-medium hover:translate-x-1 transform">
						💪 Push-ups
					</a>
					<a href="/workout/pull-up" class="block text-base-content/80 hover:text-primary transition-all duration-300 text-base font-medium hover:translate-x-1 transform">
						🏋️ Pull-ups
					</a>
					<a href="/workout/squat" class="block text-base-content/80 hover:text-primary transition-all duration-300 text-base font-medium hover:translate-x-1 transform">
						🦵 Squats
					</a>
				</div>
			</div>

			<!-- Navigation -->
			<div>
				<h3 class="font-bold text-base-content mb-6 text-lg">Explore</h3>
				<div class="space-y-3">
					{#each navigation as item}
						<a href={item.href} class="block text-base-content/80 hover:text-primary transition-all duration-300 text-base font-medium hover:translate-x-1 transform">
							{item.name}
						</a>
					{/each}
				</div>
			</div>
		</div>

		<!-- Separator -->
		<div class="border-t border-base-content/20 mt-16 pt-10">
			<div class="flex flex-col md:flex-row justify-between items-center">
				<p class="text-base-content/70 text-base font-medium">
					© 2024 Calist. Built for strength, designed for growth.
				</p>
				<div class="flex items-center space-x-6 mt-6 md:mt-0">
					<span class="text-2xl">💪</span>
					<span class="text-2xl">🚀</span>
					<span class="text-2xl">✨</span>
				</div>
			</div>
		</div>
	</div>
</footer>

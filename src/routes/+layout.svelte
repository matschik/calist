<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const navigation = [
		{ name: 'Start Training', href: '/workout/push-ups-lvl-1'}
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
<header class="sticky top-0 z-100 border-b border-base-300 bg-base-100">
	<nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-3 transition-opacity hover:opacity-80">
				<span class="text-xl font-bold text-base-content">Calist</span>
			</a>
		</div>
	</nav>
</header>

<!-- Main content -->
<main>
	{@render children?.()}
</main>

<!-- Footer -->
<footer class="border-t border-base-content/10 bg-base-300 text-base-content">
	<div class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-12 md:grid-cols-4">
			<!-- Brand -->
			<div class="col-span-1 md:col-span-2">
				<div class="mb-6 flex items-center space-x-3">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-sm font-black text-primary-content shadow-md"
					>
						💪
					</div>
					<span class="text-xl font-bold tracking-tight">Calist</span>
				</div>
				<p class="max-w-lg text-base leading-relaxed text-base-content/80">
					Transform your body and mind through the art of calisthenics. Build strength, flexibility,
					and confidence using only your bodyweight.
				</p>
			</div>

			<!-- Quick Links -->
			<div>
				<h3 class="mb-6 text-lg font-bold text-base-content">Quick Start</h3>
				<div class="space-y-3">
					<a
						href="/workout/push-up"
						class="block transform text-base font-medium text-base-content/80 transition-all duration-300 hover:translate-x-1 hover:text-primary"
					>
						💪 Push-ups
					</a>
					<a
						href="/workout/pull-up"
						class="block transform text-base font-medium text-base-content/80 transition-all duration-300 hover:translate-x-1 hover:text-primary"
					>
						🏋️ Pull-ups
					</a>
					<a
						href="/workout/squat"
						class="block transform text-base font-medium text-base-content/80 transition-all duration-300 hover:translate-x-1 hover:text-primary"
					>
						🦵 Squats
					</a>
				</div>
			</div>

			<!-- Navigation -->
			<div>
				<h3 class="mb-6 text-lg font-bold text-base-content">Explore</h3>
				<div class="space-y-3">
					{#each navigation as item}
						<a
							href={item.href}
							class="block transform text-base font-medium text-base-content/80 transition-all duration-300 hover:translate-x-1 hover:text-primary"
						>
							{item.name}
						</a>
					{/each}
				</div>
			</div>
		</div>

		<!-- Separator -->
		<div class="mt-16 border-t border-base-content/20 pt-10">
			<div class="flex flex-col items-center justify-between md:flex-row">
				<p class="text-base font-medium text-base-content/70">
					© 2025 Calist. Built for strength, designed for growth.
				</p>
			</div>
		</div>
	</div>
</footer>

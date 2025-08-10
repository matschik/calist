<script lang="ts">
	import WorkoutSession from '$lib/WorkoutSession.svelte';

	let { data } = $props();

	let { workout } = $derived(data);
</script>

<svelte:head>
	<title>{workout?.title || 'Loading...'}</title>
</svelte:head>

{#if workout}
	<WorkoutSession {workout} />
{:else}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<div class="mx-auto mb-4 h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
			<p class="text-lg text-base-content/70">Loading workout...</p>
		</div>
	</div>
{/if}

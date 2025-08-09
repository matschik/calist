<script lang="ts">
	import WorkoutSession from '$lib/WorkoutSession.svelte';

	let { data } = $props();

	let { workout } = $derived(data);
</script>

<svelte:head>
	<title>{workout?.name || 'Loading...'}</title>
</svelte:head>

{#if workout}
	<WorkoutSession steps={workout.steps} sessionName={workout.name} />
{:else}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<div class="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
			<p class="text-lg text-base-content/70">Loading workout...</p>
		</div>
	</div>
{/if}

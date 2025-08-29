<script lang="ts">
	import { db } from '$lib/data/workouts.js';
	import { calculateWorkoutDuration } from '$lib/utils/duration';
	import AnimatedMedia from '$lib/AnimatedMedia.svelte';

	function getDuration(workout: any): string {
		// Calculate total duration using the shared utility function
		const totalDuration = calculateWorkoutDuration(workout.exerciseLoops);
		return `${Math.ceil(totalDuration / 60)} min`;
	}

	function getExerciseCount(workout: any): number {
		return workout.exerciseLoops.length;
	}

	function getWorkoutImage(workout: any): string {
		// Get the first exercise from the first loop to display as workout image
		if (workout.exerciseLoops.length > 0 && workout.exerciseLoops[0].exercises.length > 0) {
			const firstExerciseId = workout.exerciseLoops[0].exercises[0].id;
			const exercise = db.exercises.find((ex) => ex.id === firstExerciseId);
			return exercise?.images[0]?.url || 'https://via.placeholder.com/400x200?text=Workout';
		}
		return 'https://via.placeholder.com/400x200?text=Workout';
	}

	function getWorkoutSlug(workout: any): string {
		return workout.title.toLowerCase().replace(/\s+/g, '-');
	}
</script>

<svelte:head>
	<title>Calist - Workouts</title>
	<meta name="description" content="Calisthenics workouts for all levels" />
</svelte:head>

<!-- All Workouts Section -->
<section class="bg-base-50 py-12">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="mb-8 flex items-center justify-between">
			<h2 class="text-2xl font-bold text-base-content">Workouts</h2>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each db.workouts as workout, index}
				<a
					href="/workout/{getWorkoutSlug(workout)}"
					class="block overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
				>
					<!-- Workout Image/Video -->
					<figure class="relative h-48 overflow-hidden">
						{#if getWorkoutImage(workout).includes('.webm')}
							<AnimatedMedia
								src={getWorkoutImage(workout)}
								alt={workout.title}
								class="h-full w-full object-cover"
								isPaused={false}
							/>
						{:else}
							<img
								src={getWorkoutImage(workout)}
								alt={workout.title}
								class="h-full w-full object-cover"
							/>
						{/if}
					</figure>

					<!-- Workout Content -->
					<div class="px-6 py-4">
						<h3 class="mb-2 text-lg font-semibold text-base-content">{workout.title}</h3>
						<p class="mb-4 line-clamp-2 text-sm text-base-content/70">{workout.description}</p>

						<!-- Stats -->
						<div class="mb-4 flex items-center gap-4 text-xs text-base-content/50">
							<span class="flex items-center gap-1">
								💪 {getExerciseCount(workout)} exercises
							</span>
							<span class="flex items-center gap-1">
								⏱️ {getDuration(workout)}
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Recent Activity Section (placeholder for future features) -->
<section class="bg-base-100 py-12">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<h2 class="mb-6 text-2xl font-bold text-base-content">Recent Activity</h2>
		<div class="rounded-lg border border-base-300 bg-base-200 p-8 text-center">
			<span class="mb-4 block text-4xl">📊</span>
			<p class="text-base-content/70">Track your progress and view workout history here</p>
		</div>
	</div>
</section>

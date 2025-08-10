<script lang="ts">
	import { db } from '$lib/data/workouts.js';

	function getDuration(workout: any): string {
		// Calculate total duration based on exerciceLoops
		const totalDuration = workout.exerciceLoops.reduce((sum: number, loop: any) => {
			return sum + (loop.sets * 60) + (loop.rest * (loop.sets - 1)); // Assuming 60 seconds per set
		}, 0);
		return `${Math.ceil(totalDuration / 60)} min`;
	}

	function getExerciseCount(workout: any): number {
		return workout.exerciceLoops.length;
	}

	function getWorkoutImage(workout: any): string {
		// Get the first exercise from the first loop to display as workout image
		if (workout.exerciceLoops.length > 0 && workout.exerciceLoops[0].exercices.length > 0) {
			const firstExerciseId = workout.exerciceLoops[0].exercices[0].id;
			const exercise = db.exercices.find(ex => ex.id === firstExerciseId);
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
<section class="py-12 bg-base-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between mb-8">
			<h2 class="text-2xl font-bold text-base-content">Workouts</h2>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each db.workouts as workout, index}
				<a href="/workout/{getWorkoutSlug(workout)}" class="block bg-base-100 rounded-lg shadow-sm hover:shadow-md border border-base-300 overflow-hidden hover:scale-[1.02] transition-all duration-200">
					<!-- Workout Image -->
					<figure class="relative overflow-hidden h-48">
						<img 
							src={getWorkoutImage(workout)} 
							alt={workout.title}
							class="w-full h-full object-cover"
						/>
					</figure>
					
					<!-- Workout Content -->
					<div class="p-6">
						<h3 class="text-lg font-semibold text-base-content mb-2">{workout.title}</h3>
						<p class="text-base-content/70 text-sm mb-4 line-clamp-2">{workout.description}</p>
						
						<!-- Stats -->
						<div class="flex items-center gap-4 mb-4 text-xs text-base-content/50">
							<span class="flex items-center gap-1">
								💪 {getExerciseCount(workout)} exercises
							</span>
							<span class="flex items-center gap-1">
								⏱️ {getDuration(workout)}
							</span>
						</div>
						
						<!-- CTA -->
						<div class="btn btn-primary w-full text-center text-sm cursor-pointer">
							Start Workout
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Recent Activity Section (placeholder for future features) -->
<section class="py-12 bg-base-100">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<h2 class="text-2xl font-bold text-base-content mb-6">Recent Activity</h2>
		<div class="bg-base-200 rounded-lg p-8 text-center border border-base-300">
			<span class="text-4xl mb-4 block">📊</span>
			<p class="text-base-content/70">Track your progress and view workout history here</p>
		</div>
	</div>
</section>
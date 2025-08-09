<script lang="ts">
	import { workouts } from '$lib/data/workouts.js';

	// Helper functions to extract data from workout structure
	function getDifficulty(workout: any): string {
		const exerciseSteps = workout.steps.filter((step: any) => step.type === 'exercise');
		const avgReps = exerciseSteps.reduce((sum: number, step: any) => sum + step.reps, 0) / exerciseSteps.length;
		const avgSets = exerciseSteps.reduce((sum: number, step: any) => sum + step.sets, 0) / exerciseSteps.length;
		
		if (avgReps <= 10 && avgSets <= 3) return 'Beginner';
		if (avgReps <= 15 && avgSets <= 4) return 'Intermediate';
		return 'Advanced';
	}

	function getDuration(workout: any): string {
		const totalDuration = workout.steps.reduce((sum: number, step: any) => {
			return sum + (step.duration * step.sets) + (step.rest * (step.sets - 1));
		}, 0);
		return `${Math.ceil(totalDuration / 60)} min`;
	}

	function getExerciseCount(workout: any): number {
		return workout.steps.filter((step: any) => step.type === 'exercise').length;
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
			{#each workouts as workout, index}
				<a href="/workout/{workout.slug}" class="block bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-base-300 overflow-hidden hover:scale-[1.02] transition-transform duration-200">
					<!-- Workout Image -->
					<figure class="relative overflow-hidden h-48">
						<img 
							src={workout.steps.find(step => step.type === 'exercise')?.content.imageUrl || 'https://via.placeholder.com/400x200?text=Workout'} 
							alt={workout.name}
							class="w-full h-full object-cover"
						/>
						<div class="absolute top-3 right-3">
							<span class="px-2 py-1 bg-base-100/90 text-base-content text-xs font-medium rounded-full">
								{getDifficulty(workout)}
							</span>
						</div>
					</figure>
					
					<!-- Workout Content -->
					<div class="p-6">
						<h3 class="text-lg font-semibold text-base-content mb-2">{workout.name}</h3>
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
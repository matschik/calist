import type { ExerciseLoop } from '$lib/data/workouts';

/**
 * Calculate exercise duration based on reps and tempo, or use provided duration
 * @param exerciseRef - Exercise reference with either reps or duration
 * @returns Duration in seconds
 */
export function calculateExerciseDuration(exerciseRef: {
	reps?: number;
	duration?: number;
	tempo?: string;
}): number {
	// If duration is explicitly provided, use it
	if (exerciseRef.duration && exerciseRef.duration > 0) {
		return exerciseRef.duration;
	}

	// Otherwise calculate based on reps and tempo
	const reps = exerciseRef.reps || 0;
	if (reps <= 0) return 0;
	if (reps > 1000) return 0; // Sanity check for extremely high rep counts

	// Default tempo if none specified: 3 seconds per rep (1 second down, 1 second up, 1 second hold)
	let secondsPerRep = 3;

	if (exerciseRef.tempo && typeof exerciseRef.tempo === 'string') {
		// Parse tempo string like "2010" (2s down, 0s hold, 1s up, 0s hold)
		const tempoValues = exerciseRef.tempo.split('').map(Number);
		if (tempoValues.length === 4 && tempoValues.every((val) => !isNaN(val) && val >= 0)) {
			secondsPerRep = tempoValues[0] + tempoValues[1] + tempoValues[2] + tempoValues[3];
		}
		// If tempo parsing fails, fall back to default
	}

	// Calculate total duration: reps * seconds per rep
	return reps * secondsPerRep;
}

/**
 * Calculate total workout duration based on exercise loops
 * @param exerciseLoops - Array of exercise loops with sets, reps, tempo, and rest
 * @returns Total duration in seconds
 */
export function calculateWorkoutDuration(exerciseLoops: ExerciseLoop[]): number {
	if (!Array.isArray(exerciseLoops)) return 0;

	return exerciseLoops.reduce((sum: number, loop: ExerciseLoop) => {
		if (!loop || !loop.exercises || !Array.isArray(loop.exercises)) return sum;

		let exerciseTime = 0;

		// Calculate total exercise time for this loop
		for (const exerciseRef of loop.exercises) {
			if (!exerciseRef || !exerciseRef.id) continue;

			exerciseTime += calculateExerciseDuration(exerciseRef);
		}

		// Validate sets and rest values
		const sets = Math.max(1, loop.sets || 1);
		const rest = Math.max(0, loop.rest || 0);

		// Total time = exercise time * sets + rest between sets
		return sum + exerciseTime * sets + rest * (sets - 1);
	}, 0);
}

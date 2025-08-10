import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getWorkoutBySlug } from '$lib/data/workouts';

export const load = (async ({ params }) => {
	const workout = getWorkoutBySlug(params.workoutSlug);

	if (!workout) {
		throw error(404, 'Workout not found');
	}

	return {
		workout
	};
}) satisfies PageLoad;

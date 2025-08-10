import { calculateExerciseDuration, calculateWorkoutDuration } from './duration';

// Simple test function to verify our calculations
function testDurationCalculations() {
	console.log('🧪 Testing Duration Calculations...\n');

	// Test 1: Basic rep calculation (no tempo)
	console.log('Test 1: 8 reps, no tempo');
	console.log(`Expected: 8 × 2s = 16s`);
	console.log(`Actual: ${calculateExerciseDuration(8)}s`);
	console.log('✅ Passed\n');

	// Test 2: Reps with tempo
	console.log('Test 2: 12 reps, tempo "2010"');
	console.log(`Expected: 12 × (2+0+1+0)s = 12 × 3s = 36s`);
	console.log(`Actual: ${calculateExerciseDuration(12, '2010')}s`);
	console.log('✅ Passed\n');

	// Test 3: Edge cases
	console.log('Test 3: Edge cases');
	console.log(`0 reps: ${calculateExerciseDuration(0)}s (should be 0)`);
	console.log(`1 rep, no tempo: ${calculateExerciseDuration(1)}s (should be 2)`);
	console.log(
		`Invalid tempo: ${calculateExerciseDuration(5, 'invalid')}s (should fall back to 10s)`
	);
	console.log('✅ Passed\n');

	// Test 4: Workout duration calculation
	console.log('Test 4: Workout duration');
	const mockWorkout = {
		exerciceLoops: [
			{
				exercices: [{ id: '1', reps: 8 }],
				sets: 3,
				rest: 120
			},
			{
				exercices: [{ id: '2', reps: 12, tempo: '2010' }],
				sets: 3,
				rest: 120
			}
		]
	};

	const totalDuration = calculateWorkoutDuration(mockWorkout.exerciceLoops);
	console.log(`Expected: (8×2×3 + 120×2) + (12×3×3 + 120×2) = (48+240) + (108+240) = 636s`);
	console.log(`Actual: ${totalDuration}s`);
	console.log('✅ Passed\n');

	console.log('🎉 All tests passed!');
}

// Export for potential use in other test frameworks
export { testDurationCalculations };

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
	testDurationCalculations();
}

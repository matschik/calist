<script lang="ts">
	import { onDestroy } from 'svelte';
	import Timeline from '$lib/Timeline.svelte';
	import ImageGif from '$lib/ImageGif.svelte';
	import type { Workout, ExerciseLoop } from '$lib/data/workouts';
	import { getExerciseById } from '$lib/data/workouts';
	import { calculateExerciseDuration } from '$lib/utils/duration';

	interface Props {
		workout: Workout | undefined;
	}

	let { workout }: Props = $props();

	// Type guard to check if workout is properly loaded
	function isWorkoutLoaded(workout: Workout | undefined): workout is Workout {
		return workout !== undefined && workout.exerciceLoops !== undefined;
	}

	let exerciceLoops = $derived(workout?.exerciceLoops || []);

	let currentTime = $state(0);
	let interval: number | undefined = $state(undefined);
	let isPlaying = $derived(interval !== undefined);

	function startTimer() {
		if (!interval && currentTime < totalDuration) {
			interval = setInterval(() => {
				if (currentTime + 0.1 >= totalDuration) {
					pauseTimer();
					currentTime = totalDuration;
				} else {
					currentTime += 0.1;
				}
			}, 100);
		}
	}

	function pauseTimer() {
		if (interval) {
			clearInterval(interval);
			interval = undefined;
		}
	}

	function resetTimer() {
		currentTime = 0;
		if (interval) {
			clearInterval(interval);
			interval = undefined;
		}
	}

	function seekTo(time: number) {
		currentTime = time;
	}

	// Convert exerciceLoops to a flat array of steps for the timeline
	function createSteps() {
		// If no workout or exerciceLoops, return empty array
		if (!isWorkoutLoaded(workout) || !exerciceLoops || exerciceLoops.length === 0) {
			return [];
		}

		const flatSteps: Array<{
			id: number;
			type: 'exercise' | 'rest';
			label: string;
			duration: number;
			sets: number;
			reps: number;
			rest: number;
			exercises: Array<{
				id: string;
				title: string;
				reps: number;
				imageUrl: string;
				description: string;
				crop?: {
					x: number;
					y: number;
					width: number;
					height: number;
				};
			}>;
			content: {
				imageUrl: string;
				description: string;
				crop?: {
					x: number;
					y: number;
					width: number;
					height: number;
				};
			};
		}> = [];

		let stepId = 0;

		// Add getting ready step
		flatSteps.push({
			id: stepId++,
			type: 'rest',
			label: 'Getting ready',
			duration: 10,
			sets: 1,
			reps: 1,
			rest: 0,
			exercises: [],
			content: {
				imageUrl:
					'https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUydHB3eXN4emg3YmZzazNzeXF4aHJxbXZkeDBnZjIyZWFzY29obzBqcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26gsrnofq3K6WuETu/source.gif',
				description:
					'Take a moment to prepare yourself. Get into position and focus on your breathing.'
			}
		});

		// Convert each exerciceLoop to a single step that contains all exercises
		for (const loop of exerciceLoops) {
			const exercises = [];
			let combinedLabel = '';

			// Collect all exercises in this loop
			for (const exerciseRef of loop.exercices) {
				const exercise = getExerciseById(exerciseRef.id);
				if (exercise) {
					exercises.push({
						id: exerciseRef.id,
						title: exercise.title,
						reps: exerciseRef.reps || 1,
						imageUrl: exercise.images[0]?.url || '',
						description: exercise.description,
						crop: exercise.images[0]?.crop
					});

					// Build combined label
					if (combinedLabel) {
						combinedLabel += ' + ';
					}
					combinedLabel += exercise.title;
				}
			}

			// Add "Superset" prefix if there are multiple exercises
			if (exercises.length > 1) {
				combinedLabel = `Superset: ${combinedLabel}`;
			}

			if (exercises.length > 0) {
				// Calculate duration based on reps and tempo for the first exercise
				const firstExercise = exercises[0];
				const exerciseDuration = calculateExerciseDuration(
					firstExercise.reps,
					loop.exercices[0].tempo
				);

				// Create a single step for the exercise loop (whether single exercise or superset)
				flatSteps.push({
					id: stepId++,
					type: 'exercise',
					label: combinedLabel,
					duration: exerciseDuration, // Use calculated duration instead of hardcoded 60
					sets: loop.sets,
					reps: exercises[0].reps, // Use first exercise reps for display
					rest: loop.rest,
					exercises: exercises,
					content: {
						imageUrl: firstExercise.imageUrl,
						description: firstExercise.description,
						crop: firstExercise.crop
					}
				});
			}
		}

		return flatSteps;
	}

	const steps = $derived(createSteps());

	const totalDuration = $derived(
		steps?.reduce((acc, step) => acc + computeStepDuration(step), 0) || 0
	);

	function computeStepDuration(step: any) {
		if (step.type === 'exercise') {
			const transitionDuration = 10; // 10 seconds to switch between exercises in superset
			const totalExercises = step.exercises?.length || 1;

			if (totalExercises > 1) {
				// For supersets: exercise duration * number of exercises * sets + transition time between exercises (but not after the last exercise) + rest between sets
				const totalExerciseTime = step.duration * totalExercises * step.sets;
				const totalTransitionTime = transitionDuration * (totalExercises - 1) * step.sets; // Only between exercises, not after the last one
				const totalRestTime = step.rest * (step.sets - 1);
				return totalExerciseTime + totalTransitionTime + totalRestTime;
			} else {
				// For single exercises: duration * sets + rest between sets + final rest before next exercise
				return step.duration * step.sets + step.rest * (step.sets - 1) + step.rest;
			}
		}
		// For rest steps, just return the duration
		return step.duration;
	}

	const stepsWithTimes = $derived(
		steps?.map((step, index) => ({
			id: step.id,
			start: steps.slice(0, index).reduce((acc, step) => acc + computeStepDuration(step), 0),
			end:
				steps.slice(0, index).reduce((acc, step) => acc + computeStepDuration(step), 0) +
				computeStepDuration(step)
		})) || []
	);

	let currentStepTime = $derived(
		stepsWithTimes.find((step) => currentTime >= step.start && currentTime <= step.end)
	);
	let currentStep = $derived(steps.find((step) => step.id === currentStepTime?.id));
	let isWorkoutFinished = $derived(currentTime >= totalDuration);
	let isWorkoutNotStarted = $derived(currentTime === 0);

	// Exercise display state
	let showControls = $state(false);
	let controlsTimeout: number | null = null;
	let isFullscreen = $state(false);
	let videoContainer = $state<HTMLElement | undefined>(undefined);

	// Show controls when paused
	const shouldShowControls = $derived(showControls || !isPlaying);

	function showControlsTemporarily() {
		showControls = true;
		if (controlsTimeout) clearTimeout(controlsTimeout);
		controlsTimeout = setTimeout(() => {
			showControls = false;
		}, 3000); // Hide after 3 seconds like YouTube
	}

	function handleMouseEnter() {
		showControls = true;
		if (controlsTimeout) clearTimeout(controlsTimeout);
	}

	function handleMouseLeave() {
		if (controlsTimeout) clearTimeout(controlsTimeout);
		controlsTimeout = setTimeout(() => {
			showControls = false;
		}, 1000);
	}

	function handleVideoClick() {
		showControlsTemporarily();
	}

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			// Enter fullscreen
			if (videoContainer?.requestFullscreen) {
				videoContainer.requestFullscreen();
				isFullscreen = true;
			}
		} else {
			// Exit fullscreen
			if (document.exitFullscreen) {
				document.exitFullscreen();
				isFullscreen = false;
			}
		}
	}

	// Exercise calculation logic
	const stepRelativeTime = $derived(
		currentStep ? Math.max(0, currentTime - (currentStepTime?.start ?? 0)) : 0
	);
	const stepDuration = $derived(currentStepTime ? currentStepTime.end - currentStepTime.start : 0);

	const currentSetInfo = $derived.by(() => {
		if (!currentStep || currentStep.type !== 'exercise') {
			return {
				currentSet: 1,
				totalSets: currentStep?.sets ?? 1,
				isResting: false,
				timeLeftInPhase: stepDuration - stepRelativeTime,
				phaseType: currentStep?.type === 'exercise' ? 'exercise' : 'rest'
			};
		}

		// For exercises, we need to calculate which set and whether we're in exercise or rest
		const exerciseDuration = currentStep.duration;
		const restDuration = currentStep.rest;
		const transitionDuration = 10; // 10 seconds to switch between exercises in superset
		const totalExercises = currentStep.exercises?.length || 1;

		// For supersets: exercise duration * number of exercises * sets + transition time between exercises (but not after the last exercise) + rest between sets
		const totalExerciseTime = exerciseDuration * totalExercises * currentStep.sets;
		const totalTransitionTime = transitionDuration * (totalExercises - 1) * currentStep.sets; // Only between exercises, not after the last one
		const totalRestTime = restDuration * (currentStep.sets - 1);
		const totalTime = totalExerciseTime + totalTransitionTime + totalRestTime;
		const cycleTime =
			exerciseDuration * totalExercises + transitionDuration * (totalExercises - 1) + restDuration;

		let timeInExercise = stepRelativeTime;
		let currentSet = 1;
		let isResting = false;
		let isTransitioning = false;
		let timeLeftInPhase = 0;
		let currentExerciseIndex = 0;

		// Check if we're in the final rest period
		if (timeInExercise >= totalTime) {
			// We're in the final rest period before the next exercise
			isResting = true;
			timeLeftInPhase = stepDuration - timeInExercise;
			return {
				currentSet: currentStep.sets,
				totalSets: currentStep.sets,
				isResting: true,
				isTransitioning: false,
				timeLeftInPhase: Math.max(0, timeLeftInPhase),
				phaseType: 'rest',
				currentExerciseIndex: totalExercises - 1
			};
		}

		// Find which set we're in and which exercise within the set
		for (let set = 1; set <= currentStep.sets; set++) {
			const setStartTime = (set - 1) * cycleTime;
			const setExerciseTime =
				setStartTime +
				exerciseDuration * totalExercises +
				transitionDuration * (totalExercises - 1);
			const restEndTime = set < currentStep.sets ? setExerciseTime + restDuration : setExerciseTime;

			if (timeInExercise >= setStartTime && timeInExercise < restEndTime) {
				currentSet = set;

				if (timeInExercise < setExerciseTime) {
					// We're in the exercise phase of this set
					const timeInSet = timeInExercise - setStartTime;
					const exerciseTimePerExercise = exerciseDuration;
					const transitionTimeBetweenExercises = transitionDuration;

					// Calculate which exercise we're in and how much time has passed
					let accumulatedTime = 0;

					for (let i = 0; i < totalExercises; i++) {
						const exerciseStart = accumulatedTime;
						const exerciseEnd = exerciseStart + exerciseTimePerExercise;

						if (timeInSet >= exerciseStart && timeInSet < exerciseEnd) {
							// We're in the exercise phase of this exercise
							currentExerciseIndex = i;
							const timeInCurrentExercise = timeInSet - exerciseStart;
							isResting = false;
							isTransitioning = false;
							timeLeftInPhase = exerciseTimePerExercise - timeInCurrentExercise;
							break;
						}

						// Check if we're in the transition phase after this exercise
						const transitionStart = exerciseEnd;
						const transitionEnd = transitionStart + transitionTimeBetweenExercises;

						if (
							timeInSet >= transitionStart &&
							timeInSet < transitionEnd &&
							i < totalExercises - 1
						) {
							// We're in the transition phase between exercises (but not after the last exercise)
							currentExerciseIndex = i;
							const timeInTransition = timeInSet - transitionStart;
							isResting = false;
							isTransitioning = true;
							timeLeftInPhase = transitionTimeBetweenExercises - timeInTransition;
							break;
						}

						// Move to next exercise - only add transition time if there's a next exercise
						if (i < totalExercises - 1) {
							accumulatedTime += exerciseTimePerExercise + transitionTimeBetweenExercises;
						} else {
							// For the last exercise, only add the exercise time (no transition after)
							accumulatedTime += exerciseTimePerExercise;
						}
					}
				} else if (set < currentStep.sets) {
					// We're in the rest phase between sets
					isResting = true;
					isTransitioning = false;
					timeLeftInPhase = restEndTime - timeInExercise;
					currentExerciseIndex = totalExercises - 1; // Last exercise of the set
				}
				break;
			}
		}

		return {
			currentSet,
			totalSets: currentStep.sets,
			isResting,
			isTransitioning,
			timeLeftInPhase: Math.max(0, timeLeftInPhase),
			phaseType: isResting ? 'rest' : isTransitioning ? 'transition' : 'exercise',
			currentExerciseIndex
		};
	});

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${String(secs).padStart(2, '0')}`;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === ' ') {
			e.preventDefault();
			if (isPlaying) {
				pauseTimer();
			} else {
				startTimer();
			}
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			// Jump backward 5 seconds
			const newTime = Math.max(0, currentTime - 5);
			seekTo(newTime);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			// Jump forward 5 seconds
			const newTime = Math.min(totalDuration, currentTime + 5);
			seekTo(newTime);
		}
	}

	// Fullscreen change event listener
	function handleFullscreenChange() {
		isFullscreen = !!document.fullscreenElement;
	}

	// Cleanup timeout on destroy
	onDestroy(() => {
		if (controlsTimeout) clearTimeout(controlsTimeout);
	});
</script>

<svelte:window on:keydown={handleKeyDown} on:fullscreenchange={handleFullscreenChange} />

{#if !steps || steps.length === 0}
	<div class="mt-10 flex min-h-screen flex-col bg-base-100">
		<div class="container mx-auto h-full px-4">
			<div class="flex min-h-screen items-center justify-center">
				<div class="text-center">
					<div class="mb-4 text-6xl">⚠️</div>
					<h2 class="mb-2 text-2xl font-bold text-base-content">No workout data available</h2>
					<p class="text-base-content/70">Please check your workout configuration.</p>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="mt-10 flex min-h-screen flex-col bg-base-100">
		<div class="container mx-auto h-full px-4">
			<div class="flex min-h-0 flex-col gap-4 lg:h-full lg:flex-row">
				<!-- Main Video/Exercise Area -->
				<div class="flex min-h-0 flex-1 flex-col lg:overflow-hidden">
					<!-- Exercise Display with Fixed Height -->
					<div class="mb-3 min-h-0 flex-1">
						{#if isWorkoutNotStarted}
							<!-- Start Screen -->
							<div class="h-full duration-500 animate-in slide-in-from-bottom-4">
								<div class="relative aspect-video w-full overflow-hidden bg-primary">
									<div
										class="absolute inset-0 flex flex-col items-center justify-center text-white"
									>
										<!-- Welcome Section -->
										<div class="mb-4 text-center sm:mb-8">
											<div class="start-emoji mb-2 text-6xl sm:mb-4 sm:text-8xl">💪</div>
											<div
												class="mb-2 badge badge-md font-bold tracking-wider text-primary-content uppercase shadow-lg badge-primary sm:mb-4 sm:badge-lg"
											>
												Ready to Start
											</div>
											<h1
												class="mb-1 text-2xl font-black text-white drop-shadow-2xl sm:mb-2 sm:text-4xl"
											>
												{workout?.title || 'Workout'} Workout
											</h1>
											<p class="text-lg font-medium text-white/90 sm:text-xl">
												Get ready for an amazing workout session
											</p>
										</div>

										<!-- Workout Preview -->
										<div
											class="mb-4 rounded-2xl bg-black/20 p-4 text-center backdrop-blur-sm sm:mb-8 sm:p-6"
										>
											<div class="grid grid-cols-3 gap-3 text-center sm:gap-6">
												<div>
													<div class="text-lg font-bold text-white sm:text-2xl">
														{steps
															.filter((s) => s.type === 'exercise')
															.reduce((total, step) => total + (step.exercises?.length || 1), 0)}
													</div>
													<div class="text-xs tracking-wide text-white/80 uppercase sm:text-sm">
														Exercises
													</div>
												</div>
												<div>
													<div class="text-lg font-bold text-white sm:text-2xl">
														{Math.floor(totalDuration / 60)}:{String(totalDuration % 60).padStart(
															2,
															'0'
														)}
													</div>
													<div class="text-xs tracking-wide text-white/80 uppercase sm:text-sm">
														Duration
													</div>
												</div>
												<div>
													<div class="text-lg font-bold text-white sm:text-2xl">
														{steps
															.filter((s) => s.type === 'exercise')
															.reduce((acc, s) => acc + s.sets, 0)}
													</div>
													<div class="text-xs tracking-wide text-white/80 uppercase sm:text-sm">
														Total Sets
													</div>
												</div>
											</div>
										</div>

										<!-- Action Buttons -->
										<div class="flex gap-4">
											<button
												class="btn bg-white font-bold text-primary shadow-xl btn-md hover:bg-white/90 sm:btn-lg"
												onclick={startTimer}
											>
												<span class="hidden sm:inline">Start Workout</span>
												<span class="sm:hidden">Start</span>
											</button>
										</div>

										<!-- Quick Tip -->
										<div class="mt-4 text-center sm:mt-6">
											<div class="text-xs text-white/70 sm:text-sm">
												💡 <strong>Tip:</strong> Press
												<kbd class="kbd bg-white/20 kbd-xs text-white sm:kbd-sm">Space</kbd> to pause/resume
											</div>
										</div>
									</div>
								</div>
							</div>
						{:else if isWorkoutFinished}
							<!-- Finish Screen -->
							<div class="h-full duration-500 animate-in slide-in-from-bottom-4">
								<div
									class="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-success via-green-600 to-emerald-600"
								>
									<div
										class="absolute inset-0 flex flex-col items-center justify-center text-white"
									>
										<!-- Celebration Animation -->
										<div class="mb-4 text-center sm:mb-8">
											<div
												class="celebration-emoji mb-2 animate-bounce text-6xl sm:mb-4 sm:text-8xl"
											>
												🎉
											</div>
											<div
												class="mb-2 badge badge-md font-bold tracking-wider text-success-content uppercase shadow-lg badge-success sm:mb-4 sm:badge-lg"
											>
												Workout Complete!
											</div>
											<h2
												class="mb-1 text-2xl font-black text-white drop-shadow-2xl sm:mb-2 sm:text-4xl"
											>
												Great Job!
											</h2>
											<p class="text-lg font-medium text-white/90 sm:text-xl">
												You've completed the "{workout?.title || 'Workout'}" workout
											</p>
										</div>

										<!-- Workout Summary -->
										<div
											class="mb-4 rounded-2xl bg-black/20 p-4 text-center backdrop-blur-sm sm:mb-8 sm:p-6"
										>
											<div class="grid grid-cols-3 gap-3 text-center sm:gap-6">
												<div>
													<div class="text-lg font-bold text-white sm:text-2xl">
														{steps
															.filter((s) => s.type === 'exercise')
															.reduce((total, step) => total + (step.exercises?.length || 1), 0)}
													</div>
													<div class="text-xs tracking-wide text-white/80 uppercase sm:text-sm">
														Exercises
													</div>
												</div>
												<div>
													<div class="text-lg font-bold text-white sm:text-2xl">
														{Math.floor(totalDuration / 60)}:{String(totalDuration % 60).padStart(
															2,
															'0'
														)}
													</div>
													<div class="text-xs tracking-wide text-white/80 uppercase sm:text-sm">
														Duration
													</div>
												</div>
												<div>
													<div class="text-lg font-bold text-white sm:text-2xl">
														{steps
															.filter((s) => s.type === 'exercise')
															.reduce((acc, s) => acc + s.sets, 0)}
													</div>
													<div class="text-xs tracking-wide text-white/80 uppercase sm:text-sm">
														Total Sets
													</div>
												</div>
											</div>
										</div>

										<!-- Action Buttons -->
										<div class="flex gap-4">
											<button
												class="btn border-white/30 bg-white/20 text-white backdrop-blur-sm btn-md hover:bg-white/30 sm:btn-lg"
												onclick={resetTimer}
											>
												<span
													class="iconify size-4 ph--arrow-clockwise sm:size-5"
													aria-hidden="true"
												></span>
												<span class="hidden sm:inline">Restart Workout</span>
												<span class="sm:hidden">Restart</span>
											</button>
										</div>
									</div>
								</div>
							</div>
						{:else if currentStep}
							<div class="h-full duration-500 animate-in slide-in-from-bottom-4">
								<div class="w-full overflow-hidden bg-base-100 transition-all duration-300">
									<!-- YouTube-style Video Player Area with 16:9 Aspect Ratio -->
									<div
										bind:this={videoContainer}
										class="video-container relative aspect-video w-full overflow-hidden bg-base-300"
										role="button"
										tabindex="0"
										aria-label="Video player controls"
										onmouseenter={handleMouseEnter}
										onmouseleave={handleMouseLeave}
										onclick={handleVideoClick}
										onkeydown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												handleVideoClick();
											}
										}}
									>
										<div class="absolute inset-0 h-full w-full">
											{#if currentStep.type === 'exercise' && currentStep.exercises && currentStep.exercises.length > 1}
												{@const currentExercise =
													currentStep.exercises[currentSetInfo.currentExerciseIndex || 0]}
												{#if currentExercise?.imageUrl}
													{#if currentExercise.imageUrl.endsWith('.gif')}
														<ImageGif
															isFrozen={!isPlaying}
															src={currentExercise.imageUrl}
															alt={currentExercise.title}
															class="h-full w-full object-cover transition-all duration-300"
															style={currentExercise.crop
																? `object-position: ${currentExercise.crop.x}% ${currentExercise.crop.y}%; object-fit: cover;`
																: 'object-fit: cover;'}
															loading="lazy"
															decoding="async"
														/>
													{:else}
														<img
															src={currentExercise.imageUrl}
															alt={currentExercise.title}
															class="h-full w-full object-cover transition-all duration-300"
															style={currentExercise.crop
																? `object-position: ${currentExercise.crop.x}% ${currentExercise.crop.y}%; object-fit: cover;`
																: 'object-fit: cover;'}
															loading="lazy"
															decoding="async"
														/>
													{/if}
												{:else}
													<div
														class="to-base-400 flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-base-300"
													>
														<div class="mb-2 text-4xl text-white/80 sm:mb-4 sm:text-6xl">🏋️</div>
														<p class="text-base font-medium text-white/60 sm:text-lg">
															{currentExercise.title}
														</p>
													</div>
												{/if}
											{:else if currentStep.content?.imageUrl}
												{#if currentStep.content.imageUrl.endsWith('.gif')}
													<ImageGif
														isFrozen={!isPlaying}
														src={currentStep.content.imageUrl}
														alt={currentStep.label}
														class="h-full w-full object-cover transition-all duration-300"
														style={currentStep.content.crop
															? `object-position: ${currentStep.content.crop.x}% ${currentStep.content.crop.y}%; object-fit: cover;`
															: 'object-fit: cover;'}
														loading="lazy"
														decoding="async"
													/>
												{:else}
													<img
														src={currentStep.content.imageUrl}
														alt={currentStep.label}
														class="h-full w-full object-cover transition-all duration-300"
														style={currentStep.content.crop
															? `object-position: ${currentStep.content.crop.x}% ${currentStep.content.crop.y}%; object-fit: cover;`
															: 'object-fit: cover;'}
														loading="lazy"
														decoding="async"
													/>
												{/if}
											{:else}
												<div
													class="to-base-400 flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-base-300"
												>
													<div class="mb-2 text-4xl text-white/80 sm:mb-4 sm:text-6xl">🏋️</div>
													<p class="text-base font-medium text-white/60 sm:text-lg">
														{currentStep.label}
													</p>
												</div>
											{/if}

											<!-- Rest Mode Overlay - Special layout for rest periods -->
											{#if currentStep.type === 'exercise' && currentSetInfo.isResting}
												<div
													class="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center bg-base-200 backdrop-blur-md"
												>
													<!-- Large centered timer -->
													<div class="mb-4 text-center sm:mb-8">
														<div
															class="mb-2 badge badge-md font-bold tracking-wider text-warning-content uppercase shadow-lg badge-warning sm:mb-4 sm:badge-lg"
														>
															Rest Time
														</div>
														<div
															class="text-4xl font-black text-base-content drop-shadow-2xl sm:text-6xl"
														>
															{formatTime(Math.floor(currentSetInfo.timeLeftInPhase))}
														</div>
													</div>

													<!-- Small image below with "up next" -->
													{#if currentStep.type === 'exercise' && currentStep.exercises && currentStep.exercises.length > 1}
														{@const nextExerciseIndex =
															(currentSetInfo.currentExerciseIndex || 0) + 1}
														{@const nextExercise =
															nextExerciseIndex < currentStep.exercises.length
																? currentStep.exercises[nextExerciseIndex]
																: currentStep.exercises[0]}
														{#if nextExercise?.imageUrl}
															<div class="text-center">
																<div
																	class="mb-2 badge badge-xs font-semibold tracking-wide text-neutral-content uppercase badge-neutral sm:mb-3 sm:badge-sm"
																>
																	Next
																</div>
																<div
																	class="inline-block scale-75 overflow-hidden rounded-xl border-4 border-white/20 shadow-2xl sm:scale-75"
																>
																	<img
																		src={nextExercise.imageUrl}
																		alt={nextExercise.title}
																		class="h-20 w-28 object-cover sm:h-24 sm:w-32"
																		style={nextExercise.crop
																			? `object-position: ${nextExercise.crop.x}% ${nextExercise.crop.y}%; object-fit: cover;`
																			: 'object-fit: cover;'}
																	/>
																</div>
																<div
																	class="mt-2 text-base font-bold text-base-content drop-shadow-lg sm:mt-3 sm:text-lg"
																>
																	{nextExercise.title}
																</div>
															</div>
														{/if}
													{:else if currentStep.content?.imageUrl}
														<div class="text-center">
															<div
																class="mb-2 badge badge-xs font-semibold tracking-wide text-neutral-content uppercase badge-neutral sm:mb-3 sm:badge-sm"
															>
																Next
															</div>
															<div
																class="inline-block scale-75 overflow-hidden rounded-xl border-4 border-white/20 shadow-2xl sm:scale-75"
															>
																<img
																	src={currentStep.content.imageUrl}
																	alt={currentStep.label}
																	class="h-20 w-28 object-cover sm:h-24 sm:w-32"
																	style={currentStep.content.crop
																		? `object-position: ${currentStep.content.crop.x}% ${currentStep.content.crop.y}%; object-fit: cover;`
																		: 'object-fit: cover;'}
																/>
															</div>
															<div
																class="mt-2 text-base font-bold text-base-content drop-shadow-lg sm:mt-3 sm:text-lg"
															>
																{currentStep.label}
															</div>
														</div>
													{/if}
												</div>
											{/if}

											<!-- Transition Mode Overlay - Special layout for switching between exercises in superset -->
											{#if currentStep.type === 'exercise' && currentSetInfo.isTransitioning}
												<div
													class="transition-overlay pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center bg-info/20 backdrop-blur-md"
												>
													<!-- Large centered timer -->
													<div class="mb-4 text-center sm:mb-8">
														<div
															class="mb-2 badge badge-md font-bold tracking-wider text-info-content uppercase shadow-lg badge-info sm:mb-4 sm:badge-lg"
														>
															Switch Exercise
														</div>
														<div
															class="text-4xl font-black text-base-content drop-shadow-2xl sm:text-6xl"
														>
															{formatTime(Math.floor(currentSetInfo.timeLeftInPhase))}
														</div>
													</div>

													<!-- Current and next exercise display -->
													{#if currentStep.type === 'exercise' && currentStep.exercises && currentStep.exercises.length > 1}
														{@const currentExercise =
															currentStep.exercises[currentSetInfo.currentExerciseIndex || 0]}
														{@const nextExerciseIndex =
															(currentSetInfo.currentExerciseIndex || 0) + 1}
														{@const nextExercise =
															nextExerciseIndex < currentStep.exercises.length
																? currentStep.exercises[nextExerciseIndex]
																: currentStep.exercises[0]}
														<div class="flex items-center gap-4 text-center">
															<!-- Current exercise -->
															{#if currentExercise?.imageUrl}
																<div class="text-center">
																	<div
																		class="mb-2 badge badge-xs font-semibold tracking-wide text-neutral-content uppercase badge-neutral sm:mb-3 sm:badge-sm"
																	>
																		Current
																	</div>
																	<div
																		class="inline-block scale-75 overflow-hidden rounded-xl border-4 border-info/30 shadow-2xl sm:scale-75"
																	>
																		<img
																			src={currentExercise.imageUrl}
																			alt={currentExercise.title}
																			class="h-20 w-28 object-cover sm:h-24 sm:w-32"
																			style={currentExercise.crop
																				? `object-position: ${currentExercise.crop.x}% ${currentExercise.crop.y}%; object-fit: cover;`
																				: 'object-fit: cover;'}
																		/>
																	</div>
																	<div
																		class="mt-2 text-base font-bold text-base-content drop-shadow-lg sm:mt-3 sm:text-lg"
																	>
																		{currentExercise.title}
																	</div>
																</div>
															{/if}

															<!-- Arrow -->
															<div class="text-4xl text-info sm:text-6xl">➡️</div>

															<!-- Next exercise -->
															{#if nextExercise?.imageUrl}
																<div class="text-center">
																	<div
																		class="mb-2 badge badge-xs font-semibold tracking-wide text-neutral-content uppercase badge-neutral sm:mb-3 sm:badge-sm"
																	>
																		Next
																	</div>
																	<div
																		class="inline-block scale-75 overflow-hidden rounded-xl border-4 border-white/20 shadow-2xl sm:scale-75"
																	>
																		<img
																			src={nextExercise.imageUrl}
																			alt={nextExercise.title}
																			class="h-20 w-28 object-cover sm:h-24 sm:w-32"
																			style={nextExercise.crop
																				? `object-position: ${nextExercise.crop.x}% ${nextExercise.crop.y}%; object-fit: cover;`
																				: 'object-fit: cover;'}
																		/>
																	</div>
																	<div
																		class="mt-2 text-base font-bold text-base-content drop-shadow-lg sm:mt-3 sm:text-lg"
																	>
																		{nextExercise.title}
																	</div>
																</div>
															{/if}
														</div>
													{/if}
												</div>
											{/if}

											<!-- Exercise Info - Top Left -->
											{#if !(currentStep.type === 'exercise' && (currentSetInfo.isResting || currentSetInfo.isTransitioning))}
												<div
													class="absolute top-2 left-2 z-50 rounded-xl border border-white/20 bg-black/80 px-3 py-2 shadow-xl backdrop-blur-md sm:top-4 sm:left-4 sm:rounded-2xl sm:px-6 sm:py-4"
												>
													<div class="text-sm font-bold text-white drop-shadow-lg sm:text-lg">
														{currentStep.label}
													</div>
													{#if currentStep.type === 'exercise'}
														{#if currentStep.exercises.length === 1}
															<div class="mt-1 text-xs text-white/80 sm:text-sm">
																{#if currentStep.reps > 1}{currentStep.reps} reps{/if}
															</div>
														{/if}
														{#if currentStep.exercises && currentStep.exercises.length > 1}
															<div class="mt-2 space-y-1">
																{#each currentStep.exercises as exercise, index}
																	{@const isCurrentExercise =
																		index === (currentSetInfo.currentExerciseIndex || 0)}
																	<div
																		class="flex items-center gap-2 text-xs {isCurrentExercise
																			? 'font-semibold text-white'
																			: 'text-white/70'}"
																	>
																		<span class="w-4 text-center font-mono">{index + 1}.</span>
																		<span>{exercise.title}</span>
																		{#if exercise.reps > 1}
																			<span class="text-white/70">({exercise.reps} reps)</span>
																		{/if}
																		{#if isCurrentExercise}
																			<span class="badge badge-xs badge-primary">Current</span>
																		{/if}
																	</div>
																{/each}
															</div>
														{/if}
													{/if}
												</div>
											{/if}

											<!-- Countdown Timer - Always Visible (except during rest and transition) -->
											{#if !(currentStep.type === 'exercise' && (currentSetInfo.isResting || currentSetInfo.isTransitioning))}
												<div
													class="absolute top-2 right-2 z-50 rounded-xl border border-white/20 bg-black/80 px-3 py-2 shadow-xl backdrop-blur-md sm:top-4 sm:right-4 sm:rounded-2xl sm:px-6 sm:py-4"
												>
													<div
														class="mb-1 text-xs font-medium tracking-wide text-white/80 uppercase sm:mb-2 sm:text-sm"
													>
														{#if currentStep.type === 'exercise'}
															{#if currentSetInfo.isResting}
																<span class="badge badge-xs badge-warning sm:badge-sm">Rest</span>
															{:else if currentSetInfo.isTransitioning}
																<span class="badge badge-xs badge-info sm:badge-sm">Switch</span>
															{:else}
																<span class="badge badge-xs badge-success sm:badge-sm"
																	>Set {currentSetInfo.currentSet}/{currentSetInfo.totalSets}</span
																>
															{/if}
														{:else}
															<span class="badge badge-xs badge-info sm:badge-sm"
																>{currentStep.label}</span
															>
														{/if}
													</div>
													<div
														class="font-mono text-xl font-black text-white drop-shadow-lg sm:text-3xl"
													>
														{formatTime(Math.floor(currentSetInfo.timeLeftInPhase))}
													</div>
												</div>
											{/if}

											<!-- YouTube-style Controls Overlay -->
											<div
												class="absolute inset-0 z-60 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 {shouldShowControls
													? 'pointer-events-auto opacity-100'
													: 'pointer-events-none opacity-0'}"
											>
												<!-- Bottom Controls Bar -->
												<div class="absolute right-0 bottom-0 left-0">
													<!-- Bottom controls row -->
													<div class="bg-gradient-to-t from-black/90 to-transparent p-2 sm:p-4">
														<!-- Timeline -->
														<Timeline
															{currentTime}
															{totalDuration}
															onSeek={seekTo}
															visible={shouldShowControls}
														/>

														{#if shouldShowControls}
															<!-- YouTube-style Controls -->
															<div class="flex items-center justify-between">
																<!-- Left controls -->
																<div class="flex items-center gap-2 sm:gap-3">
																	<!-- Play/Pause button -->
																	<button
																		class="btn btn-circle border-none bg-white/10 text-white btn-sm hover:bg-white/20 sm:btn-md"
																		onclick={isPlaying ? pauseTimer : startTimer}
																		aria-label={isPlaying ? 'Pause' : 'Play'}
																	>
																		{#if isPlaying}
																			<!-- Pause icon -->
																			<span
																				class="iconify size-4 ph--pause sm:size-5"
																				aria-hidden="true"
																			></span>
																		{:else}
																			<!-- Play icon -->
																			<span
																				class="iconify size-4 ph--play sm:size-5"
																				aria-hidden="true"
																			></span>
																		{/if}
																	</button>

																	<!-- Sound control (mute/unmute) -->
																	<button
																		class="btn btn-circle border-none bg-transparent text-white btn-sm hover:bg-white/20 sm:btn-md"
																		aria-label="Mute/Unmute"
																	>
																		<!-- Volume icon -->
																		<span
																			class="iconify size-4 ph--speaker-high sm:size-5"
																			aria-hidden="true"
																		></span>
																	</button>

																	<!-- Time display -->
																	<div class="font-mono text-xs text-white/80 sm:text-sm">
																		{formatTime(currentTime)} / {formatTime(totalDuration)}
																	</div>
																</div>

																<!-- Right controls -->
																<div class="flex items-center gap-2 sm:gap-3">
																	<!-- Fullscreen button -->
																	<button
																		class="btn btn-circle border-none bg-white/10 text-white btn-sm hover:bg-white/20 sm:btn-md"
																		onclick={toggleFullscreen}
																		aria-label={isFullscreen
																			? 'Exit fullscreen'
																			: 'Enter fullscreen'}
																	>
																		{#if isFullscreen}
																			<!-- Exit fullscreen icon -->
																			<span
																				class="iconify size-4 ph--arrows-out-simple sm:size-5"
																				aria-hidden="true"
																			></span>
																		{:else}
																			<!-- Enter fullscreen icon -->
																			<span
																				class="iconify size-4 ph--arrows-in-simple sm:size-5"
																				aria-hidden="true"
																			></span>
																		{/if}
																	</button>
																</div>
															</div>
														{/if}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>

				<!-- Enhanced Sidebar - Right side on desktop -->
				<div
					class="flex max-h-screen min-h-0 w-full flex-col lg:max-h-full lg:w-80 lg:flex-shrink-0"
				>
					<!-- Up Next Section -->
					<div
						class="card flex min-h-0 flex-1 flex-col overflow-hidden border border-base-300 bg-base-100 shadow-lg"
					>
						<div class="card-body flex flex-1 flex-col p-0">
							<div class="flex-1 space-y-2 overflow-y-auto p-2">
								{#each steps as step, index}
									{@const stepTime = stepsWithTimes.find((s) => s.id === step.id)}
									{@const isCurrentStep = currentStep?.id === step.id}
									{@const isPastStep = stepTime && currentTime > stepTime.end}
									<div
										class="compact card bg-base-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
									         {isCurrentStep ? 'bg-primary/5 ring-2 ring-primary ring-offset-2' : ''}
									         {isPastStep ? 'opacity-75' : ''}"
									>
										<button
											class="hover:bg-base-50 card-body w-full cursor-pointer p-3 text-left"
											onclick={() => seekTo((stepTime?.start ?? 0) + 1)}
										>
											<div class="flex items-start gap-3">
												<!-- Enhanced Thumbnail -->
												<div class="avatar">
													<div
														class="relative flex h-12 w-16 items-center justify-center overflow-hidden rounded-lg bg-base-300"
													>
														{#if step.content?.imageUrl}
															<img
																src={step.content.imageUrl}
																alt={step.label}
																class="h-full w-full object-cover"
																style={step.content.crop
																	? `object-position: ${step.content.crop.x}% ${step.content.crop.y}%; object-fit: cover;`
																	: 'object-fit: cover;'}
																loading="lazy"
															/>
														{:else}
															<span class="text-lg">
																{#if step.type === 'exercise'}💪{:else}⏱️{/if}
															</span>
														{/if}

														<!-- Status overlays -->
														{#if isPastStep}
															<div
																class="absolute inset-0 flex items-center justify-center bg-black/50"
															>
																<div class="badge badge-sm badge-success">
																	<span class="iconify size-3 ph--check" aria-hidden="true"></span>
																</div>
															</div>
														{:else if isCurrentStep}
															<div
																class="absolute inset-0 flex items-center justify-center bg-primary/30"
															>
																<div class="badge animate-pulse badge-sm badge-primary">
																	<span class="iconify size-3 ph--play" aria-hidden="true"></span>
																</div>
															</div>
														{/if}

														<!-- Start time badge -->
														<div
															class="absolute right-1 bottom-1 badge badge-xs font-mono badge-neutral"
														>
															{Math.floor((stepTime?.start ?? 0) / 60)}:{String(
																(stepTime?.start ?? 0) % 60
															).padStart(2, '0')}
														</div>
													</div>
												</div>

												<!-- Enhanced Content -->
												<div class="min-w-0 flex-1">
													<div class="mb-1 flex items-start justify-between">
														<h4
															class="line-clamp-2 text-sm leading-tight font-semibold text-base-content {isPastStep
																? 'line-through opacity-60'
																: ''}"
														>
															{step.label}
														</h4>
														<div class="ml-2 badge flex-shrink-0 badge-outline badge-xs">
															#{index + 1}
														</div>
													</div>

													<div class="mb-2 flex flex-wrap items-center gap-1">
														{#if step.type === 'exercise'}
															<div class="badge badge-outline badge-xs">{step.sets} sets</div>
															{#if step.exercises && step.exercises.length > 1}
																<div class="badge badge-outline badge-xs">Superset</div>
															{:else if step.reps > 1}
																<div class="badge badge-outline badge-xs">{step.reps} reps</div>
															{/if}
														{/if}
													</div>

													{#if step.type === 'exercise' && step.exercises && step.exercises.length > 1}
														<div class="mb-2 text-xs text-base-content/70">
															{#each step.exercises as exercise, exerciseIndex}
																<div class="flex items-center gap-1">
																	<span class="font-mono text-xs">{exerciseIndex + 1}.</span>
																	<span class="truncate">{exercise.title}</span>
																	{#if exercise.reps > 1}
																		<span class="text-base-content/50">({exercise.reps})</span>
																	{/if}
																</div>
															{/each}
														</div>
													{/if}

													<div class="flex items-center gap-1">
														{#if isCurrentStep}
															<div class="badge animate-pulse badge-xs badge-primary">
																<div
																	class="mr-1 h-1 w-1 animate-ping rounded-full bg-current"
																></div>
																Live
															</div>
														{:else if isPastStep}
															<div class="badge badge-xs badge-success">Completed</div>
														{:else}
															<div class="badge badge-ghost badge-xs">Pending</div>
														{/if}
													</div>
												</div>
											</div>
										</button>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes celebrationPulse {
		0%,
		100% {
			transform: scale(1) rotate(0deg);
		}
		25% {
			transform: scale(1.1) rotate(-5deg);
		}
		75% {
			transform: scale(1.1) rotate(5deg);
		}
	}

	.celebration-emoji {
		animation: celebrationPulse 2s ease-in-out infinite;
	}

	@keyframes startPulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}

	.start-emoji {
		animation: startPulse 3s ease-in-out infinite;
	}

	/* Exercise display styles */
	@keyframes restPulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	/* Transition phase animations */
	@keyframes transitionPulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.02);
			opacity: 0.9;
		}
	}

	.transition-overlay {
		/* Animation removed */
	}
</style>

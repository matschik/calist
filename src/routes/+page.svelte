<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { onDestroy } from 'svelte';
	import Timeline from '$lib/Timeline.svelte';

	const flipDurationMs = 200;

	const session = {
		name: 'Push Up'
	};

	let steps = $state([
		{
			id: 0,
			type: 'rest',
			label: 'Getting ready',
			duration: 10,
			sets: 1,
			reps: 1,
			rest: 0,
			content: {
				imageUrl:
					'https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUydHB3eXN4emg3YmZzazNzeXF4aHJxbXZkeDBnZjIyZWFzY29obzBqcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26gsrnofq3K6WuETu/source.gif',
				description:
					'Take a moment to prepare yourself. Get into position and focus on your breathing.'
			}
		},
		{
			id: 1,
			type: 'exercise',
			label: 'Negative Push-ups',
			duration: 35,
			sets: 4,
			reps: 8,
			rest: 120,
			content: {
				imageUrl: 'https://fitnessfaqs.com/wp-content/uploads/2023/12/Negative-push-ups.gif',
				description:
					'Start in plank position. Lower your body slowly to the ground over 3-5 seconds. Reset to starting position.'
			}
		},
		{
			id: 2,
			type: 'exercise',
			label: 'Scapula Push-ups',
			duration: 45,
			sets: 4,
			reps: 8,
			rest: 120,
			content: {
				imageUrl:
					'https://www.exploreparkour.com/wp-content/uploads/2020/08/Exercise-Scapular-Push-Up-SM.gif',
				description:
					'In plank position, focus on squeezing and releasing your shoulder blades while keeping arms straight.',
				crop: {
					x: 0,        // Position horizontale (%)
					y: 100,        // Position verticale (%)
					width: 100,  // Largeur (%)
					height: 0   // Hauteur (%) - recadre le bas de l'image
				}
			}
		},
		{
			id: 3,
			type: 'exercise',
			label: 'Plank Hold',
			duration: 60,
			sets: 4,
			reps: 1,
			rest: 60,
			content: {
				imageUrl: 'https://i.pinimg.com/originals/b1/3a/19/b13a19da8641ca4cf235891ac20b2f54.gif',
				description:
					'Hold a strong plank position. Keep your core tight, back straight, and maintain steady breathing.'
			}
		}
	]);

	function handleSort(e: CustomEvent<{ items: typeof steps }>) {
		steps = e.detail.items;
	}

	let currentTime = $state(0);
	let interval: number | undefined = $state(undefined);
	let isPlaying = $derived(interval !== undefined);

	function startTimer() {
		if (!interval && currentTime < totalDuration) {
			interval = setInterval(() => {
				if (currentTime + 1 >= totalDuration) {
					pauseTimer();
					currentTime = totalDuration;
				} else {
					currentTime++;
				}
			}, 1000);
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

	const totalDuration = $derived(steps.reduce((acc, step) => acc + computeStepDuration(step), 0));

	function computeStepDuration(step: (typeof steps)[number]) {
		return step.duration * step.sets + step.rest * (step.sets - 1);
	}

	const stepsWithTimes = $derived(
		steps.map((step, index) => ({
			id: step.id,
			start: steps.slice(0, index).reduce((acc, step) => acc + computeStepDuration(step), 0),
			end:
				steps.slice(0, index).reduce((acc, step) => acc + computeStepDuration(step), 0) +
				computeStepDuration(step)
		}))
	);

	let currentStepTime = $derived(
		stepsWithTimes.find((step) => currentTime >= step.start && currentTime <= step.end)
	);
	let currentStep = $derived(steps.find((step) => step.id === currentStepTime?.id));
	let isWorkoutFinished = $derived(currentTime >= totalDuration);
	let isWorkoutNotStarted = $derived(currentTime === 0);

	// Exercise display state
	let showDetails = $state(false);
	let showControls = $state(false);
	let controlsTimeout: number | null = null;



	// Show controls when paused
	const shouldShowControls = $derived(showControls || !isPlaying);

	// Exercise display functions
	function toggleDetails() {
		showDetails = !showDetails;
	}

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

	// Exercise calculation logic
	const stepRelativeTime = $derived(currentStep ? Math.max(0, currentTime - (currentStepTime?.start ?? 0)) : 0);
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
		const cycleTime = exerciseDuration + restDuration;

		let timeInExercise = stepRelativeTime;
		let currentSet = 1;
		let isResting = false;
		let timeLeftInPhase = 0;

		// Find which set we're in
		for (let set = 1; set <= currentStep.sets; set++) {
			const setStartTime = (set - 1) * cycleTime;
			const exerciseEndTime = setStartTime + exerciseDuration;
			const restEndTime = set < currentStep.sets ? exerciseEndTime + restDuration : exerciseEndTime;

			if (timeInExercise >= setStartTime && timeInExercise < restEndTime) {
				currentSet = set;

				if (timeInExercise < exerciseEndTime) {
					// We're in the exercise phase
					isResting = false;
					timeLeftInPhase = exerciseEndTime - timeInExercise;
				} else if (set < currentStep.sets) {
					// We're in the rest phase
					isResting = true;
					timeLeftInPhase = restEndTime - timeInExercise;
				}
				break;
			}
		}

		return {
			currentSet,
			totalSets: currentStep.sets,
			isResting,
			timeLeftInPhase: Math.max(0, timeLeftInPhase),
			phaseType: isResting ? 'rest' : 'exercise'
		};
	});

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
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



	// Cleanup timeout on destroy
	onDestroy(() => {
		if (controlsTimeout) clearTimeout(controlsTimeout);
	});
</script>

<svelte:head>
	<title>Calist</title>
</svelte:head>

<svelte:window on:keydown={handleKeyDown} />

<div class="mt-10 flex min-h-screen flex-col bg-base-100">
	<div class="container mx-auto h-full px-4">
		<div class="flex min-h-0 flex-col gap-4 lg:h-full lg:flex-row">
			<!-- Main Video/Exercise Area -->
			<div class="flex min-h-0 flex-1 flex-col lg:overflow-hidden">
				<!-- Exercise Display with Fixed Height -->
				<div class="mb-3 min-h-0 flex-1">
					{#if isWorkoutNotStarted}
						<!-- Start Screen -->
						<div class="animate-in slide-in-from-bottom-4 h-full duration-500">
							<div
								class="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary via-blue-500 to-indigo-600"
							>
								<div class="absolute inset-0 flex flex-col items-center justify-center text-white">
									<!-- Welcome Section -->
									<div class="mb-4 text-center sm:mb-8">
										<div class="start-emoji mb-2 text-6xl sm:mb-4 sm:text-8xl">💪</div>
										<div
											class="mb-2 badge badge-md sm:badge-lg font-bold tracking-wider text-primary-content uppercase shadow-lg badge-primary sm:mb-4"
										>
											Ready to Start
										</div>
										<h1 class="mb-1 text-2xl font-black text-white drop-shadow-2xl sm:mb-2 sm:text-4xl">
											{session.name} Workout
										</h1>
										<p class="text-lg font-medium text-white/90 sm:text-xl">
											Get ready for an amazing workout session
										</p>
									</div>

									<!-- Workout Preview -->
									<div class="mb-4 rounded-2xl bg-black/20 p-4 text-center backdrop-blur-sm sm:mb-8 sm:p-6">
										<div class="grid grid-cols-3 gap-3 text-center sm:gap-6">
											<div>
												<div class="text-lg font-bold text-white sm:text-2xl">{steps.filter((s) => s.type === 'exercise').length}</div>
												<div class="text-xs tracking-wide text-white/80 uppercase sm:text-sm">Exercises</div>
											</div>
											<div>
												<div class="text-lg font-bold text-white sm:text-2xl">
													{Math.floor(totalDuration / 60)}:{String(totalDuration % 60).padStart(
														2,
														'0'
													)}
												</div>
												<div class="text-xs tracking-wide text-white/80 uppercase sm:text-sm">Duration</div>
											</div>
											<div>
												<div class="text-lg font-bold text-white sm:text-2xl">
													{steps
														.filter((s) => s.type === 'exercise')
														.reduce((acc, s) => acc + s.sets, 0)}
												</div>
												<div class="text-xs tracking-wide text-white/80 uppercase sm:text-sm">Total Sets</div>
											</div>
										</div>
									</div>

									<!-- Action Buttons -->
									<div class="flex gap-4">
										<button
											class="btn bg-white font-bold text-primary shadow-xl btn-md sm:btn-lg hover:bg-white/90"
											onclick={startTimer}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-5 w-5 sm:h-6 sm:w-6"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V9a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2z"
												/>
											</svg>
											<span class="hidden sm:inline">Start Workout</span>
											<span class="sm:hidden">Start</span>
										</button>
									</div>

									<!-- Quick Tip -->
									<div class="mt-4 text-center sm:mt-6">
										<div class="text-xs text-white/70 sm:text-sm">
											💡 <strong>Tip:</strong> Press
											<kbd class="kbd bg-white/20 kbd-xs sm:kbd-sm text-white">Space</kbd> to pause/resume
										</div>
									</div>
								</div>
							</div>
						</div>

					{:else if isWorkoutFinished}
						<!-- Finish Screen -->
						<div class="animate-in slide-in-from-bottom-4 h-full duration-500">
							<div
								class="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-success via-green-600 to-emerald-600"
							>
								<div class="absolute inset-0 flex flex-col items-center justify-center text-white">
									<!-- Celebration Animation -->
									<div class="mb-4 text-center sm:mb-8">
										<div class="celebration-emoji mb-2 animate-bounce text-6xl sm:mb-4 sm:text-8xl">🎉</div>
										<div
											class="mb-2 badge badge-md sm:badge-lg font-bold tracking-wider text-success-content uppercase shadow-lg badge-success sm:mb-4"
										>
											Workout Complete!
										</div>
										<h2 class="mb-1 text-2xl font-black text-white drop-shadow-2xl sm:mb-2 sm:text-4xl">Great Job!</h2>
										<p class="text-lg font-medium text-white/90 sm:text-xl">
											You've completed the "{session.name}" workout
										</p>
									</div>

									<!-- Workout Summary -->
									<div class="mb-4 rounded-2xl bg-black/20 p-4 text-center backdrop-blur-sm sm:mb-8 sm:p-6">
										<div class="grid grid-cols-3 gap-3 text-center sm:gap-6">
											<div>
												<div class="text-lg font-bold text-white sm:text-2xl">{steps.length}</div>
												<div class="text-xs tracking-wide text-white/80 uppercase sm:text-sm">Exercises</div>
											</div>
											<div>
												<div class="text-lg font-bold text-white sm:text-2xl">
													{Math.floor(totalDuration / 60)}:{String(totalDuration % 60).padStart(
														2,
														'0'
													)}
												</div>
												<div class="text-xs tracking-wide text-white/80 uppercase sm:text-sm">Duration</div>
											</div>
											<div>
												<div class="text-lg font-bold text-white sm:text-2xl">
													{steps
														.filter((s) => s.type === 'exercise')
														.reduce((acc, s) => acc + s.sets, 0)}
												</div>
												<div class="text-xs tracking-wide text-white/80 uppercase sm:text-sm">Total Sets</div>
											</div>
										</div>
									</div>

									<!-- Action Buttons -->
									<div class="flex gap-4">
										<button
											class="btn border-white/30 bg-white/20 text-white backdrop-blur-sm btn-md sm:btn-lg hover:bg-white/30"
											onclick={resetTimer}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4 sm:h-5 sm:w-5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
												/>
											</svg>
											<span class="hidden sm:inline">Restart Workout</span>
											<span class="sm:hidden">Restart</span>
										</button>
									</div>
								</div>
							</div>
						</div>
					{:else if currentStep}
							<div class="animate-in slide-in-from-bottom-4 h-full duration-500">
							<div class="w-full overflow-hidden bg-base-100 transition-all duration-300">
								<!-- YouTube-style Video Player Area with 16:9 Aspect Ratio -->
								<div
									class="relative aspect-video w-full overflow-hidden bg-base-300"
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
										{#if currentStep.content?.imageUrl && isPlaying}
											<img
												src={currentStep.content.imageUrl}
												alt={currentStep.label}
												class="h-full w-full object-cover transition-all duration-300"
												style={currentStep.content.crop ? `object-position: ${currentStep.content.crop.x}% ${currentStep.content.crop.y}%; object-fit: cover;` : 'object-fit: cover;'}
												loading="lazy"
												decoding="async"
											/>
										{:else}
											<div
												class="to-base-400 flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-base-300"
											>
												<div class="mb-2 text-4xl text-white/80 sm:mb-4 sm:text-6xl">🏋️</div>
												<p class="text-base font-medium text-white/60 sm:text-lg">{currentStep.label}</p>
											</div>
										{/if}

										<!-- Rest Mode Overlay - Special layout for rest periods -->
										{#if currentStep.type === 'exercise' && currentSetInfo.isResting}
											<div
												class="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
											>
												<!-- Large centered timer -->
												<div class="mb-4 text-center sm:mb-8">
													<div
														class="mb-2 badge badge-md sm:badge-lg font-bold tracking-wider text-warning-content uppercase shadow-lg badge-warning sm:mb-4"
													>
														Rest Time
													</div>
													<div class="text-4xl font-black text-white drop-shadow-2xl sm:text-6xl">
														{formatTime(Math.floor(currentSetInfo.timeLeftInPhase))}
													</div>
													<div
														class="mt-2 flex items-center justify-center gap-2 text-lg font-semibold text-white/90 sm:mt-4 sm:text-xl"
													>
														<div class="badge badge-outline border-white/50 badge-md sm:badge-lg text-white">
															Set {currentSetInfo.currentSet} of {currentSetInfo.totalSets}
														</div>
													</div>
												</div>

												<!-- Small image below with "up next" -->
												{#if currentStep.content?.imageUrl}
													<div class="text-center">
														<div
															class="mb-2 badge badge-xs sm:badge-sm font-semibold tracking-wide text-neutral-content uppercase badge-neutral sm:mb-3"
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
																style={currentStep.content.crop ? `object-position: ${currentStep.content.crop.x}% ${currentStep.content.crop.y}%; object-fit: cover;` : 'object-fit: cover;'}
															/>
														</div>
														<div class="mt-2 text-base font-bold text-white drop-shadow-lg sm:mt-3 sm:text-lg">{currentStep.label}</div>
													</div>
												{/if}
											</div>
										{/if}

										<!-- Exercise Info - Top Left -->
										{#if !(currentStep.type === 'exercise' && currentSetInfo.isResting)}
											<div
												class="absolute top-2 left-2 z-50 rounded-xl border border-white/20 bg-black/80 px-3 py-2 shadow-xl backdrop-blur-md sm:top-4 sm:left-4 sm:rounded-2xl sm:px-6 sm:py-4"
											>
												<div class="text-sm font-bold text-white drop-shadow-lg sm:text-lg">
													{currentStep.label}
												</div>
												{#if currentStep.type === 'exercise'}
													<div class="mt-1 text-xs text-white/80 sm:text-sm">
														{currentStep.reps} reps
													</div>
												{/if}
											</div>
										{/if}

										<!-- Countdown Timer - Always Visible (except during rest) -->
										{#if !(currentStep.type === 'exercise' && currentSetInfo.isResting)}
											<div
												class="absolute top-2 right-2 z-50 rounded-xl border border-white/20 bg-black/80 px-3 py-2 shadow-xl backdrop-blur-md sm:top-4 sm:right-4 sm:rounded-2xl sm:px-6 sm:py-4"
											>
												<div class="mb-1 text-xs font-medium tracking-wide text-white/80 uppercase sm:mb-2 sm:text-sm">
													{#if currentStep.type === 'exercise'}
														{#if currentSetInfo.isResting}
															<span class="badge badge-xs sm:badge-sm badge-warning">Rest</span>
														{:else}
															<span class="badge badge-xs sm:badge-sm badge-success"
																>Set {currentSetInfo.currentSet}/{currentSetInfo.totalSets}</span
															>
														{/if}
													{:else}
														<span class="badge badge-xs sm:badge-sm badge-info">{currentStep.label}</span>
													{/if}
												</div>
												<div class="font-mono text-xl font-black text-white drop-shadow-lg sm:text-3xl">
													{formatTime(Math.floor(currentSetInfo.timeLeftInPhase))}
												</div>
											</div>
										{/if}

										<!-- YouTube-style Controls Overlay -->
										<div
											class="absolute inset-0 z-60 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity duration-300 {shouldShowControls
												? 'pointer-events-auto opacity-100'
												: 'pointer-events-none opacity-0'}"
										>

											<!-- Bottom Controls Bar -->
											<div class="absolute right-0 bottom-0 left-0">
												<!-- Bottom controls row -->
												<div
													class="bg-gradient-to-t from-black/90 to-transparent p-2 sm:p-4"
												>
													<!-- Timeline -->
													<Timeline 
														currentTime={currentTime}
														totalDuration={totalDuration}
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
																	class="btn btn-circle btn-sm hover:bg-white/20 bg-white/10 border-none text-white sm:btn-md"
																	onclick={isPlaying ? pauseTimer : startTimer}
																	aria-label={isPlaying ? 'Pause' : 'Play'}
																>
																	{#if isPlaying}
																		<!-- Pause icon -->
																		<svg
																			xmlns="http://www.w3.org/2000/svg"
																			class="h-4 w-4 sm:h-5 sm:w-5"
																			fill="currentColor"
																			viewBox="0 0 24 24"
																		>
																			<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
																		</svg>
																	{:else}
																		<!-- Play icon -->
																		<svg
																			xmlns="http://www.w3.org/2000/svg"
																			class="h-4 w-4 sm:h-5 sm:w-5"
																			fill="currentColor"
																			viewBox="0 0 24 24"
																		>
																			<path d="M8 5v14l11-7z"/>
																		</svg>
																	{/if}
																</button>

																<!-- Sound control (mute/unmute) -->
																<button
																	class="btn btn-circle btn-sm hover:bg-white/20 bg-transparent border-none text-white sm:btn-md"
																	aria-label="Mute/Unmute"
																>
																	<!-- Volume icon -->
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		class="h-4 w-4 sm:h-5 sm:w-5"
																		fill="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
																	</svg>
																</button>

																<!-- Time display -->
																<div class="hidden text-xs font-mono text-white/80 sm:block sm:text-sm">
																	{formatTime(currentTime)} / {formatTime(totalDuration)}
																</div>
															</div>

															<!-- Right controls -->
															<div class="flex items-center gap-2 sm:gap-3">
																<!-- Exercise info -->
																<div class="text-right">
																	<div class="text-xs font-bold text-white sm:text-sm">
																		{currentStep.label}
																	</div>
																	{#if currentStep.type === 'exercise'}
																		<div class="text-xs text-white/60">
																			{currentStep.reps} reps × {currentStep.sets} sets
																		</div>
																	{/if}
																</div>
															</div>
														</div>

														<!-- Mobile time display -->
														<div class="mt-2 text-center text-xs font-mono text-white/80 sm:hidden">
															{formatTime(currentTime)} / {formatTime(totalDuration)}
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
			<div class="flex max-h-screen min-h-0 w-full flex-col lg:max-h-full lg:w-80 lg:flex-shrink-0">
			<!-- Up Next Section -->
			<div
				class="card flex min-h-0 flex-1 flex-col overflow-hidden border border-base-300 bg-base-100 shadow-lg"
			>
				<div class="card-body flex flex-1 flex-col p-0">
					<div class="flex-shrink-0 border-b border-base-300 p-4">
						<div class="flex items-center text-lg font-bold gap-3">
							Up Next
						</div>
					</div>
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
														style={step.content.crop ? `object-position: ${step.content.crop.x}% ${step.content.crop.y}%; object-fit: cover;` : 'object-fit: cover;'}
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
															<svg
																xmlns="http://www.w3.org/2000/svg"
																class="h-3 w-3"
																fill="currentColor"
																viewBox="0 0 24 24"
															>
																<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
															</svg>
														</div>
													</div>
												{:else if isCurrentStep}
													<div
														class="absolute inset-0 flex items-center justify-center bg-primary/30"
													>
														<div class="badge animate-pulse badge-sm badge-primary">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																class="h-3 w-3"
																fill="currentColor"
																viewBox="0 0 24 24"
															>
																<path d="M8 5v14l11-7z" />
															</svg>
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
												<div
													class="badge badge-xs {step.type === 'exercise'
														? 'badge-success'
														: 'badge-warning'}"
												>
													{step.type}
												</div>
												{#if step.type === 'exercise'}
													<div class="badge badge-outline badge-xs">{step.sets} sets</div>
													<div class="badge badge-outline badge-xs">{step.reps} reps</div>
												{/if}
											</div>

											<div class="flex items-center gap-1">
												{#if isCurrentStep}
													<div class="badge animate-pulse badge-xs badge-primary">
														<div class="mr-1 h-1 w-1 animate-ping rounded-full bg-current"></div>
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


</style>


<script lang="ts">
	let { 
		isPaused = false, 
		src, 
		alt = '', 
		class: className = '', 
		style = '', 
		...rest 
	} = $props();

	let videoElement: HTMLVideoElement | undefined = $state();

	// Pause/play video based on isPaused state
	$effect(() => {
		if (videoElement) {
			if (isPaused) {
				videoElement.pause();
			} else {
				videoElement.play();
			}
		}
	});

	// Update video source when src changes
	$effect(() => {
		if (videoElement && src) {
			// Reset video to beginning and load new source
			videoElement.currentTime = 0;
			videoElement.load();
		}
	});
</script>

<video
	bind:this={videoElement}
	class={className}
	style={style}
	autoplay={!isPaused}
	loop
	muted
	playsinline
	{...rest}
>
	<source {src} type="video/webm" />
	<!-- Fallback text -->
	{alt || 'WebM video not supported'}
</video>


<script lang="ts">
	interface Props {
		currentTime: number;
		totalDuration: number;
		onSeek: (time: number) => void;
		visible?: boolean;
	}

	let { currentTime, totalDuration, onSeek, visible = true }: Props = $props();

	// Timeline interaction state
	let isTimelineHovered = $state(false);
	let hoverProgress = $state<number | null>(null);
	let isTouching = $state(false);

	// Derived progress for current time
	const currentProgress = $derived(totalDuration > 0 ? currentTime / totalDuration : 0);

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${String(secs).padStart(2, '0')}`;
	}

	// Timeline interaction handlers
	function handleTimelineClick(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const progress = clickX / rect.width;
		const newTime = Math.round(progress * totalDuration * 10) / 10; // Round to nearest 100ms
		onSeek(Math.max(0, Math.min(totalDuration, newTime)));
	}

	function handleTimelineMouseEnter() {
		isTimelineHovered = true;
	}

	function handleTimelineMouseLeave() {
		isTimelineHovered = false;
		hoverProgress = null;
	}

	function handleTimelineMouseMove(e: MouseEvent) {
		if (!isTimelineHovered) return;
		
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const progress = Math.max(0, Math.min(1, mouseX / rect.width));
		hoverProgress = progress;
	}

	function handleTimelineKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			// For keyboard navigation, seek to current hover position or current position
			if (hoverProgress !== null) {
				const newTime = Math.round(hoverProgress * totalDuration * 10) / 10; // Round to nearest 100ms
				onSeek(Math.max(0, Math.min(totalDuration, newTime)));
			}
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			const newTime = Math.max(0, currentTime - 5);
			onSeek(newTime);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			const newTime = Math.min(totalDuration, currentTime + 5);
			onSeek(newTime);
		}
	}

	// Touch support for mobile
	function handleTimelineTouchStart(e: TouchEvent) {
		e.preventDefault();
		isTouching = true;
		isTimelineHovered = true;
		handleTimelineTouchMove(e);
	}

	function handleTimelineTouchMove(e: TouchEvent) {
		if (!isTouching) return;
		e.preventDefault();
		
		const touch = e.touches[0];
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const touchX = touch.clientX - rect.left;
		const progress = Math.max(0, Math.min(1, touchX / rect.width));
		hoverProgress = progress;
	}

	function handleTimelineTouchEnd(e: TouchEvent) {
		e.preventDefault();
		if (isTouching && hoverProgress !== null) {
			const newTime = Math.round(hoverProgress * totalDuration * 10) / 10; // Round to nearest 100ms
			onSeek(Math.max(0, Math.min(totalDuration, newTime)));
		}
		isTouching = false;
		// Keep hover state briefly to show the final position
		setTimeout(() => {
			isTimelineHovered = false;
			hoverProgress = null;
		}, 200);
	}
</script>

{#if visible}
	<div class="mb-3">
		<div 
			class="timeline-container relative h-0.5 overflow-hidden rounded-full bg-white/10 sm:h-1 cursor-pointer group"
			role="button"
			tabindex="0"
			aria-label="Timeline scrubber - click to seek"
			onclick={handleTimelineClick}
			onmouseenter={handleTimelineMouseEnter}
			onmouseleave={handleTimelineMouseLeave}
			onmousemove={handleTimelineMouseMove}
			onkeydown={handleTimelineKeydown}
			ontouchstart={handleTimelineTouchStart}
			ontouchmove={handleTimelineTouchMove}
			ontouchend={handleTimelineTouchEnd}
		>
			<!-- Progress bar -->
			<div
				class="h-full rounded-full bg-white/40 transition-all duration-300 ease-out"
				style="width: {currentProgress * 100}%"
			></div>
			
			<!-- Scrubber handle -->
			<div
				class="timeline-scrubber absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 border border-white/30 shadow-md transition-opacity duration-200 group-hover:opacity-100 sm:h-3 sm:w-3 sm:border-2"
				class:opacity-100={isTimelineHovered}
				class:opacity-0={!isTimelineHovered}
				style="left: {currentProgress * 100}%"
			></div>
			
			<!-- Hover preview scrubber -->
			{#if isTimelineHovered && hoverProgress !== null}
				<div
					class="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 border border-white/20 shadow-md sm:h-3 sm:w-3 sm:border-2"
					style="left: {hoverProgress * 100}%"
				></div>
				
				<!-- Hover time tooltip -->
				<div
					class="absolute bottom-full mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded backdrop-blur-sm pointer-events-none"
					style="left: {hoverProgress * 100}%; transform: translateX(-50%)"
				>
					{formatTime(hoverProgress * totalDuration)}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.timeline-scrubber {
		transition: opacity 0.2s ease;
	}

	.timeline-container:hover .timeline-scrubber {
		opacity: 1;
	}

	/* Better mobile touch target */
	.timeline-container {
		min-height: 10px;
		display: flex;
		align-items: center;
		touch-action: none;
	}

	.timeline-container > div:first-child {
		margin: auto 0;
	}
</style>

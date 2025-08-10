<script lang="ts">
	let { suffix } = $props();
</script>

<div class="relative h-0 w-full overflow-hidden pb-[56.25%]">
	<iframe
		class="absolute top-0 left-0 size-full"
		src="https://www.youtube-nocookie.com/embed/{suffix}"
		title="YouTube video"
		frameborder="0"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
		allowfullscreen
	></iframe>
</div>

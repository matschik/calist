<script lang="ts">
	let { suffix } = $props();
</script>

<div class="relative w-full pb-[56.25%] h-0 overflow-hidden">
	<iframe
		class="absolute top-0 left-0 size-full"
		src="https://www.youtube-nocookie.com/embed/{suffix}"
		title="YouTube video"
		frameborder="0"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
		allowfullscreen
	></iframe>
</div>

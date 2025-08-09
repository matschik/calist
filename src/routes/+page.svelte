<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import WorkoutSession from '$lib/WorkoutSession.svelte';

	const flipDurationMs = 200;

	const session = {
		name: 'Push Up'
	};

	let steps = $state([
		{
			id: 0,
			type: 'rest' as const,
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
			type: 'exercise' as const,
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
			type: 'exercise' as const,
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
					x: 0, // Position horizontale (%)
					y: 100, // Position verticale (%)
					width: 100, // Largeur (%)
					height: 0 // Hauteur (%) - recadre le bas de l'image
				}
			}
		},
		{
			id: 3,
			type: 'exercise' as const,
			label: 'Plank Hold',
			duration: 60,
			sets: 4,
			reps: 1,
			rest: 60,
			content: {
				imageUrl: 'https://i.pinimg.com/originals/b1/3a/19/b13a19da8641ca4cf235891ac20b2f54.gif',
				description:
					'Hold a strong plank position. Keep your core tight, back straight, and maintain steady breathing.'
			},
		}
	]);

	function handleSort(e: CustomEvent<{ items: typeof steps }>) {
		steps = e.detail.items;
	}
</script>

<svelte:head>
	<title>Calist</title>
</svelte:head>

<WorkoutSession {steps} sessionName={session.name} />

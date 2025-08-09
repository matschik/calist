export interface WorkoutStep {
    id: number;
    type: 'exercise' | 'rest';
    label: string;
    duration: number;
    sets: number;
    reps: number;
    rest: number;
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
}

export interface Workout {
    name: string;
    slug: string;
    description: string;
    benefits: string[];
    steps: WorkoutStep[];
}

const stepGettingStarted: WorkoutStep = {
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
};

export const workouts: Workout[] = [
    {
        name: 'Push Up',
        slug: 'push-up',
        description: 'Master the fundamental pushing movement with progressive exercises',
        benefits: ['Upper body strength', 'Core stability', 'Chest & triceps'],
        steps: [
            stepGettingStarted,
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
                        x: 0, // Position horizontale (%)
                        y: 100, // Position verticale (%)
                        width: 100, // Largeur (%)
                        height: 0 // Hauteur (%) - recadre le bas de l'image
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
        ]
    },
    {
        name: 'Pull Up',
        slug: 'pull-up',
        description: 'Build pulling strength and work towards your first pull-up',
        benefits: ['Back muscles', 'Lat development', 'Grip strength'],
        steps: [
            stepGettingStarted,
            {
                id: 1,
                type: 'exercise',
                label: 'Bent Over Barbell Rows',
                duration: 35,
                sets: 3,
                reps: 15,
                rest: 0,
                content: {
                    imageUrl: 'https://downloads.ctfassets.net/6ilvqec50fal/26TEIC8oITW2g58iY4lx9i/bc3ddf88afd1fa401738c39e64a17dfa/Reverse_Grip_-_Underhand_-_Barbell_Bent-Over_Row.gif',
                    description: 'Keep your back straight and hinge at the hips. Pull the barbell towards your lower chest, squeezing your shoulder blades together.'
                }
            },
            {
                id: 2,
                type: 'exercise',
                label: 'Passive Hang',
                duration: 60,
                sets: 3,
                reps: 1,
                rest: 180,
                content: {
                    imageUrl: 'https://image.boxrox.com/2023/07/Dead-hang-1024x580.jpg',
                    description: 'Hang from a pull-up bar with arms fully extended. Focus on engaging your lats and building grip strength.'
                }
            }
        ]
    },
    {
        name: 'Squat',
        slug: 'squat',
        description: 'Perfect your squat form and build powerful legs',
        benefits: ['Leg strength', 'Glute activation', 'Mobility'],
        steps: [
            stepGettingStarted,
            {
                id: 1,
                type: 'exercise',
                label: 'Deep Squats',
                duration: 60,
                sets: 3,
                reps: 12,
                rest: 120,
                content: {
                    imageUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/467.gif',
                    description: 'Keep your back straight and your chest up. Lower your body slowly to the ground over 3-5 seconds. Reset to starting position.'
                }
            },
            {
                id: 2,
                type: 'exercise',
                label: 'Narrow Stance Squats',
                duration: 60,
                sets: 3,
                reps: 12,
                rest: 120,
                content: {
                    imageUrl: 'https://i.makeagif.com/media/6-29-2015/1XtvKl.gif',
                    description: 'Keep your feet close together. Maintain proper squat form with controlled movement and full range of motion.'
                }
            },
            {
                id: 3,
                type: 'exercise',
                label: 'Bodyweight Squats',
                duration: 60,
                sets: 3,
                reps: 15,
                rest: 120,
                content: {
                    imageUrl: 'https://cdn.betterme.world/articles/wp-content/uploads/2021/04/Air-Squat.gif',
                    description: 'Standard bodyweight squats. Keep your back straight and your chest up. Lower your body slowly and return to starting position.'
                }
            }
        ]
    }
];

// Helper function to get workout by slug
export function getWorkoutBySlug(slug: string): Workout | undefined {
    return workouts.find(workout => workout.slug === slug);
}

// Export individual workouts for convenience
export const pushUpWorkout = workouts[0];
export const pullUpWorkout = workouts[1];
export const squatWorkout = workouts[2];
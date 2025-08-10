export const db = {
    exercices: [
        {
            id: "a74909ff-b865-48f1-a82e-18211a788215",
            title: 'Negative Push-ups',
            images: [{ url: 'https://fitnessfaqs.com/wp-content/uploads/2023/12/Negative-push-ups.gif' }],
            muscles: [],
            description: ""
        },
        {
            id: "d4f55277-e441-4266-9b1f-df8d26ab3d96",
            title: "Scapula Push-ups",
            images: [{
                url: 'https://www.exploreparkour.com/wp-content/uploads/2020/08/Exercise-Scapular-Push-Up-SM.gif',
                crop: {
                    x: 0, // Position horizontale (%)
                    y: 100, // Position verticale (%)
                    width: 100, // Largeur (%)
                    height: 0 // Hauteur (%) - recadre le bas de l'image
                }
            }],
            description: 'In plank position, focus on squeezing and releasing your shoulder blades while keeping arms straight.',
        },
        {
            id: 'ab231895-b370-4bcc-a7ca-d58ec1608cf1',
            title: 'Plank Hold',
            images: [{ url: 'https://i.pinimg.com/originals/b1/3a/19/b13a19da8641ca4cf235891ac20b2f54.gif' }],
            description: 'Hold a strong plank position. Keep your core tight, back straight, and maintain steady breathing.'
        },
        {
            id: "888a4569-238e-403c-ae73-dbf862580d00",
            title: 'Deep Squats',
            images: [{url: "https://evofitness.at/wp-content/uploads/2025/05/deep-squat.gif"}], //[{ url: 'https://cdn.jefit.com/assets/img/exercises/gifs/467.gif' }],
            description: 'Keep your back straight and your chest up. Lower your body slowly to the ground over 3-5 seconds. Reset to starting position.'
        },
        {
            id: "384d6d6a-43b6-4b40-be7f-b3d34a720b9f",
            title: 'Narrow Stance Squats',
            images: [{ url: 'https://i.makeagif.com/media/6-29-2015/1XtvKl.gif' }],
            description: 'Keep your feet close together. Maintain proper squat form with controlled movement and full range of motion.'
        },
        {
            id: "bc702648-afb7-44ac-a349-890c022e3dc",
            title: 'Bodyweight Squats',
            images: [{ url: 'https://cdn.betterme.world/articles/wp-content/uploads/2021/04/Air-Squat.gif' }],
            description: 'Standard bodyweight squats. Keep your back straight and your chest up. Lower your body slowly and return to starting position.'
        },
        {
            id: "e8f9a123-4567-89ab-cdef-0123456789ab",
            title: 'Bent Over Barbell Rows',
            images: [{ url: 'https://downloads.ctfassets.net/6ilvqec50fal/26TEIC8oITW2g58iY4lx9i/bc3ddf88afd1fa401738c39e64a17dfa/Reverse_Grip_-_Underhand_-_Barbell_Bent-Over_Row.gif' }],
            description: 'Keep your back straight and hinge at the hips. Pull the barbell towards your lower chest, squeezing your shoulder blades together.'
        },
        {
            id: "f1b2c3d4-5e6f-7890-abcd-ef1234567890",
            title: 'Passive Hang',
            images: [{ url: 'https://image.boxrox.com/2023/07/Dead-hang-1024x580.jpg' }],
            description: 'Hang from a pull-up bar with arms fully extended. Focus on engaging your lats and building grip strength.'
        }
    ],
    workouts: [
        {
            id: "31da8a69-2ffd-4e78-98cc-d49331c25312",
            title: "Push Ups lvl 1",
            tags: ["lvl 1"],
            description: 'Master the fundamental pushing movement with progressive exercises',
            benefits: ['Upper body strength', 'Core stability', 'Chest & triceps'],
            exerciceLoops: [
                {
                    exercices: [
                        {
                            id: "a74909ff-b865-48f1-a82e-18211a788215",
                            reps: 8
                        }
                    ],
                    sets: 3,
                    rest: 120,
                },
                {
                    exercices: [
                        {
                            id: "d4f55277-e441-4266-9b1f-df8d26ab3d96",
                            reps: 8
                        }
                    ],
                    sets: 4,
                    rest: 120
                },
                {
                    exercices: [{ id: 'ab231895-b370-4bcc-a7ca-d58ec1608cf1' }],
                    sets: 4,
                    rest: 120
                }
            ]
        },
        {
            id: "c97d8e45-6f2a-4b8c-9e1f-7a3b5c9d8e1f",
            title: "Pull Ups lvl 1",
            tags: ["lvl 1"],
            description: 'Build pulling strength and work towards your first pull-up',
            benefits: ['Back muscles', 'Lat development', 'Grip strength'],
            exerciceLoops: [
                {
                    exercices: [
                        {
                            id: "e8f9a123-4567-89ab-cdef-0123456789ab",
                            reps: 15
                        },
                        {
                            id: "f1b2c3d4-5e6f-7890-abcd-ef1234567890"
                        }
                    ],
                    sets: 3,
                    rest: 120
                }
            ]
        },
        {
            id: "b86c4e67-3993-477d-89e1-d21eadd98736",
            title: "Squats lvl 1",
            tags: ["lvl 1"],
            description: 'Perfect your squat form and build powerful legs',
            benefits: ['Leg strength', 'Glute activation', 'Mobility'],
            exerciceLoops: [
                {
                    exercices: [{
                        id: "888a4569-238e-403c-ae73-dbf862580d00",
                        reps: 12,
                        tempo: "2010"
                    }],
                    sets: 3,
                    rest: 120
                },
                {
                    exercices: [{
                        id: "384d6d6a-43b6-4b40-be7f-b3d34a720b9f",
                        reps: 12,
                        tempo: "2010"
                    }],
                    sets: 3,
                    rest: 120
                },
                {
                    exercices: [{
                        id: "bc702648-afb7-44ac-a349-890c022e3dc",
                        reps: 15,
                        tempo: "2010"
                    }],
                    sets: 3,
                    rest: 120
                }
            ]
        },
    ]
}


export interface Exercise {
    id: string;
    title: string;
    images: Array<{
        url: string;
        crop?: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }>;
    muscles?: string[];
    description: string;
}

export interface ExerciseLoop {
    exercices: Array<{
        id: string;
        reps?: number;
        tempo?: string;
    }>;
    sets: number;
    rest: number;
}

export interface Workout {
    id: string;
    title: string;
    tags: string[];
    description: string;
    benefits: string[];
    exerciceLoops: ExerciseLoop[];
}

// Helper function to get workout by slug (using title as slug for now)
export function getWorkoutBySlug(slug: string): Workout | undefined {
    return db.workouts.find(workout => 
        workout.title.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
    );
}

// Helper function to get exercise by id
export function getExerciseById(id: string): Exercise | undefined {
    return db.exercices.find(exercise => exercise.id === id);
}



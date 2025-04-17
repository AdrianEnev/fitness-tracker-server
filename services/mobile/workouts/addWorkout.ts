
import { generateRandomColour } from '@utils/generateRandomColour';
import InternalError from '@custom_errors/InternalError';
import { FIRESTORE_ADMIN, FIREBASE_ADMIN } from '@config/firebaseConfig';

const addWorkout = async (userId: string, language: string, exercises: any, workoutTitle: string, workoutId: any, folder?: any) => {

    console.log('Adding workout: ', workoutTitle);

    const usersCollectionRef = FIRESTORE_ADMIN.collection("users");
    const userDocRef = usersCollectionRef.doc(userId);
    const userWorkoutsCollectionRef = userDocRef.collection("workouts");
    const workoutDocRef = userWorkoutsCollectionRef.doc(workoutId);

    let exerciseTitle = "Exercise ";
    if (language == "bg") {
        exerciseTitle = "Упражнение ";
    }
    else if (language == "de") {
        exerciseTitle = "Übung ";
    }
    else if (language == "ru") {
        exerciseTitle = "Упражнение ";
    }
    else if (language == "es") {
        exerciseTitle = "Ejercicio ";
    }
    else if (language == "it") {
        exerciseTitle = "Esercizio ";
    }

    if (exercises.length === 0) {

        // Add rest day workout
        try {
            await workoutDocRef.set({
                title: workoutTitle.trim(),
                created: FIREBASE_ADMIN.firestore.Timestamp.now(),
                colour: generateRandomColour(),
                numberOfExercises: 0,
                folderId: folder ? folder.id : null
            });
        } catch (err) {
            throw new InternalError("Failed to add rest day");
        }

    } else {

        // Add regular workout
        try {
            await workoutDocRef.set({
                title: workoutTitle.trim(),
                created: FIREBASE_ADMIN.firestore.Timestamp.now(),
                colour: generateRandomColour(),
                numberOfExercises: exercises.length,
                folderId: folder ? folder.id : null
            });
        } catch (error: any) {
            throw new InternalError("Failed to add workout: " + error);
        }

        const workoutInfoCollectionRef = workoutDocRef.collection("info");

        try {
            for (const exercise of exercises) {
                for (let index = 0; index < exercise.sets.length; index++) {
                    const set = exercise.sets[index];

                    if (exercise.title === '') {
                        exercise.title = exerciseTitle + (exercise.exerciseIndex + 1);
                    }

                    const exerciseDocRef = workoutInfoCollectionRef.doc((exercise.exerciseIndex + 1).toString());
                    await exerciseDocRef.set({
                        title: exercise.title.trim(),
                        exerciseIndex: exercise.exerciseIndex + 1,
                    });

                    const exerciseSets = exerciseDocRef.collection("sets");
                    await exerciseSets.add({
                        reps: set.reps,
                        weight: set.weight,
                        intensity: set.intensity ? set.intensity : null,
                        setIndex: index + 1
                    });
                }
            }
        } catch (err) {
            throw new InternalError("Failed to add exercise/s for workout");
        }
    }

    console.log('Workout added successfully!');
}

export default addWorkout;

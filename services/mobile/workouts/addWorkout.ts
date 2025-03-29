import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../../config/firebaseConfig';
import { generateRandomColour } from '../../generateRandomColour';

// TESTED - everything here works (specifying just in case I forget)

const addWorkout = async (userId: string, language: string, exercises: any, workoutTitle: string, workoutId: any, folder?: any) => {

    console.log('Adding workout: ', workoutTitle);

    const usersCollectionRef = collection(FIRESTORE_DB, "users");
    const userDocRef = doc(usersCollectionRef, userId);
    const userWorkoutsCollectionRef = collection(userDocRef, "workouts");
    const workoutDocRef = doc(userWorkoutsCollectionRef, workoutId);

    let exerciseTitle = "Exercise "
    if (language == "bg") {
        exerciseTitle = "Упражнение "
    }
    else if (language == "de") {
        exerciseTitle = "Übung "
    }
    else if (language == "ru") {
        exerciseTitle = "Упражнение "
    }
    else if (language == "es") {
        exerciseTitle = "Ejercicio "
    }
    else if (language == "it") {
        exerciseTitle = "Esercizio "
    }

    if (exercises.length === 0) {

        // Add rest day workout
        await setDoc(workoutDocRef, {
            title: workoutTitle.trim(),
            created: serverTimestamp(),
            colour: generateRandomColour(),
            numberOfExercises: 0,
            folderId: folder ? folder.id : null
        });
    } else {

        // Add regular workout
        await setDoc(workoutDocRef, {
            title: workoutTitle.trim(),
            created: serverTimestamp(),
            colour: generateRandomColour(),
            numberOfExercises: exercises.length,
            folderId: folder ? folder.id : null
        });

        const workoutInfoCollectionRef = collection(workoutDocRef, "info");

        try {
            exercises.forEach((exercise: any) => {
                exercise.sets.forEach(async (set: any, index: any) => {
                    if (exercise.title === '') {
                        exercise.title = exerciseTitle + (exercise.exerciseIndex + 1);
                    }

                    const exerciseDocRef = doc(workoutInfoCollectionRef, (exercise.exerciseIndex + 1).toString());
                    await setDoc(exerciseDocRef, {
                        title: exercise.title.trim(),
                        exerciseIndex: exercise.exerciseIndex + 1,
                    });

                    const exerciseSets = collection(exerciseDocRef, "sets");
                    await addDoc(exerciseSets, {
                        reps: set.reps,
                        weight: set.weight,
                        intensity: set.intensity ? set.intensity : null,
                        setIndex: index + 1
                    });
                });
            });
        } catch (err) {
            console.error(err);
        }

    }

    console.log('Workout added successfuly!');

}

export default addWorkout;
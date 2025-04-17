import { FIRESTORE_ADMIN } from "@config/firebaseConfig";
import generateID from "@utils/generateFirebaseId";

interface WorkoutData {
    workout: any;
    userInputs: any;
    newExercises: any;
    newWorkoutTitle: string
}

// workoutId can be retreived from workout.id but is passed seperately to simplify the router url

const saveWorkoutEdits = async (workoutData: WorkoutData, userId: string, workoutId: string) => {

    const { workout, userInputs, newExercises, newWorkoutTitle } = workoutData;
    
    // workout and userInputs seem to be tied and have the same values (in frontend)
    // both are passed though, to avoid confusion for now

    const usersCollectionRef = FIRESTORE_ADMIN.collection("users");
    const userDocRef = usersCollectionRef.doc(userId);
    const userWorkoutsCollectionRef = userDocRef.collection("workouts");
    const workoutDocRef = userWorkoutsCollectionRef.doc(workoutId);
    const workoutInfoCollectionRef = workoutDocRef.collection("info");

    const data = await workoutInfoCollectionRef.get();
    const exercisesData: any[] = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    for (let exercise of exercisesData) {
        const setsCollectionRef = workoutInfoCollectionRef.doc(exercise.id).collection("sets");
        const setsData = await setsCollectionRef.get();
        const sets: any[] = setsData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        exercise.sets = sets;

        const currentExercise = userInputs.find((input: any) => input.id === exercise.id);
        if (currentExercise) {
            for (let set of exercise.sets) {
                const currentSet = currentExercise.sets.find((inputSet: any) => inputSet.id === set.id);
                if (currentSet) {
                    const setDocData: any = {
                        reps: currentSet.reps,
                        weight: currentSet.weight,
                        setIndex: currentSet.setIndex,
                    };

                    // Include intensity if it exists
                    if (currentSet.intensity) {
                        setDocData.intensity = currentSet.intensity;
                    }

                    await setsCollectionRef.doc(set.id).set(setDocData);
                }
            }

            // Adding new sets
            const addedSets = currentExercise.sets.filter((set: any) => !sets.some((dbSet: any) => dbSet.id === set.id));
            let nextIndex = sets.length; // Start indexing for new sets after the existing ones
            for (let addedSet of addedSets) {
                const newSetId = generateID();
                const newSetDocData: any = {
                    reps: addedSet.reps,
                    weight: addedSet.weight,
                    setIndex: nextIndex + 1,
                };

                // Include intensity if it exists
                if (addedSet.intensity) {
                    newSetDocData.intensity = addedSet.intensity;
                }

                await setsCollectionRef.doc(newSetId).set(newSetDocData);
                nextIndex++;
            }

            // Check if any sets were removed (and not added)
            const removedSetsExist = sets.length > currentExercise.sets.length;
            if (removedSetsExist) {
                // First, delete all existing sets in Firestore to start fresh
                for (let set of sets) {
                    const setDocRef = setsCollectionRef.doc(set.id);
                    await setDocRef.delete();
                }

                // Then, add back all current sets with new indexes
                for (const [index, set] of currentExercise.sets.entries()) {
                    const newSetId = set.id ? set.id : generateID();
                    const newSetDocData: any = {
                        reps: set.reps,
                        weight: set.weight,
                        setIndex: index + 1, // Re-index starting from 1
                    };

                    // Include intensity if it exists
                    if (set.intensity) {
                        newSetDocData.intensity = set.intensity;
                    }

                    await setsCollectionRef.doc(newSetId).set(newSetDocData);
                }
            }

            // check if any of the exercise titles have been updated
            const currentExerciseTitle = newExercises.find((ex: any) => ex.id === exercise.id);
            if (currentExerciseTitle) {
                await workoutInfoCollectionRef.doc(exercise.id).set({
                    title: currentExerciseTitle.title,
                    exerciseIndex: currentExerciseTitle.exerciseIndex
                }, { merge: true });
            }
        }
    }

    // check if any new exercises have been added to the workout
    const addedExercises = userInputs.filter((input: any) => !exercisesData.some((dbExercise: any) => dbExercise.id === input.id));
    let nextIndex = 0;

    for (let addedExercise of addedExercises) {
        // Generate title if empty, similar to useAddWorkout.tsx logic
        if (addedExercise.title === '') {
            addedExercise.title = "Упражнение " + (nextIndex + 1);
        }

        const newExerciseId = generateID();
        await workoutInfoCollectionRef.doc(newExerciseId).set({
            title: addedExercise.title.trim(),
            exerciseIndex: nextIndex + 1
        });

        const setsCollectionRef = workoutInfoCollectionRef.doc(newExerciseId).collection("sets");
        let setIndex = 1;

        for (let set of addedExercise.sets) {

            const newSetDocData: any = {
                reps: set.reps,
                weight: set.weight,
                intensity: set.intensity ? set.intensity : null,
                setIndex: setIndex,
            };

            await setsCollectionRef.add(newSetDocData);
            setIndex++;
        }
        nextIndex++;
    }

    //workout.created gets converted from timestamp to string when saving edits
    if (newWorkoutTitle === '') {
        await workoutDocRef.set({
            title: workout.title,
            created: workout.created,
            colour: workout.colour,
            numberOfExercises: userInputs.length
        }, { merge: true });
    } else {
        await workoutDocRef.set({
            title: newWorkoutTitle,
            created: workout.created,
            colour: workout.colour,
            numberOfExercises: userInputs.length
        }, { merge: true });
    }

    console.log("Workout saved successfully");
}

export default saveWorkoutEdits;
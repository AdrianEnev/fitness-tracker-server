import { generateRandomColour } from '../../utils/generateRandomColour';
import InternalError from '@custom_errors/InternalError';
import { FIRESTORE_ADMIN, FIREBASE_ADMIN } from '@config/firebaseConfig';

const syncWorkoutsInFolders = async (userId: string, localFolders: any) => { 


    if (!localFolders) {
        throw new InternalError('No folders found!');
    }

    for (const folder of localFolders) {
        const folderWorkouts = folder.workouts || [];

        for (const localWorkout of folderWorkouts) {
            const userDocRef = FIRESTORE_ADMIN.collection("users").doc(userId);
            const userWorkoutsCollectionRef = userDocRef.collection("workouts");
            const workoutDocRef = userWorkoutsCollectionRef.doc(localWorkout.id);

            const workoutSnapshot = await workoutDocRef.get();

            if (!workoutSnapshot.exists) {
                await workoutDocRef.set({
                    title: localWorkout.title?.trim() || 'Untitled Workout',
                    created: localWorkout.created || FIREBASE_ADMIN.firestore.Timestamp.now(),
                    colour: localWorkout.colour || generateRandomColour(), 
                    numberOfExercises: localWorkout.numberOfExercises || 0,
                    folderId: folder.id
                });

                const workoutInfoCollectionRef = workoutDocRef.collection("info");

                for (const exercise of localWorkout.info || []) {
                    const exerciseDocRef = workoutInfoCollectionRef.doc(exercise.exerciseIndex.toString());

                    await exerciseDocRef.set({
                        title: exercise.title?.trim() || `Exercise ${exercise.exerciseIndex}`,
                        exerciseIndex: exercise.exerciseIndex,
                    });

                    const exerciseSetsCollectionRef = exerciseDocRef.collection("sets");

                    for (const [index, set] of (exercise.sets || []).entries()) {
                        await exerciseSetsCollectionRef.add({
                            reps: set.reps,
                            weight: set.weight,
                            intensity: set.intensity || null,
                            setIndex: index + 1
                        });
                    }
                }
            }
        }
    }

    console.log('Synced workouts in folders!');
};

export default syncWorkoutsInFolders;

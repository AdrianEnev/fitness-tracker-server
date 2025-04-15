import { FIRESTORE_ADMIN } from "@config/firebaseConfig";
import InternalError from "@custom_errors/InternalError";
import admin from "firebase-admin";

interface WorkoutData {
    exercises: any[];
    workoutTitle: string;
    duration: number;
    id: string;
}

const endWorkout = async (workoutData: WorkoutData, userId: string) => {
    
    //console.log('Attempting to save completed workout to database...');

    const { exercises, workoutTitle, duration, id } = workoutData;
    const db = FIRESTORE_ADMIN;

    const userDocRef = db.collection("users").doc(userId);
    const userSavedWorkoutsCollectionRef = userDocRef.collection("saved_workouts");
    const userInfoCollectionRef = userDocRef.collection("user_info");

    const savedWorkoutDocRef = userSavedWorkoutsCollectionRef.doc(id);
    await savedWorkoutDocRef.set({
        title: workoutTitle,
        created: admin.firestore.FieldValue.serverTimestamp(),
        duration: duration,
    });

    let totalWeight = 0;

    try {
        await Promise.all(exercises.map(async (exercise: any) => {
            const savedWorkoutInfo = savedWorkoutDocRef.collection("info");
            const exerciseDocRef = savedWorkoutInfo.doc((exercise.exerciseIndex).toString());

            await exerciseDocRef.set({
                title: exercise.title,
                description: exercise.description || "",
                exerciseIndex: exercise.exerciseIndex,
                note: exercise.note,
            });

            let exerciseTotalWeight = 0;

            await Promise.all(exercise.sets.map(async (set: any, index: number) => {
                const exerciseSets = exerciseDocRef.collection("sets");
                await exerciseSets.add({
                    reps: set.reps,
                    weight: set.weight,
                    rpe: set.rpe !== undefined ? set.rpe : "0",
                    setIndex: index + 1,
                    intensity: set.intensity || 0,
                });

                const weight = parseFloat(set.weight);
                if (!isNaN(weight)) {
                    exerciseTotalWeight += weight;
                }
            }));

            totalWeight += exerciseTotalWeight;
        }));

        if (!isNaN(totalWeight)) {
            const statisticsDocRef = userInfoCollectionRef.doc("statistics");
            const statisticsDoc = await statisticsDocRef.get();

            let finishedWorkouts = 0;
            let existingWeight = 0;

            if (statisticsDoc.exists) {
                const data = statisticsDoc.data();
                existingWeight = typeof data?.weightLifted === 'number' ? data.weightLifted : 0;
                finishedWorkouts = typeof data?.finishedWorkouts === 'number' ? data.finishedWorkouts : 0;
            }

            totalWeight += existingWeight;
            finishedWorkouts += 1;

            await statisticsDocRef.set({
                weightLifted: totalWeight,
                finishedWorkouts: finishedWorkouts,
            });

            console.log('Workout saved in database');
        } else {
            throw new InternalError('Total weight is invalid/NaN');
        }
    } catch (err) {
        console.error('Failed to save workout:', err);
    }
};

export default endWorkout;

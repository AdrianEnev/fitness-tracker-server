import { FIRESTORE_ADMIN } from "@config/firebaseConfig";
import InternalError from "@custom_errors/InternalError";

// Compare asyncstorage workouts to database workouts.  
// If there is a difference, return database workouts
const retreiveWorkouts = async (asyncStorageWorkouts: any, userId: string) => {
    
    const workoutsCollectionRef = FIRESTORE_ADMIN
        .collection('users')
        .doc(userId)
        .collection('workouts');
    const workoutsSnapshot = await workoutsCollectionRef.get();

    // get number of documents inside the workouts collection
    const workoutsCountDB = workoutsSnapshot.size;

    // No workouts to retreive
    if (workoutsCountDB === 0) {
        return null;
    }

    // Safely parse asyncStorageWorkouts, default to [] if empty or invalid
    let workoutsAS: any[] = [];
    if (asyncStorageWorkouts) {
        try {
            workoutsAS = JSON.parse(asyncStorageWorkouts);
            if (!Array.isArray(workoutsAS)) workoutsAS = [];
        } catch (e) {
            workoutsAS = [];
        }
    }
    
    // Compare workout IDs to find missing workouts
    const workouts = workoutsSnapshot.docs.map((doc: any) => ({ id: doc.id, title: doc.data().title, folderId: doc.data().folderId, ...doc.data() }));
    const missingWorkouts = workouts.filter((workout: any) => {
        const found = workoutsAS.some((workoutAS: any) => {
            return workoutAS.id === workout.id;
        });
        return !found;
    });

    // No missing workouts, return empty array
    if (missingWorkouts.length === 0) {
        return [];
    }
        
    try{
        const missingWorkoutsList: any[] = [];

        for (const workout of missingWorkouts) {
            const workoutInfoCollectionRef = workoutsCollectionRef
                .doc(workout.id)
                .collection('info');
            const workoutInfoSnapshot = await workoutInfoCollectionRef.get();
                let exercises = [];
                for (const exerciseDoc of workoutInfoSnapshot.docs) {
                    const exerciseData = exerciseDoc.data();
                    const setsCollectionRef = workoutInfoCollectionRef
                        .doc(exerciseDoc.id)
                        .collection('sets');
                    const setsSnapshot = await setsCollectionRef.get();
                    let sets = setsSnapshot.docs.map((setDoc: any) => setDoc.data());
                    // Sort sets by setIndex
                    sets = sets.sort((a, b) => a.setIndex - b.setIndex);
                    exercises.push({
                        id: exerciseDoc.id,
                        ...exerciseData,
                        sets,
                        exerciseIndex: (exerciseData.exerciseIndex || 1),
                        description: exerciseData.description,
                        note: exerciseData.note
                    });
                }
            
            // Sort exercises by exerciseIndex
            exercises = exercises.sort((a, b) => a.exerciseIndex - b.exerciseIndex);
            
            // add missing workout to list
            missingWorkoutsList.push({
                ...workout,
                exercises
            });
        }

        return missingWorkoutsList;

    }catch(error: any){
       throw new InternalError(error)
    }
}

export default retreiveWorkouts;
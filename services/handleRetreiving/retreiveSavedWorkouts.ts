import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from "@config/firebaseConfig"

// Compare asyncstorage saved workouts to database saved workouts.  
// If there is a difference, return database saved workouts
const retreiveSavedWorkouts = async (asyncStorageSavedWorkouts: any, userId: string) => {
    
    const savedWorkoutsCollectionRef = FIRESTORE_ADMIN
        .collection('users')
        .doc(userId)
        .collection('saved_workouts');
    const savedWorkoutsSnapshot = await savedWorkoutsCollectionRef.get();

    // get number of documents inside the saved workouts collection
    const savedWorkoutsCountDB = savedWorkoutsSnapshot.size;

    // No saved workouts to retreive
    if (savedWorkoutsCountDB === 0) {
        return null;
    }

    // Safely parse asyncStorageSavedWorkouts, default to [] if empty or invalid
    let savedWorkoutsAS: any[] = [];
    if (asyncStorageSavedWorkouts) {
        try {
            savedWorkoutsAS = JSON.parse(asyncStorageSavedWorkouts);
            if (!Array.isArray(savedWorkoutsAS)) savedWorkoutsAS = [];
        } catch (e) {
            savedWorkoutsAS = [];
        }
    }

    // Find missing saved workouts in async storage
    const savedWorkouts = savedWorkoutsSnapshot.docs.map((doc: any) => ({ 
        id: doc.id, 
        title: doc.data().title, 
        created: doc.data().created, 
        duration: doc.data().duration, 
        ...doc.data() 
    }));

    const missingSavedWorkouts = savedWorkouts.filter((savedWorkout: any) => {
        const found = savedWorkoutsAS.some((savedWorkoutAS: any) => {
            return savedWorkoutAS.id === savedWorkout.id;
        });
        return !found;
    });

    // Debug: Log all IDs being returned as missing
    const missingIds = missingSavedWorkouts.map((w: any) => w.id);
    console.log('Missing Saved Workout IDs:', missingIds);

    // If there are no missing saved workouts, return empty array
    if (missingSavedWorkouts.length === 0) {
        console.log('No missing saved workouts')
        return [];
    }

    try{
        const missingSavedWorkoutsList: any[] = [];

        for (const savedWorkout of missingSavedWorkouts) {

            const savedWorkoutInfoCollectionRef = savedWorkoutsCollectionRef
                .doc(savedWorkout.id)
                .collection('info');
            const savedWorkoutInfoSnapshot = await savedWorkoutInfoCollectionRef.get();
            let exercises = [];
        
            for (const exerciseDoc of savedWorkoutInfoSnapshot.docs) {
                const exerciseData = exerciseDoc.data();
                const setsCollectionRef = savedWorkoutInfoCollectionRef
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
        
            // add missing saved workout to list
            missingSavedWorkoutsList.push({
                ...savedWorkout,
                exercises
            });
        }

        if (missingSavedWorkoutsList.length === 0) {
            return [];
        }

        return missingSavedWorkoutsList;

    }catch(error: any){
        throw new InternalError(error)
    }
}

export default retreiveSavedWorkouts;

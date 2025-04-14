import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

// Gets a snapshot of workout documents. Effective for updates but not for displaying info
// Different from getWorkouts() inside getUserInfo.tsx
const getWorkouts = async (userId: string) => {
    
    // Reference to the user's workouts collection in Firestore
    const userDocRef = FIRESTORE_ADMIN.collection('users').doc(userId);
    const userWorkoutsCollectionRef = userDocRef.collection('workouts');

    const userWorkoutsSnapshot = await userWorkoutsCollectionRef.get();
    return userWorkoutsSnapshot;
}

export default getWorkouts;
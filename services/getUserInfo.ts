import { collection, doc, getDoc, getDocs, Timestamp } from 'firebase/firestore'
import { FIRESTORE_DB } from '../config/firebaseConfig';
import { getStorage, ref } from 'firebase/storage';

const getUserInfo = async (userId: string) => {

    const usersCollectionRef = collection(FIRESTORE_DB, "users");
    const userDocRef = doc(usersCollectionRef, userId);
    const userInfoCollectionRef = collection(userDocRef, "user_info");

    console.log('Retrieving user info...');
    try {
        const language = await getLanguage(userInfoCollectionRef);
        const workouts = await getWorkouts(userDocRef);
        const savedWorkouts = await getSavedWorkouts(userDocRef);
        const foodDays = await getFoodDays(userDocRef);
        const friends = await getFriends(userInfoCollectionRef);
        const statistics = await getStatistics(userInfoCollectionRef);
        const username = await getUsername(userInfoCollectionRef);
        const dailyGoals = await getDailyGoals(userInfoCollectionRef);
        const dateRegistered = await getDateRegistered(userDocRef);
        const profilePictureRef = await getProfilePictureRef(userId);

        console.log('User info retrieved successfully');

        return { 
            language, 
            workouts, 
            savedWorkouts, 
            foodDays, 
            friends, 
            statistics, 
            username, 
            dailyGoals,
            dateRegistered,
            profilePictureRef
        };

    } catch (error) {
        console.error("Error retrieving user info:", error);
        return null;
    }
}

export default getUserInfo;

const getDateRegistered = async (userDocRef: any) => {
    
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data() as any;
        const registrationTimestamp = userData?.registrationDate;

        if (registrationTimestamp instanceof Timestamp) {
            const formattedDate = formatDateRegistered(registrationTimestamp.toDate())

            return formattedDate;
        }
    }

    return null;
}

const formatDateRegistered = (date: any) => {
    if (date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    return null;
}

const getProfilePictureRef = async (userId: any) => {
    const storage = getStorage();
    const profilePictureRef = ref(storage, `users/${userId}/profile_picture`);

    if (!profilePictureRef) {
        return null;
    }

    return profilePictureRef;
}

const getDailyGoals = async (userInfoCollectionRef: any) => {

    const dailyGoalsDocRef = doc(userInfoCollectionRef, "nutrients");
    const dailyGoals = await getDoc(dailyGoalsDocRef);
    
    if (dailyGoals.exists()) {
        const dailyGoalsData =  JSON.stringify(dailyGoals.data());
        return dailyGoalsData;
    }

    return null;
}

const getUsername = async (userInfoCollectionRef: any) => {

    const usernameDocRef = doc(userInfoCollectionRef, "username");
    const username = await getDoc(usernameDocRef);

    if (username.exists()) {
        const usernameData = username.data().username;
        return usernameData;
    }

    return null;
}

const getLanguage = async (userInfoCollectionRef: any) => {

    const languageDocRef = doc(userInfoCollectionRef, "language");
    const language = await getDoc(languageDocRef);

    if (language.exists()) {
        const languageData = language.data().language;
        return languageData;
    }

    return null;
}

const getStatistics = async (userInfoCollectionRef: any) => {

    const statisticsDocRef = doc(userInfoCollectionRef, "statistics");
    const statistics = await getDoc(statisticsDocRef);

    if (statistics.exists()) {
        const statisticsData = statistics.data();
        const statisticsArray = [
            { id: 'finishedWorkouts', value: statisticsData.finishedWorkouts },
            { id: 'weightLifted', value: statisticsData.weightLifted }
        ];
        
        const statisticsDataFormatted = JSON.stringify(statisticsArray);
        return statisticsDataFormatted;
    }

    return null;
}

// Does not retreive whole workout/s, just basic stuff to display
const getWorkouts = async (userDocRef: any) => {

    const workoutsCollectionRef = collection(userDocRef, "workouts");
    const workoutsSnapshot = await getDocs(workoutsCollectionRef);

    if (!workoutsSnapshot.empty) {
        const workoutsData = workoutsSnapshot.docs
            .map(doc => ({ 
                id: doc.id, 
                title: doc.data().title || "Error!", 
                created: doc.data().created,
                colour: doc.data().colour,
                folderId: doc.data().folderId || null,
                numberOfExercises: doc.data().numberOfExercises || 0
            }))
            .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

        return JSON.stringify(workoutsData);
    }

    return null;
}

// Does not retreive whole workout/s, just basic stuff to display
const getSavedWorkouts = async (userDocRef: any) => {

    const savedWorkoutsCollectionRef = collection(userDocRef, "saved_workouts");
    const savedWorkoutsSnapshot = await getDocs(savedWorkoutsCollectionRef);

    if (!savedWorkoutsSnapshot.empty) {
        const savedWorkoutsData = savedWorkoutsSnapshot.docs
            .map(doc => ({
                id: doc.id,
                title: doc.data().title || "Error!",
                created: doc.data().created,
                duration: doc.data().duration,
            }))
            .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

        return JSON.stringify(savedWorkoutsData);
    }

    return null;
}

const getFriends = async (userInfoCollectionRef: any) => {

    const friendsDocRef = doc(userInfoCollectionRef, "friends");
    const friendsListCollectionRef = collection(friendsDocRef, "list");
    const friendsSnapshot = await getDocs(friendsListCollectionRef);

    if (!friendsSnapshot.empty) {
        const friendsData = friendsSnapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    username: data.username || "Error!",
                };
            });

        return JSON.stringify(friendsData);
    }

    return null;
}

// Does not retreive whole food day/s, just basic stuff to display
const getFoodDays = async (userDocRef: any) => {

    const foodDaysCollectionRef = collection(userDocRef, "food_days");
    const foodDaysSnapshot = await getDocs(foodDaysCollectionRef);

    if (!foodDaysSnapshot.empty) {
        const foodDaysData = foodDaysSnapshot.docs
            .map(doc => {
                const data = doc.data() as any;
                const title = data.title || "Error!";
                const created = new Date(title); // Convert title to Date object

                return {
                    id: doc.id,
                    title,
                    calories: data.calories || "-",
                    protein: data.protein || "-",
                    carbs: data.carbs || "-",
                    fat: data.fat || "-",
                    created
                };
            })
            .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

        return JSON.stringify(foodDaysData);
    }

    return null;
}

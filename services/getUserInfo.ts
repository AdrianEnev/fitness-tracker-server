import { FIRESTORE_ADMIN } from '@config/firebaseConfig';
import { Timestamp } from 'firebase/firestore';

const getUserInfo = async (userId: string) => {
    
    const userDocRef = FIRESTORE_ADMIN.collection("users").doc(userId);
    const userInfoCollectionRef = userDocRef.collection("user_info");

    const userDocSnapshot = await userDocRef.get();

    console.log('Retrieving user info...');
    try {
        const username = await getUsername(userId);
        const dailyGoals = await getDailyGoals(userId);
        const language = await getLanguage(userInfoCollectionRef);
        const workouts = await getWorkouts(userDocRef);
        const savedWorkouts = await getSavedWorkouts(userDocRef);
        const foodDays = await getFoodDays(userDocRef);
        const friends = await getFriends(userInfoCollectionRef);
        const statistics = await getStatistics(userInfoCollectionRef);
        const dateRegistered = await getDateRegistered(userDocSnapshot);
        const isOnline = await getIsUserOnline(userDocSnapshot);

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
            isOnline
        };

    } catch (error) {
        console.error("Error retrieving user info:", error);
        return null;
    }
}

export default getUserInfo;

export const getUsername = async (userId: string) => {

    const userDocRef = FIRESTORE_ADMIN.collection("users").doc(userId);
    const userInfoCollectionRef = userDocRef.collection("user_info");
    const usernameDocRef = userInfoCollectionRef.doc("username");
    const username = await usernameDocRef.get();

    if (username.exists) {
        const usernameData = username.data()?.username;
        return usernameData;
    }

    return null;
}

export const getDailyGoals = async (userId: string) => {

    const userDocRef = FIRESTORE_ADMIN.collection("users").doc(userId);
    const userInfoCollectionRef = userDocRef.collection("user_info");
    const dailyGoalsDocRef = userInfoCollectionRef.doc("nutrients");
    const dailyGoals = await dailyGoalsDocRef.get();
    
    if (dailyGoals.exists) {
        const dailyGoalsData =  JSON.stringify(dailyGoals.data());
        return dailyGoalsData;
    }

    return null;
}

const getDateRegistered = async (userDocSnapshot: any) => {

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

const getIsUserOnline = async (userDocSnapshot: any) => {
    if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data() as any;
        const isUserOnline = userData?.isUserOnline;

        return isUserOnline;
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

const getLanguage = async (userInfoCollectionRef: any) => {

    const languageDocRef = userInfoCollectionRef.doc("language");
    const language = await languageDocRef.get();

    if (language.exists()) {
        const languageData = language.data()?.language;
        return languageData;
    }

    return null;
}

const getStatistics = async (userInfoCollectionRef: any) => {

    const statisticsDocRef = userInfoCollectionRef.doc("statistics");
    const statistics = await statisticsDocRef.get();

    if (statistics.exists()) {
        const statisticsData = statistics.data();
        const statisticsArray = [
            { id: 'finishedWorkouts', value: statisticsData?.finishedWorkouts },
            { id: 'weightLifted', value: statisticsData?.weightLifted }
        ];
        
        const statisticsDataFormatted = JSON.stringify(statisticsArray);
        return statisticsDataFormatted;
    }

    return null;
}

// Does not retrieve whole workout/s, just basic stuff to display
const getWorkouts = async (userDocRef: any) => {

    const workoutsCollectionRef = userDocRef.collection("workouts");
    const workoutsSnapshot = await workoutsCollectionRef.get();

    if (!workoutsSnapshot.empty) {
        const workoutsData = workoutsSnapshot.docs
            .map((doc: { id: any; data: () => { (): any; new(): any; title: any; created: any; colour: any; folderId: any; numberOfExercises: any; }; }) => ({ 
                id: doc.id, 
                title: doc.data().title || "Error!", 
                created: doc.data().created,
                colour: doc.data().colour,
                folderId: doc.data().folderId || null,
                numberOfExercises: doc.data().numberOfExercises || 0
            }))
            .sort((a: { created: string | number | Date; }, b: { created: string | number | Date; }) => new Date(b.created).getTime() - new Date(a.created).getTime());

        return JSON.stringify(workoutsData);
    }

    return null;
}

// Does not retrieve whole workout/s, just basic stuff to display
const getSavedWorkouts = async (userDocRef: any) => {

    const savedWorkoutsCollectionRef = userDocRef.collection("saved_workouts");
    const savedWorkoutsSnapshot = await savedWorkoutsCollectionRef.get();

    if (!savedWorkoutsSnapshot.empty) {
        const savedWorkoutsData = savedWorkoutsSnapshot.docs
            .map((doc: { id: any; data: () => { (): any; new(): any; title: any; created: any; duration: any; }; }) => ({
                id: doc.id,
                title: doc.data().title || "Error!",
                created: doc.data().created,
                duration: doc.data().duration,
            }))
            .sort((a: { created: string | number | Date; }, b: { created: string | number | Date; }) => new Date(b.created).getTime() - new Date(a.created).getTime());

        return JSON.stringify(savedWorkoutsData);
    }

    return null;
}

const getFriends = async (userInfoCollectionRef: any) => {

    const friendsDocRef = userInfoCollectionRef.doc("friends");
    const friendsListCollectionRef = friendsDocRef.collection("list");
    const friendsSnapshot = await friendsListCollectionRef.get();

    if (!friendsSnapshot.empty) {
        const friendsData = friendsSnapshot.docs
            .map((doc: { data: () => any; id: any; }) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    username: data?.username || "Error!",
                };
            });

        return JSON.stringify(friendsData);
    }

    return null;
}

// Does not retrieve whole food day/s, just basic stuff to display
const getFoodDays = async (userDocRef: any) => {

    const foodDaysCollectionRef = userDocRef.collection("food_days");
    const foodDaysSnapshot = await foodDaysCollectionRef.get();

    if (!foodDaysSnapshot.empty) {
        const foodDaysData = foodDaysSnapshot.docs
            .map((doc: { data: () => any; id: any; }) => {
                const data = doc.data() as any;
                const title = data?.title || "Error!";
                const created = new Date(title); // Convert title to Date object

                return {
                    id: doc.id,
                    title,
                    calories: data?.calories || "-",
                    protein: data?.protein || "-",
                    carbs: data?.carbs || "-",
                    fat: data?.fat || "-",
                    created
                };
            })
            .sort((a: { created: string | number | Date; }, b: { created: string | number | Date; }) => new Date(b.created).getTime() - new Date(a.created).getTime());

        return JSON.stringify(foodDaysData);
    }

    return null;
}

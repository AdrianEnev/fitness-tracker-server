import { getDailyGoals, getUsername } from "@services/getUserInfo";

// Gets user/s firebase username and daily goals (nutrients)
// Used to check if the setup has been ran when logging in and to sync the local username
// Since a user must have an internet connection before registering or updating their username
// , the most accurate way to get the username is from firebase. This is used as a safety-check
// to ensure the user does not log in without an username saved locally
const loginUser = async (userId: string) => {
    const firebaseUsername = await getUsername(userId) || null;
    const firebaseNutrients = await getDailyGoals(userId) || null;
    return { username: firebaseUsername, nutrients: firebaseNutrients };
}

export default loginUser;
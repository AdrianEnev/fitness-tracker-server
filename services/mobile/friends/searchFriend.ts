import { FIRESTORE_ADMIN } from "@config/firebaseConfig";

// Used to check if similar users exist anywhere in the database
// Ex: search - john -> results "john123", "john1234", "john12345" etc.
const searchForFriend = async (search: string): Promise<{id: string, username: string}[]> => {
    
    const usersSnapshot = await FIRESTORE_ADMIN.collection('users').get();
    const users: {id: string, username: string}[] = [];

    for (const userDoc of usersSnapshot.docs) {
        const usernameDocRef = FIRESTORE_ADMIN.doc(`users/${userDoc.id}/user_info/username`);
        const usernameDoc = await usernameDocRef.get();
        const usernameData = usernameDoc.data();

        if (
            usernameDoc.exists &&
            usernameData &&
            typeof usernameData.username === "string" &&
            usernameData.username.toLowerCase().includes(search.toLowerCase())
        ) {
            console.log(`Suggestions found: ${usernameData.username}`);
            users.push({ id: userDoc.id, username: usernameData.username });
        }
    }

    return users;
};

export default searchForFriend;
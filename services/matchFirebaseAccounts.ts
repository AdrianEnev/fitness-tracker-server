import { FIREBASE_ADMIN } from "../config/firebaseConfig";

// Function to list all users and store emails
const getFirebaseAccounts = async (nextPageToken?: string, collectedEmails: string[] = []): Promise<string[]> => {
    
    console.log("Attempting to retrieve Firebase user emails...");

    try {
        const FIREBASE_ADMIN_AUTH = FIREBASE_ADMIN.auth();
        const listUsersResult = await FIREBASE_ADMIN_AUTH.listUsers(1000, nextPageToken);

        // Collect emails from the current batch
        listUsersResult.users.forEach((userRecord) => {
            if (userRecord.email) {
                collectedEmails.push(userRecord.email);
            }
        });

        // If there's another page, recursively get more users
        if (listUsersResult.pageToken) {
            return getFirebaseAccounts(listUsersResult.pageToken, collectedEmails);
        }

        console.log('User emails successfully retrieved:', collectedEmails);
        return collectedEmails;
    } catch (error) {
        console.error('Error retrieving Firebase user emails:', error);
        return [];
    }
};

// Compares asyncstorage to firebase, returns emails that are missing in firebase but exist in asyncstorage
const matchFirebaseAccounts = async (asyncStorageEmails: string[]): Promise<string[] | null> => {

    try {
        const firebaseAccounts = await getFirebaseAccounts();
        
        if (!firebaseAccounts.length) {
            return null;
        }

        // Find missing accounts
        const missingAccounts = asyncStorageEmails.filter(email => !firebaseAccounts.includes(email));

        return missingAccounts;

    } catch (error) {
        console.error('Error matching Firebase accounts:', error);
        return null;
    }
};

export default matchFirebaseAccounts;

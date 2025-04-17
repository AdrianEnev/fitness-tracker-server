import admin from 'firebase-admin';
import InternalError from "@custom_errors/InternalError";
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';
import getProfilePicture from './getProfilePicture';

const deleteAccount = async (userId: any, verified: boolean) => {

    console.log("Deleting account...");
    await deleteUserAccount(userId);
    await deleteUserInfo(userId, verified);
    console.log("Account deleted successfully!");

}

// Checks if profile picture exists and deletes it
async function deleteProfilePicture(userId: string) {
    
    const file = await getProfilePicture(userId);
    if (!file) {
        console.log('No profile picture to delete!')
        return;
    }

    try {
        await file.delete();
        console.log("Profile picture deleted successfully");
    } catch (error) {
        throw new InternalError("Error deleting profile picture");
    }
}

const deleteUserAccount = async (userId: string) => {

    try {
        await admin.auth().deleteUser(userId);
        console.log('User deleted successfully');
    } catch (err) {
        console.error(err)
        throw new InternalError('Error deleting user:');
    }
}

// user verified -> Deletes user doc + all info related to user like workouts, food logged, statistics and so on
const deleteUserInfo = async (userId: string, verified: boolean) => {

    const userDocRef = FIRESTORE_ADMIN.doc(`users/${userId}`);

    try {
        await userDocRef.delete();
    } catch (error) {
        throw new InternalError('Error deleting user document');
    }

    // User deleted account before verifying email
    // no other data has been created yet
    if (!verified){
        return;
    }

    const usersCollectionRef = admin.firestore().collection('users');

    await deleteProfilePicture(userId);
    await changeFriendsUsername(userId, usersCollectionRef);
    await removeReceivedRequests(userId, usersCollectionRef);
    await deleteSubDirectories(userId);
}

// Function to change the username of the user to "Deleted User" in friends' lists
const changeFriendsUsername = async (userToDeleteId: any, usersCollectionRef: any) => {

    const snapshot = await usersCollectionRef.get();
    if (snapshot.empty) {
        return;
    }

    for (const doc of snapshot.docs as FirebaseFirestore.DocumentSnapshot[]) {
        const otherUserId = doc.id;
        const userFriendsCollectionRef = FIRESTORE_ADMIN.collection('users').doc(otherUserId).collection('user_info').doc('friends').collection('list');
        const qSnapshot = await userFriendsCollectionRef.where('id', '==', userToDeleteId).get();
        for (const friendDoc of qSnapshot.docs as FirebaseFirestore.DocumentSnapshot[]) {
            const deletedUserName = "Deleted User" + Math.floor(Math.random() * 100000);
            await friendDoc.ref.update({ username: deletedUserName });
        }
    }
}

// Function to remove received friend requests for the user
const removeReceivedRequests = async (userToDeleteId: any, usersCollectionRef: any) => {
    const snapshot = await usersCollectionRef.get();
    if (snapshot.empty) {
        console.log("No users found.");
        return;
    }
    console.log(`Found ${snapshot.size} users.`);
    await Promise.all((snapshot.docs as FirebaseFirestore.DocumentSnapshot[]).map(async (docSnapshot) => {
        const otherUserId = docSnapshot.id;
        console.log(`Processing user with ID: ${otherUserId}`);
        const ReceivedRequestsDocRef = usersCollectionRef.doc(otherUserId).collection('user_info').doc('friendRequests').collection('received').doc(userToDeleteId);
        const friendRequestDocSnapshot = await ReceivedRequestsDocRef.get();
        if (friendRequestDocSnapshot.exists) {
            console.log(`Found friend request for user with ID: ${userToDeleteId}`);
            await ReceivedRequestsDocRef.delete();
        } else {
            console.log(`No friend request found for user with ID: ${userToDeleteId}`);
        }
    }));
}

// Recursively deletes a collection and all subcollections based on provided document reference
const deleteCollectionRecursively = async (docRef: FirebaseFirestore.DocumentReference) => {
    const subcollections = await docRef.listCollections();

    for (const subcollection of subcollections) {
        const subDocs = await subcollection.listDocuments();
        for (const subDoc of subDocs) {
            await deleteCollectionRecursively(subDoc);
            await subDoc.delete();
        }
    }
};

// Deletes all subcollections and nested data for a user
// This includes food days, workouts, saved workouts, and user info
// No errors would be thrown if document does not exist (default firestore behavior)
const deleteSubDirectories = async (userId: string) => {

    console.log('Deleting subdirectories! This might take a while...');

    try {
        const userRef = FIRESTORE_ADMIN.collection('users').doc(userId);

        /** ───── WORKOUTS ───── **/
        const workoutsDocs = await userRef.listCollections();
        const workoutDocCandidates = workoutsDocs.filter(col => col.id !== 'food_days' && col.id !== 'saved_workouts' && col.id !== 'user_info');

        for (const workoutDoc of workoutDocCandidates) {
            const docs = await workoutDoc.listDocuments();
            for (const doc of docs) {
                const infoCol = doc.collection('info');
                const infoDocs = await infoCol.listDocuments();

                for (const infoDoc of infoDocs) {
                    const setsCol = infoDoc.collection('sets');
                    const setDocs = await setsCol.listDocuments();
                    await Promise.all(setDocs.map(setDoc => setDoc.delete()));
                    await infoDoc.delete();
                }

                await doc.delete(); // Delete workout doc
            }
        }

        /** ───── SAVED WORKOUTS ───── **/
        const savedWorkoutsRef = userRef.collection('saved_workouts');
        const savedWorkoutDocs = await savedWorkoutsRef.listDocuments();

        for (const savedWorkoutDoc of savedWorkoutDocs) {
            const infoCol = savedWorkoutDoc.collection('info');
            const infoDocs = await infoCol.listDocuments();

            for (const infoDoc of infoDocs) {
                const setsCol = infoDoc.collection('sets');
                const setDocs = await setsCol.listDocuments();
                await Promise.all(setDocs.map(setDoc => setDoc.delete()));
                await infoDoc.delete();
            }

            await savedWorkoutDoc.delete();
        }

        /** ───── FOOD DAYS ───── **/
        const foodDaysRef = userRef.collection('food_days');
        const foodDaysDocs = await foodDaysRef.listDocuments();

        for (const dateDoc of foodDaysDocs) {
            const foodsRef = dateDoc.collection('foods');
            const foodDocs = await foodsRef.listDocuments();
            await Promise.all(foodDocs.map(doc => doc.delete()));
            await dateDoc.delete(); // Delete the date doc after its foods
        }

        /** ───── USER INFO ───── **/
        const userInfoRef = userRef.collection('user_info');
        const userInfoDocs = await userInfoRef.listDocuments();

        for (const doc of userInfoDocs) {
            await deleteCollectionRecursively(doc);
            await doc.delete();
        }

        console.log(`All subcollections and nested data for user ${userId} deleted successfully.`);
    } catch (error) {
        console.error("Error deleting subcollections:", error);
        throw new InternalError("Failed to delete user subcollections");
    }
};

export default deleteAccount;
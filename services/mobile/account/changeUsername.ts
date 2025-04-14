import InternalError from '@custom_errors/InternalError';
import checkUsernameNSFW from '@services/models/checkUsernameNSFW';
import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const changeUsername = async (username: string, newUsername: string, userId: string) => {
    console.log('Attempting to change username for user', userId);

    const userDocRef = FIRESTORE_ADMIN.collection('users').doc(userId);
    const userInfoCollectionRef = userDocRef.collection('user_info');
    const usernameDocRef = userInfoCollectionRef.doc('username');

    // Get the date and calculate difference
    const usernameDoc = await usernameDocRef.get();
    const usernameData = usernameDoc.data();
    const date = usernameData?.date?.toDate();
    const currentDate = new Date();
    const difference = currentDate.getTime() - (date?.getTime() || 0);
    const daysDifference = difference / (1000 * 3600 * 24);

    if (daysDifference < 7) {
        console.log('Cooldown reached');
        return 'cooldown' + (7 - Math.floor(daysDifference));
    }

    if (newUsername) {
        try {
            if (await checkUsernameNSFW(newUsername)) {
                console.log('username is nsfw');
                return 'nsfw-username';
            }
        } catch (error: any) {
            if (error?.error?.includes('Model facebook/bart-large-mnli is currently loading')) {
                console.log('model is still loading');
                return 'error';
            }
        }

        if (newUsername.length <= 2) {
            console.log('username is too short');
            return 'username-at-least-three-symbols';
        }

        if (newUsername === username) {
            console.log('new username same as old one');
            return 'new username same as old one';
        }

        const weirdCharPattern = /[^a-zA-Z0-9@#$£€%^&*()"'-/|.,?![\]{}+=_~<>¥]/;
        if (weirdCharPattern.test(newUsername)) {
            console.log('username has weird characters');
            return 'username-no-emojis';
        }

        let isUsernameTaken = false;

        const usersSnapshot = await FIRESTORE_ADMIN.collection('users').get();
        for (const userDoc of usersSnapshot.docs) {
            const userInfoCollectionRef = userDoc.ref.collection('user_info');
            const usernameDoc = await userInfoCollectionRef.doc('username').get();
            if (usernameDoc.exists && usernameDoc.data()?.username?.trim() === newUsername) {
                isUsernameTaken = true;
                break;
            }
        }

        if (isUsernameTaken) return 'username-taken';

        try {
            await userInfoCollectionRef.doc('username').set({
                username: newUsername,
                date: new Date(),
            });

            await changeUsernameForFriends(userId, newUsername);
        } catch (error: any) {
            throw new InternalError(error.message);
        }
    }
};

const changeUsernameForFriends = async (currentUserID: string, newUsername: string) => {
    try {
        const usersSnapshot = await FIRESTORE_ADMIN.collection('users').get();
        const batch = FIRESTORE_ADMIN.batch();

        for (const userDoc of usersSnapshot.docs) {
            const userInfoCollectionRef = userDoc.ref.collection('user_info');
            const friendsDocRef = userInfoCollectionRef.doc('friends');
            const friendDocRef = friendsDocRef.collection('list').doc(currentUserID);

            const friendDocSnapshot = await friendDocRef.get();

            if (friendDocSnapshot.exists) {
                batch.update(friendDocRef, { username: newUsername });
            }
        }

        await batch.commit();
        console.log('Successfully updated username for friends');
    } catch (error: any) {
        throw new InternalError(error.message);
    }
};

export default changeUsername;

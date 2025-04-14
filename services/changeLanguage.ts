import InternalError from "@custom_errors/InternalError";

import { FIRESTORE_ADMIN } from '@config/firebaseConfig';

const changeLanguage = async (language: string, userId: string) => {
    console.log('Attempting to change language to:', language);

    try {
        const userDocRef = FIRESTORE_ADMIN.collection('users').doc(userId);
        const userInfoCollectionRef = userDocRef.collection('user_info');
        const userLanguageDocRef = userInfoCollectionRef.doc('language');

        await userLanguageDocRef.set({ language: language });
        console.log('Language successfully changed to:', language);
    } catch (err) {
        throw new InternalError('Error changing language!');
    }
}

export default changeLanguage;

import { collection, doc, setDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../config/firebaseConfig";
import InternalError from "../errors/custom_errors/InternalError";

const changeLanguage = async (language: string, userId: string) => {

    console.log('Attempting to change language to:', language);

    try {
        const usersCollectionRef = collection(FIRESTORE_DB, 'users');
        const userDocRef = doc(usersCollectionRef, userId);
        const userInfoCollectionRef = collection(userDocRef, 'user_info');
        const userLanguageDocRef = doc(userInfoCollectionRef, 'language');

        setDoc(userLanguageDocRef, { language: language });
        console.log('Language successfuly changed to:', language);
    }catch(err) {
        throw new InternalError('Error changing language!');
    }

}

export default changeLanguage;
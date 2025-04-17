import { FIREBASE_ADMIN } from "@config/firebaseConfig";
import InternalError from "@custom_errors/InternalError";

const getProfilePicture = async (userId: string) => {
    
    const bucket = FIREBASE_ADMIN.storage().bucket();
    const filePath = `users/${userId}/profile_picture`;
    const file = bucket.file(filePath);

    try {
        // Check if the file exists
        const [exists] = await file.exists();
        if (!exists) {
            console.log("No profile picture found, skipping deletion.");
            return;
        }
    } catch (error: any) {
        throw new InternalError("Error checking for profile picture existence");
    }

    return file;

}

export default getProfilePicture;
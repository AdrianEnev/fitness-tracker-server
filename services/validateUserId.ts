import BadRequestError from "@custom_errors/BadRequestError";

const isValidFirebaseUid = (uid: string): boolean => {
    const firebaseIdRegex = /^[a-zA-Z0-9_-]{28}$/;
    return firebaseIdRegex.test(uid);
  };

const validateUserId = async (userId: string) => {

    if (!userId) {
        throw new BadRequestError('Missing user id');;
    }

    if (!isValidFirebaseUid(userId)) {
        throw new BadRequestError('Invalid user id format');
    }

}

export default validateUserId;
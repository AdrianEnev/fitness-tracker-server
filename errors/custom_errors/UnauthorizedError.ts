import { ErrorCodes } from "../ErrorCodes";
import CustomError from "../CustomError";

// 401 - used when a user tries to access a resource without being logged in or providing the necessary credentials
class UnauthorizedError extends CustomError<typeof ErrorCodes.ERR_UNAUTHORIZED> {

    constructor(message: string) {
        super({
            message, // Message passed from router
            statusCode: 401, // HTTP status code for "Unauthorized"
            code: ErrorCodes.ERR_UNAUTHORIZED, // Specific error code for "Unauthorized"
        });
    }
}

export default UnauthorizedError;

import { ErrorCodes } from "../ErrorCodes";
import CustomError from "../CustomError";

// 403 - Indicates that the request was valid, but the authenticated user does not have permission to perform the requested action on the resource.
class ForbiddenError extends CustomError<typeof ErrorCodes.ERR_FORBIDDEN> {

    constructor(message: string) {
        super({
            message, // Message passed from router
            statusCode: 403, // HTTP status code for "Forbidden"
            code: ErrorCodes.ERR_FORBIDDEN, // Specific error code for "Forbidden"
        });
    }
}

export default ForbiddenError;

import { ErrorCodes } from "../ErrorCodes";
import CustomError from "../CustomError";

// 400 - The request is malformed or invalid in some way that prevents the server from processing it. This is often due to the structure or format of the request.
// Summary: Correct DATA but missing required fields or is incorrectly formatted
// (e.g., invalid data types, wrong format for dates, or missing required parameters).
class BadRequestError extends CustomError<typeof ErrorCodes.ERR_BAD_REQUEST> {
    
    constructor(message: string) {
        super({
            message, // Message passed from router
            statusCode: 400, // HTTP status code for "Bad Request"
            code: ErrorCodes.ERR_BAD_REQUEST, // Specific error code for "Bad Request"
        });
    }
}

export default BadRequestError;

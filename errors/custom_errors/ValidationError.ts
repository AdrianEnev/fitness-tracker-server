import { ErrorCodes } from "../ErrorCodes";
import CustomError from "../CustomError";

// 422 - Represents a validation error, meaning the server understands the request, but the data provided is invalid or incomplete.
// Summary - Correct FORMAt but DATA fails validation checks
// (e.g., an email address is invalid, a password is too short, or a date is in the wrong format).
class ValidationError extends CustomError<typeof ErrorCodes.ERR_VALID> {

    constructor(message: string) {
        super({
            message, // Message passed from router
            statusCode: 422, // HTTP status code for "Unprocessable Entity" (Validation error)
            code: ErrorCodes.ERR_VALID, // Specific error code for "Unprocessable Entity" (Validation error)
        });
    }
}

export default ValidationError;

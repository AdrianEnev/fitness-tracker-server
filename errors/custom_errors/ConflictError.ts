import { ErrorCodes } from "../ErrorCodes";
import CustomError from "../CustomError";

// 409 -  Indicates that there is a conflict with the current state of the server (often caused by duplicate data or conflicting resource states).
// often used when attempting to create a resource that already exists, or a request that conflicts with an existing resource's state.
// Example: Trying to register a user with an email address that's already taken.
class ConflictError extends CustomError<typeof ErrorCodes.ERR_CONFLICT> {
    
    constructor(message: string) {
        super({
            message, // Message passed from router
            statusCode: 409, // HTTP status code for "Conflict"
            code: ErrorCodes.ERR_CONFLICT, // Specific error code for "Conflict"
        });
    }
}

export default ConflictError;

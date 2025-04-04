import { ErrorCodes } from "../ErrorCodes";
import CustomError from "../CustomError";

// 404 - data not found
class EntityNotFoundError extends CustomError<typeof ErrorCodes.ERR_NOT_FOUND> {

    constructor(message: string) {
        super({
            message, // Message passed from router
            statusCode: 404, // HTTP status code for "Not Found"
            code: ErrorCodes.ERR_NOT_FOUND, // Specific error code for "Entity Not Found"
        });
    }
}

export default EntityNotFoundError;

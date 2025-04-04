import { ErrorCodes } from "../ErrorCodes";
import CustomError from "../CustomError";

// 500 -  Represents an internal server error. This is a catch-all for unexpected conditions or failures on the server side that prevent it from fulfilling the request
// indicates something went wrong on the server, usually due to a bug, failed database query, etc.
class InternalError extends CustomError<typeof ErrorCodes.ERR_INTERNAL> {

    constructor(message: string) {
        super({
            message, // Message passed from router
            statusCode: 500, // HTTP status code for "Internal Error"
            code: ErrorCodes.ERR_INTERNAL, // Specific error code for "Internal Error"
        });
    }
}

export default InternalError;

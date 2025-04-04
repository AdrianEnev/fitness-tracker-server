import { ErrorCode } from "./types";

class CustomError<C extends ErrorCode> extends Error {

    message!: string;  // Declare message, but assert it will be assigned
    statusCode: number;
    code?: C;

    constructor({
        message,
        statusCode,
        code,
    }: {
        message: string;
        statusCode: number;
        code?: C;
    }) {
        super(message);
        this.message = message; // Assign message explicitly
        this.statusCode = statusCode;
        this.code = code;

        // Set prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export default CustomError;

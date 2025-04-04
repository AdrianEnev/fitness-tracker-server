import { NextFunction, Request, Response } from "express";
import { getErrorMessage } from "../utils/getErrorMessage";
import serverConfig from "../config/serverConfig";
import CustomError from "../errors/CustomError";

export default function errorHandler(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (res.headersSent || serverConfig.debug) {
        next(error);
        return;
    }
  
    if (error instanceof CustomError) {
        res.status(error.statusCode).json({
            error: {
                message: error.message,
                code: error.code,
            },
        });
    return;
    }
  
    res.status(500).json({
        error: {
            message:
                getErrorMessage(error) ||
                "An error occurred. Please view logs for more details",
        },
    });
  }
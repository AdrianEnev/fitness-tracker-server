import serverConfig from "@config/serverConfig";

export function getErrorMessage(error: unknown): string {

    if (serverConfig.debug && error instanceof Error) {
        return `${error.message}\n${error.stack}`;
    }

    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    if (typeof error === "string") {
        return error;
    }

    return "An error occurred";
}
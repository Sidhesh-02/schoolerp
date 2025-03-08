const { PrismaClientKnownRequestError } = require("@prisma/client/runtime/library");

const prismaErrorHandler = (error) => {
    if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                error = { message: "Record Already Exist", statusCode: 409 };
                break;
            case "P2003":
                error = { message: "Foreign key constraint failed", statusCode: 400 };
                break;
            case "P2001":
                error = { message: "Record not found", statusCode: 404 };
                break;
            case "P2025":
                error = { message: "Record to update/delete does not exist", statusCode: 404 };
                break;
            case "P2012":
                error = { message: "Missing required field", statusCode: 400 };
                break;
            case "P1001":
                error = { message: "Database connection timeout", statusCode: 503 };
                break;
            case "P1008":
                error = { message: "Database operation timed out", statusCode: 504 };
                break;
            case "P2024":
                error = { message: "Database connection limit exceeded", statusCode: 503 };
                break;
            default:
                error = { message: "Internal Server Error", statusCode: 500 };
                break;
        }
    }
    return error;
};

module.exports = prismaErrorHandler;

namespace MC.Shared.Application.Common;

public enum ErrorCode
{
    ValidationFailed = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    Conflict = 409,
    InternalServerError = 500
}

using Microsoft.AspNetCore.Http;

namespace MC.Catalog.Application.Common;

public enum ErrorCode
{
    ValidationFailed = StatusCodes.Status400BadRequest,
    NotFound = StatusCodes.Status404NotFound,
    Conflict = StatusCodes.Status409Conflict,
    InternalServerError = StatusCodes.Status500InternalServerError
}

using Microsoft.AspNetCore.Http;

namespace WebStoreProduct.Application.Common;

public enum ErrorCode
{
    ValidationFailed = StatusCodes.Status400BadRequest,
    NotFound = StatusCodes.Status404NotFound,
    Conflict = StatusCodes.Status409Conflict
}

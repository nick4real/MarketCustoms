using MC.Shared.Application.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MC.Shared.API.Controllers;

public class CustomController : ControllerBase
{
    protected IActionResult HandleResult(Result result)
    {
        if (result.IsSuccess) return Ok();

        if (result.Error == null)
            return StatusCode(StatusCodes.Status500InternalServerError, "Unknown error.");

        return result.Error.Code switch
        {
            ErrorCode.ValidationFailed => BadRequest(result.Error),
            ErrorCode.Unauthorized => Unauthorized(result.Error),
            ErrorCode.Forbidden => StatusCode(StatusCodes.Status403Forbidden, result.Error),
            ErrorCode.NotFound => NotFound(result.Error),
            ErrorCode.Conflict => Conflict(result.Error),
            _ => StatusCode(StatusCodes.Status500InternalServerError, "Unknown error.")
        };
    }

    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess) return Ok(result.Value);

        if (result.Error == null)
            return StatusCode(StatusCodes.Status500InternalServerError, "Unknown error.");

        return result.Error.Code switch
        {
            ErrorCode.ValidationFailed => BadRequest(result.Error),
            ErrorCode.Unauthorized => Unauthorized(result.Error),
            ErrorCode.Forbidden => StatusCode(StatusCodes.Status403Forbidden, result.Error),
            ErrorCode.NotFound => NotFound(result.Error),
            ErrorCode.Conflict => Conflict(result.Error),
            _ => StatusCode(StatusCodes.Status500InternalServerError, "Unknown error.")
        };
    }
}

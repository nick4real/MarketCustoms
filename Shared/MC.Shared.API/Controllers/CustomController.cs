using MC.Shared.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MC.Shared.API.Controllers;

public class CustomController : ControllerBase
{
    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess) return Ok(result.Value);

        return result.Error!.Code switch
        {
            ErrorCode.ValidationFailed => BadRequest(result.Error),
            ErrorCode.NotFound => NotFound(result.Error),
            ErrorCode.Conflict => Conflict(result.Error),
            _ => StatusCode(StatusCodes.Status500InternalServerError, "Unknown error.")
        };
    }
}

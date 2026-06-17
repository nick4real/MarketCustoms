using Microsoft.AspNetCore.Mvc;
using MC.Catalog.Application.Common;

namespace MC.Catalog.API.Controllers;

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

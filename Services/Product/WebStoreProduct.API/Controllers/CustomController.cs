using Microsoft.AspNetCore.Mvc;
using WebStoreProduct.Application.Common;

namespace WebStoreProduct.API.Controllers;

public class CustomController : ControllerBase
{
    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess) return Ok(result.Value);

        return result.Error!.Code switch
        {
            ErrorCode.ValidationFailed => BadRequest(result.Error),
            ErrorCode.NotFound => NotFound(result.Error),
            ErrorCode.Conflict => BadRequest(result.Error),
            _ => StatusCode(StatusCodes.Status500InternalServerError, "Unknown error.")
        };
    }
}

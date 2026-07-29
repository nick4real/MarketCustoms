using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MC.Profiles.API.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class ProfilesController : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        // Implementation here
        return Ok();
    }
}

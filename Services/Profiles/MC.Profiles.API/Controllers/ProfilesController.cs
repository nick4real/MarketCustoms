using MC.Shared.API.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MC.Profiles.API.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class ProfilesController : CustomController
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        // Implementation here
        return Ok();
    }
}

using MC.Shared.API.Controllers;
using MC.Shared.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MC.Profiles.API.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class ProfilesController(ICurrentUserService currentUserService) : CustomController
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        object[] test =
        {
            currentUserService.TenantId,
            currentUserService.UserId,
            currentUserService.Email,
            currentUserService.IsAuthenticated
        };
        // Implementation here
        return Ok(test);
    }
}

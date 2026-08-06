using MC.Profiles.Application.Interfaces.Services;
using MC.Shared.API.Controllers;
using MC.Shared.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MC.Profiles.API.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class ProfilesController(IProfileService profileService) : CustomController
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var result = await profileService.GetMe(ct);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProfile(CancellationToken ct, Guid id)
    {
        var result = await profileService.GetProfileInfo(ct, id);
        return HandleResult(result);
    }
}

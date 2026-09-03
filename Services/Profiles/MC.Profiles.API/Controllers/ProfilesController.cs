using MC.Profiles.Application.Interfaces.Services;
using MC.Profiles.Application.Requests;
using MC.Shared.API.Controllers;
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

    // TODO
    [HttpPost("me/clarify-account-type")]
    public async Task<IActionResult> ClarifyAccountType(
        [FromBody] ClarifyAccountTypeRequest request,
        CancellationToken ct)
    {
        var result = await profileService.ClarifyAccountType(request, ct);
        return HandleResult(result);
    }

    [HttpPost("me/current-user-metadata")]
    public async Task<IActionResult> GetAndEnsureCurrentUserMetadata(CurrentUserMetadataRequest request, CancellationToken ct)
    {
        var result = await profileService.GetAndEnsureCurrentUserProfile(request, ct);
        return HandleResult(result);
    }

    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProfile(CancellationToken ct, Guid id)
    {
        var result = await profileService.GetProfileInfo(ct, id);
        return HandleResult(result);
    }
}

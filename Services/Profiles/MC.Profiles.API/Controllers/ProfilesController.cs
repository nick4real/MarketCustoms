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

    [HttpPost("me")]
    public async Task<IActionResult> CompleteClarification(
        [FromBody] CompleteClarificationRequest request,
        CancellationToken ct)
    {
        var result = await profileService.CompleteClarification(request, ct);
        return HandleResult(result);
    }

    [HttpPost("me/seller-applications")]
    public async Task<IActionResult> SubmitSellerApplication(
        [FromBody] SubmitSellerApplicationRequest request,
        CancellationToken ct)
    {
        var result = await profileService.SubmitSellerApplication(request, ct);
        return HandleResult(result);
    }

    [HttpGet("me/seller")]
    public async Task<IActionResult> GetMySellerStatus(CancellationToken ct)
    {
        var result = await profileService.GetMySellerStatus(ct);
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

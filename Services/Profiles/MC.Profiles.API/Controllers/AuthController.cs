using Microsoft.AspNetCore.Mvc;
using WebStoreUser.Application.Interfaces.Services;
using WebStoreUser.Application.Requests;

namespace WebStoreUser.API.Controllers;

[Route("[controller]")]
[ApiController]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegisterRequest request, CancellationToken ct)
    {
        var isSuccess = await authService.RegisterAsync(request, ct);
        if (!isSuccess)
            return BadRequest("User already exists");

        return NoContent();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginRequest request, CancellationToken ct)
    {
        var result = await authService.LoginAsync(request, ct);
        if (result == null)
            return BadRequest("Invalid credentials");

        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request, CancellationToken ct)
    {
        var result = await authService.RefreshAsync(request, ct);
        if (result == null)
            return Unauthorized("Invalid refresh token");

        return Ok(result);
    }
}

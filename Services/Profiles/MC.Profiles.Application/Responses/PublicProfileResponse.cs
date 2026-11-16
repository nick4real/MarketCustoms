namespace MC.Profiles.Application.Responses;

public record PublicProfileResponse(
    Guid Id,
    string DisplayName,
    string? PictureUrl,
    string? Bio,
    bool IsSeller);

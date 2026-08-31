namespace MC.Profiles.Application.Responses;

public record PublicProfileResponse(
    Guid Id,
    string DisplayName,
    string? Bio,
    bool IsSeller);

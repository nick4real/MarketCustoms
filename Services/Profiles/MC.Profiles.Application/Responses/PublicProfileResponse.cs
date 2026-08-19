namespace MC.Profiles.Application.Responses;

public record PublicProfileResponse(
    Guid Id,
    string DisplayName,
    string? ShopName,
    string? Bio,
    bool IsSeller);

namespace MC.Profiles.Application.Responses;

public record OwnerProfileResponse(
    bool ProfileExists,
    bool IsVerified,
    bool IsSeller,
    Guid Id,
    string DisplayName,
    string Email,
    string PhoneNumber);

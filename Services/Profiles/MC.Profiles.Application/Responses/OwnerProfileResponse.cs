namespace MC.Profiles.Application.Responses;

public record OwnerProfileResponse(
    bool ProfileExists,
    bool IsVerified,
    bool IsSeller,
    Guid Id,
    string DisplayName,
    string Email,
    string PhoneNumber,
    bool EmailAttestedByIdentity,
    bool PhoneAttestedByIdentity)
{
    public static OwnerProfileResponse Missing() => new(
        ProfileExists: false,
        IsVerified: false,
        IsSeller: false,
        Id: Guid.Empty,
        DisplayName: string.Empty,
        Email: string.Empty,
        PhoneNumber: string.Empty,
        EmailAttestedByIdentity: false,
        PhoneAttestedByIdentity: false);
}

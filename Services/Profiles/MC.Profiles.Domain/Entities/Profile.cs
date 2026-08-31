using MC.Profiles.Domain.Common;
using MC.Profiles.Domain.Enums;

namespace MC.Profiles.Domain.Entities;

public class Profile : BaseEntity<Guid>
{
    public string ExternalUserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Bio { get; set; }
    public AccountType AccountType { get; set; } = AccountType.Basic;
    public bool IsPhonePublic { get; set; } = false;
    public bool IsEmailPublic { get; set; } = false;
    public bool IsVerified { get; set; }
    public bool EmailAttestedByIdentity { get; set; }
    public bool PhoneAttestedByIdentity { get; set; }
}

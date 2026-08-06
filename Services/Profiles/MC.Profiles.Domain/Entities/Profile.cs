using MC.Profiles.Domain.Common;

namespace MC.Profiles.Domain.Entities;

public class Profile : BaseEntity<Guid>
{
    public string ExternalUserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public bool IsPhonePublic { get; set; } = false;
    public bool IsEmailPublic { get; set; } = false;
}

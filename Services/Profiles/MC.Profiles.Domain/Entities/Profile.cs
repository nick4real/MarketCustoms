using MC.Profiles.Domain.Common;
using MC.Profiles.Domain.Enums;

namespace MC.Profiles.Domain.Entities;

public class Profile : BaseEntity<Guid>
{
    public string Auth0UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
}

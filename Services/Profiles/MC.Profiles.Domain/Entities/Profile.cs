using WebStoreUser.Domain.Common;
using WebStoreUser.Domain.Enums;

namespace WebStoreUser.Domain.Entities;

public class Profile : BaseEntity<Guid>
{
    public string Auth0UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
}

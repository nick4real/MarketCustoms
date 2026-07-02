using WebStoreUser.Domain.Common;
using WebStoreUser.Domain.Enums;

namespace WebStoreUser.Domain.Entities;

public class User : BaseEntity<Guid>
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
}

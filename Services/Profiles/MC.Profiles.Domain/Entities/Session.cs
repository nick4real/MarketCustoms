using WebStoreUser.Domain.Common;

namespace WebStoreUser.Domain.Entities;

public class Session : BaseEntity<uint>
{
    public Guid UserId { get; set; }
    public User User { get; set; }
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime Expires { get; set; }
    public bool IsRevoked { get; set; }
    public string? Device { get; set; }
    public string? Ip { get; set; }
    public string? UserAgent { get; set; }
}

using MC.Profiles.Domain.Common;

namespace MC.Profiles.Domain.Entities;

public class SellerProfile : BaseEntity<Guid>
{
    public Guid ProfileId { get; set; }
    public Profile Profile { get; set; } = null!;
    public string ShopName { get; set; } = string.Empty;
    public string ShopNameNormalized { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public bool IsActive { get; set; }
}

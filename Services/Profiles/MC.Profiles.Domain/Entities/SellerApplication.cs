using MC.Profiles.Domain.Common;
using MC.Profiles.Domain.Enums;

namespace MC.Profiles.Domain.Entities;

public class SellerApplication : BaseEntity<Guid>
{
    public Guid ProfileId { get; set; }
    public Profile Profile { get; set; } = null!;
    public string ShopName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public SellerApplicationOutcome Outcome { get; set; }
    public string? RejectionReason { get; set; }
}

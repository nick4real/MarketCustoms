namespace MC.Profiles.Domain.Entities;

public enum SellerApplicationOutcome
{
    Accepted,
    Rejected
}

public class SellerApplication
{
    public Guid Id { get; set; }
    public Guid ProfileId { get; set; }
    public Profile Profile { get; set; } = null!;
    public string ShopName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    public SellerApplicationOutcome Outcome { get; set; }
    public string? RejectionReason { get; set; }
}

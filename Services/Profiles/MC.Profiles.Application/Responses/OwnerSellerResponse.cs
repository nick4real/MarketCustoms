namespace MC.Profiles.Application.Responses;

public record OwnerSellerApplicationResponse(
    string ShopName,
    string? Bio,
    DateTimeOffset SubmittedAt,
    string Outcome,
    string? RejectionReason);

public record OwnerSellerResponse(
    bool IsSeller,
    string? ShopName,
    string? Bio,
    OwnerSellerApplicationResponse? Application);

namespace MC.Profiles.Application.Responses;

public record CurrentUserMetadataResponse(Guid Id, string DisplayName, string? PictureUrl, string AccountType);

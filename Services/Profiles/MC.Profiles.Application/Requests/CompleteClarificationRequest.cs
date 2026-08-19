namespace MC.Profiles.Application.Requests;

public record CompleteClarificationRequest(
    string DisplayName,
    string? Email,
    string? PhoneNumber);

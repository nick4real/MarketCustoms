using FluentValidation;
using MC.Profiles.Application.Requests;

namespace MC.Profiles.Application.Validators;

public class CompleteClarificationValidator : AbstractValidator<CompleteClarificationRequest>
{
    public CompleteClarificationValidator()
    {
        RuleFor(request => request.DisplayName)
            .Cascade(CascadeMode.Stop)
            .Must(name => !string.IsNullOrWhiteSpace(name))
            .WithMessage("Display name is required.")
            .Must(name => name.Trim().Length <= 100)
            .WithMessage("Display name must be at most 100 characters.");

        RuleFor(request => request.Email)
            .EmailAddress()
            .When(request => !string.IsNullOrWhiteSpace(request.Email))
            .WithMessage("Enter a valid email address.");

        RuleFor(request => request.PhoneNumber)
            .Must(BeValidPhone)
            .When(request => !string.IsNullOrWhiteSpace(request.PhoneNumber))
            .WithMessage("Enter a valid phone number.");

        RuleFor(request => request)
            .Must(HaveAtLeastOneContact)
            .WithMessage("Provide a display name and at least one of email or phone.");
    }

    private static bool HaveAtLeastOneContact(CompleteClarificationRequest request) =>
        !string.IsNullOrWhiteSpace(request.Email) || !string.IsNullOrWhiteSpace(request.PhoneNumber);

    private static bool BeValidPhone(string? phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return true;

        var stripped = phoneNumber
            .Replace(" ", string.Empty, StringComparison.Ordinal)
            .Replace("-", string.Empty, StringComparison.Ordinal)
            .Replace("(", string.Empty, StringComparison.Ordinal)
            .Replace(")", string.Empty, StringComparison.Ordinal);

        var digitCount = stripped.Count(char.IsDigit);
        if (digitCount is < 7 or > 15)
            return false;

        var plusCount = stripped.Count(character => character == '+');
        if (plusCount > 1)
            return false;

        if (plusCount == 1 && stripped[0] != '+')
            return false;

        return stripped.All(character => char.IsDigit(character) || character == '+');
    }
}

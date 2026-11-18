using FluentValidation;
using MC.Profiles.Application.Requests;
using MC.Profiles.Domain.Enums;

namespace MC.Profiles.Application.Validators.Requests;

public class ClarifyAccountTypeValidator : AbstractValidator<ClarifyAccountTypeRequest>
{
    public ClarifyAccountTypeValidator()
    {
        RuleFor(x => x.AccountType)
            .NotEmpty()
            .Must(value => Enum.TryParse<AccountType>(value, true, out var parsed) && Enum.IsDefined(parsed))
            .WithMessage("Account type must be Basic, Individual or Business.");
    }
}

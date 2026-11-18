using FluentValidation;
using MC.Profiles.Application.Common;
using MC.Profiles.Application.Requests;

namespace MC.Profiles.Application.Validators.Requests;

public class ClarifyAccountTypeValidator : AbstractValidator<ClarifyAccountTypeRequest>
{
    public ClarifyAccountTypeValidator()
    {
        RuleFor(x => x.AccountType)
            .NotEmpty()
            .Must(value => AccountTypeParser.TryParse(value, out _))
            .WithMessage("Account type must be Basic, Individual or Business.");
    }
}

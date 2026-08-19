using FluentValidation;
using MC.Profiles.Application.Requests;

namespace MC.Profiles.Application.Validators;

public class SubmitSellerApplicationValidator : AbstractValidator<SubmitSellerApplicationRequest>
{
    public SubmitSellerApplicationValidator()
    {
        RuleFor(request => request.ShopName)
            .Cascade(CascadeMode.Stop)
            .Must(name => !string.IsNullOrWhiteSpace(name))
            .WithMessage("Shop name is required.")
            .Must(name => name.Trim().Length is >= 2 and <= 80)
            .WithMessage("Shop name must be between 2 and 80 characters.");

        RuleFor(request => request.Bio)
            .MaximumLength(500)
            .When(request => request.Bio is not null)
            .WithMessage("Bio must be at most 500 characters.");
    }
}

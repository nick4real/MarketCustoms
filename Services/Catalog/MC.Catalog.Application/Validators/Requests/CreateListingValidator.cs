using FluentValidation;
using MC.Catalog.Application.Requests;

namespace MC.Catalog.Application.Validators.Requests;

public class CreateListingValidator : AbstractValidator<CreateListingRequest>
{
    public CreateListingValidator()
    {
        // TODO: Add validation rules for CreateListingRequest properties
        RuleFor(x => x);
    }
}

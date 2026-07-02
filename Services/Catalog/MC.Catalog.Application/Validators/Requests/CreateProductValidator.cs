using FluentValidation;
using MC.Catalog.Application.Requests;

namespace MC.Catalog.Application.Validators.Requests;

public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        // TODO: Add validation rules for CreateProductRequest properties
        RuleFor(x => x);
    }
}

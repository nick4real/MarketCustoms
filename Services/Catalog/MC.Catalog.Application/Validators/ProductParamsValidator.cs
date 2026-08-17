using FluentValidation;
using MC.Catalog.Application.Models;

namespace MC.Catalog.Application.Validators;

public class ProductParamsValidator : AbstractValidator<ProductParams>
{
    public ProductParamsValidator()
    {
        RuleFor(p => p.CategoryId)
            .GreaterThan((uint)0)
            .When(p => p.CategoryId.HasValue)
            .WithMessage("ID cannot be lower than 0");

        RuleFor(p => p.Title)
            .MaximumLength(200)
            .When(p => !string.IsNullOrWhiteSpace(p.Title))
            .WithMessage("Search text is too long.");

        RuleForEach(p => p.Parameters)
            .ChildRules(parameter =>
            {
                parameter.RuleFor(x => x.Name)
                    .NotEmpty()
                    .MaximumLength(100);

                parameter.RuleFor(x => x.Value)
                    .NotEmpty()
                    .MaximumLength(100);
            });
    }
}

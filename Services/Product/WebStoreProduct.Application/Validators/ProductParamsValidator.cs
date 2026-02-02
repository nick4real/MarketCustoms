using FluentValidation;
using WebStoreProduct.Application.DTOs;

namespace WebStoreProduct.Application.Validators;

public class ProductParamsValidator : AbstractValidator<ProductParams>
{
    public ProductParamsValidator()
    {
        RuleFor(p => p.CategoryId)
            .GreaterThan(0).WithMessage("Id cannot be lower than 0");
    }
}

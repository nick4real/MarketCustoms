using FluentValidation;
using WebStoreProduct.Application.Models;

namespace WebStoreProduct.Application.Validators;

public class ProductParamsValidator : AbstractValidator<ProductParams>
{
    public ProductParamsValidator()
    {
        RuleFor(p => p.CategoryId)
            .GreaterThan((uint)0).WithMessage("ID cannot be lower than 0");
    }
}

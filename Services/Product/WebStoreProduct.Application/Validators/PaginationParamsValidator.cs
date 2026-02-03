using FluentValidation;
using WebStoreProduct.Application.Common;
using WebStoreProduct.Application.Models;

namespace WebStoreProduct.Application.Validators;

public class PaginationParamsValidator : AbstractValidator<PaginationParams>
{
    public PaginationParamsValidator()
    {
        RuleFor(x => x.PageSize)
            .GreaterThan(FieldConstraints.MinPageSize).WithMessage($"Page size must be greater than {FieldConstraints.MinPageSize}.")
            .LessThanOrEqualTo(FieldConstraints.MaxPageSize).WithMessage($"Page size must be lower than {FieldConstraints.MaxPageSize}.");

        RuleFor(x => x.PageIndex)
            .GreaterThan(0).WithMessage("Page number cannot be lower than 0");
    }
}

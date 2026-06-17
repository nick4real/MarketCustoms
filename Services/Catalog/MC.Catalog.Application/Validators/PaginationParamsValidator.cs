using FluentValidation;
using MC.Catalog.Application.Common;
using MC.Catalog.Application.Models;

namespace MC.Catalog.Application.Validators;

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

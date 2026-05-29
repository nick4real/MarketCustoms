using FluentValidation;
using WebStoreUser.Application.Interfaces.Repositories;
using WebStoreUser.Application.Requests;

namespace WebStoreUser.Application.Validators.Auth;

public class UserRegisterRequestValidator : AbstractValidator<UserRegisterRequest>
{
    private readonly string usernamePattern = @"^[a-zA-Z0-9._-]{3,20}$";

    public UserRegisterRequestValidator(IUserRepository userRepository)
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            // TODO: Can be optimized when SharpGrip.FluentValidation.AutoValidation.Mvc support for .NET 10 is released
            //.MustAsync(async (email, ct) =>
            //    await userRepository.GetByEmailAsync(email) == null)
            //    .WithMessage("User with the provided email already exists.")
            .MaximumLength(256).WithMessage("Email must not exceed 256 characters.");

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required.")
            .Matches(usernamePattern).WithMessage("Username can only contain letters, numbers, dots, underscores, and hyphens.")
            //.MustAsync(async (username, ct) =>
            //    await userRepository.GetByUsernameAsync(username) == null)
            //    .WithMessage("User with the provided username already exists.")
            .MinimumLength(3).WithMessage("Username must be at least 3 characters long.")
            .MaximumLength(20).WithMessage("Username must not exceed 20 characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password cannot be empty")
            .MinimumLength(8).WithMessage("Password length must be at least 8.")
            .MaximumLength(32).WithMessage("Password length must not exceed 32.")
            .Matches(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^?&*]).+$")
            .WithMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        ;
    }
}

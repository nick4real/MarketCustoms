using MC.Profiles.Application.Requests;
using MC.Profiles.Application.Validators.Requests;

namespace MC.Profiles.UnitTests.Application;

public sealed class ClarifyAccountTypeValidatorTests
{
    private readonly ClarifyAccountTypeValidator _validator = new();

    [Theory]
    [InlineData("basic")]
    [InlineData("Individual")]
    [InlineData("BUSINESS")]
    public void Validate_accepts_known_types_ignoring_case(string accountType)
    {
        var result = _validator.Validate(new ClarifyAccountTypeRequest(accountType));

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData("Seller")]
    [InlineData("3")]
    public void Validate_rejects_empty_and_unknown_types(string accountType)
    {
        var result = _validator.Validate(new ClarifyAccountTypeRequest(accountType));

        Assert.False(result.IsValid);
    }
}

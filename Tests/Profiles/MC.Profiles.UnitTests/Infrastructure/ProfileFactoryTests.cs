using MC.Profiles.Domain.Enums;
using MC.Profiles.Infrastructure.Persistence.Seeding;
using MC.Shared.Infrastructure.Seeding;

namespace MC.Profiles.UnitTests.Infrastructure;

public sealed class ProfileFactoryTests
{
    private static readonly DateTimeOffset ReferenceDate = new(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Same_seed_produces_identical_profiles()
    {
        var first = new ProfileFactory(42, ReferenceDate).CreateSeller(3);
        var second = new ProfileFactory(42, ReferenceDate).CreateSeller(3);

        Assert.Equivalent(first, second, strict: true);
    }

    [Fact]
    public void Different_seed_produces_different_profiles()
    {
        var first = new ProfileFactory(1, ReferenceDate).CreateBuyer(0);
        var second = new ProfileFactory(2, ReferenceDate).CreateBuyer(0);

        Assert.Equal(first.Id, second.Id);
        Assert.NotEqual(first.Email, second.Email);
    }

    [Fact]
    public void Sellers_use_deterministic_ids_and_seller_account_types()
    {
        var factory = new ProfileFactory(1337, ReferenceDate);

        for (var i = 0; i < 20; i++)
        {
            var seller = factory.CreateSeller(i);

            Assert.Equal(SeedIds.Seller(i), seller.Id);
            Assert.Equal(SeedIds.ExternalUserId(seller.Id), seller.ExternalUserId);
            Assert.NotEqual(AccountType.Basic, seller.AccountType);
            Assert.InRange(seller.CreatedAt, ReferenceDate.AddYears(-2), ReferenceDate);
            Assert.InRange(seller.UpdatedAt, seller.CreatedAt, ReferenceDate);
        }
    }

    [Fact]
    public void Buyers_are_basic_accounts_with_private_contacts()
    {
        var factory = new ProfileFactory(1337, ReferenceDate);

        for (var i = 0; i < 20; i++)
        {
            var buyer = factory.CreateBuyer(i);

            Assert.Equal(SeedIds.Buyer(i), buyer.Id);
            Assert.Equal(AccountType.Basic, buyer.AccountType);
            Assert.False(buyer.IsEmailPublic);
            Assert.False(buyer.IsPhonePublic);
            Assert.EndsWith("@example.com", buyer.Email);
        }
    }
}

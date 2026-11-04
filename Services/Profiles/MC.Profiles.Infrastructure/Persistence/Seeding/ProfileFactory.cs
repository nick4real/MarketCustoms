using Bogus;
using MC.Profiles.Domain.Entities;
using MC.Profiles.Domain.Enums;
using MC.Shared.Infrastructure.Seeding;

namespace MC.Profiles.Infrastructure.Persistence.Seeding;

public sealed class ProfileFactory(int randomSeed, DateTimeOffset referenceDate)
{
    public Profile CreateSeller(int index) => Create(SeedIds.Seller(index), isSeller: true);

    public Profile CreateBuyer(int index) => Create(SeedIds.Buyer(index), isSeller: false);

    private Profile Create(Guid id, bool isSeller)
    {
        var f = new Faker { Random = new Randomizer(SeedIds.DeriveSeed(randomSeed, $"profile:{id:N}")) };

        var firstName = f.Name.FirstName();
        var lastName = f.Name.LastName();
        var accountType = isSeller
            ? f.PickRandom(AccountType.Individual, AccountType.Business)
            : AccountType.Basic;
        var displayName = accountType == AccountType.Business
            ? f.Company.CompanyName()
            : $"{firstName} {lastName}";
        var createdAt = f.Date.PastOffset(2, referenceDate);

        return new Profile
        {
            Id = id,
            ExternalUserId = SeedIds.ExternalUserId(id),
            DisplayName = displayName,
            Email = f.Internet.Email(firstName, lastName, "example.com"),
            PhoneNumber = f.Phone.PhoneNumber("+1555#######"),
            Bio = isSeller ? f.Lorem.Sentences(2) : null,
            AccountType = accountType,
            IsEmailPublic = isSeller && f.Random.Bool(0.6f),
            IsPhonePublic = isSeller && f.Random.Bool(0.3f),
            IsVerified = isSeller && f.Random.Bool(0.7f),
            CreatedAt = createdAt,
            UpdatedAt = f.Date.BetweenOffset(createdAt, referenceDate)
        };
    }
}

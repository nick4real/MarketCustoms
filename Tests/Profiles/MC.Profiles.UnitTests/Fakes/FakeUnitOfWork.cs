using MC.Profiles.Application.Interfaces.Repositories;

namespace MC.Profiles.UnitTests.Fakes;

internal sealed class FakeUnitOfWork(
    FakeSellerApplicationRepository applications,
    FakeSellerProfileRepository sellerProfiles) : IUnitOfWork
{
    public async Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken)
    {
        var applicationSnapshot = applications.Clone();
        var sellerSnapshot = sellerProfiles.Clone();
        try
        {
            await action(cancellationToken);
        }
        catch
        {
            applications.Restore(applicationSnapshot);
            sellerProfiles.Restore(sellerSnapshot);
            throw;
        }
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}

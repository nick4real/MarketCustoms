using MC.Shared.Application.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;

namespace MC.Catalog.Infrastructure.Persistence;

public sealed class UnitOfWork(AppRelationalDbContext sqlContext, AppMongoDbContext mongoContext)
{
    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await sqlContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ExecuteInTransactionAsync(
        Func<IClientSessionHandle, CancellationToken, Task> action,
        CancellationToken cancellationToken)
    {
        var strategy = sqlContext.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            await using var sqlTransaction = await sqlContext.Database.BeginTransactionAsync(cancellationToken);
            using var mongoSession = await mongoContext.GetClientSessionAsync(cancellationToken);
            mongoSession.StartTransaction();

            try
            {
                await action(mongoSession, cancellationToken);

                await sqlContext.SaveChangesAsync(cancellationToken);

                await mongoSession.CommitTransactionAsync(cancellationToken);
                await sqlTransaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await mongoSession.AbortTransactionAsync(cancellationToken);
                await sqlTransaction.RollbackAsync(cancellationToken);
                throw;
            }
        });
    }
}
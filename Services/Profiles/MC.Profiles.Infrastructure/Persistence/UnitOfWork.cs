using MC.Profiles.Application.Common;
using MC.Profiles.Application.Interfaces.Repositories;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace MC.Profiles.Infrastructure.Persistence;

public sealed class UnitOfWork(AppRelationalDbContext context) : IUnitOfWork
{
    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            throw MapUniqueViolation(exception);
        }
    }

    public async Task ExecuteInTransactionAsync(
        Func<CancellationToken, Task> action,
        CancellationToken cancellationToken)
    {
        var strategy = context.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                await action(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        });
    }

    private static bool IsUniqueViolation(DbUpdateException exception) =>
        exception.InnerException is SqlException sql && sql.Number is 2601 or 2627;

    private static Exception MapUniqueViolation(DbUpdateException exception)
    {
        var message = exception.InnerException?.Message ?? exception.Message;
        if (message.Contains("ShopNameNormalized", StringComparison.OrdinalIgnoreCase))
            return new ShopNameConflictException();

        if (message.Contains("ProfileId", StringComparison.OrdinalIgnoreCase))
            return new AlreadySellerException();

        return exception;
    }
}

using MC.Catalog.Application.Models;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Views;
using MC.Shared.Application.Models;

namespace MC.Catalog.Application.Interfaces.Repositories;

public interface IListingRepository
{
    Task<PagedCollection<ListingCardView>> GetListingsCatalogViewAsync(int skip, int take, CancellationToken ct, ListingParams? queryParams);
    Task<Listing?> GetListingByIdAsync(string id, CancellationToken ct);
    Task AddListingAsync(Listing listing, CancellationToken ct);
    Task SaveChangesAsync();
}

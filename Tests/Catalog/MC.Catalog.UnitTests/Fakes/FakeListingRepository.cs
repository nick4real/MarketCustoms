using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Application.Models;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Views;

namespace MC.Catalog.UnitTests.Fakes;

internal sealed class FakeListingRepository : IListingRepository
{
    private readonly List<Listing> _listings = [];

    public Task<PagedList<ListingCatalogView>> GetListingsCatalogViewAsync(
        int skip,
        int take,
        CancellationToken ct,
        ListingParams? queryParams)
    {
        var views = _listings
            .Skip(skip)
            .Take(take)
            .Select(listing => new ListingCatalogView(
                listing.Id,
                listing.Title,
                listing.Description,
                listing.Price,
                listing.ImageLinks.FirstOrDefault() ?? string.Empty))
            .ToArray();

        return Task.FromResult(new PagedList<ListingCatalogView>(views, _listings.Count));
    }

    public Task<Listing?> GetListingByIdAsync(string id, CancellationToken ct)
        => Task.FromResult(_listings.FirstOrDefault(listing => listing.Id == id));

    public Task AddListingAsync(Listing listing, CancellationToken ct)
    {
        _listings.Add(listing);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync() => Task.CompletedTask;
}

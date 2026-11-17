using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Application.Models;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Views;
using MC.Shared.Application.Models;

namespace MC.Catalog.UnitTests.Fakes;

internal sealed class FakeListingRepository : IListingRepository
{
    private readonly List<Listing> _listings = [];

    public Task<PagedCollection<ListingCardView>> GetListingsCatalogViewAsync(
        int skip,
        int take,
        CancellationToken ct,
        IEnumerable<uint>? expandedCategoryIds = null,
        ListingParams? listingParams = null)
    {
        IEnumerable<Listing> filtered = _listings;

        if (listingParams is not null)
        {
            if (listingParams.CategoryId.HasValue)
            {
                var categoryIds = expandedCategoryIds?.ToHashSet() ?? [];
                filtered = filtered.Where(listing => categoryIds.Contains(listing.CategoryId));
            }

            if (listingParams.Condition.HasValue)
            {
                filtered = filtered.Where(listing => listing.Condition == listingParams.Condition.Value);
            }

            if (listingParams.OwnerId.HasValue)
            {
                filtered = filtered.Where(listing => listing.OwnerGuid == listingParams.OwnerId.Value);
            }

            if (!string.IsNullOrWhiteSpace(listingParams.Title))
            {
                var title = listingParams.Title.Trim();
                filtered = filtered.Where(listing => listing.Title.Contains(title, StringComparison.OrdinalIgnoreCase));
            }
        }

        var matching = filtered.ToArray();

        var views = matching
            .Skip(skip)
            .Take(take)
            .Select(listing => new ListingCardView(
                listing.Id,
                listing.Title,
                listing.Description,
                listing.Condition.ToString(),
                listing.Price,
                listing.ImageLinks.FirstOrDefault() ?? string.Empty))
            .ToArray();

        return Task.FromResult(new PagedCollection<ListingCardView>(views, matching.Length));
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

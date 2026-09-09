using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Application.Models;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Views;
using MC.Shared.Application.Models;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using System.Text.RegularExpressions;

namespace MC.Catalog.Infrastructure.Persistence.Repositories;

public class ListingRepository(AppRelationalDbContext sqlContext, AppMongoDbContext mongoContext, UnitOfWork unitOfWork) : IListingRepository
{
    public async Task<Listing?> GetListingByIdAsync(string id, CancellationToken ct)
    {
        var listingBson = await mongoContext.Listings.Find(p => p.Id == id).FirstOrDefaultAsync(ct);

        // Return detailed listing information if found, otherwise return null
        if (listingBson == null) return null;

        // Fetch the category from the relational database using the CategoryId from the listing
        // TODO: Add CRUD categories 
        var categoryTask = sqlContext.Categories.FindAsync(listingBson.CategoryId, ct).AsTask();
        var locationTask = sqlContext.Locations.FindAsync(listingBson.LocationId, ct).AsTask();

        await Task.WhenAll(categoryTask, locationTask);

        var category = categoryTask.Result;
        var location = locationTask.Result;

        return new Listing
        {
            Id = listingBson.Id,
            OwnerGuid = listingBson.OwnerGuid,
            Title = listingBson.Title,
            Description = listingBson.Description,
            LocationId = listingBson.LocationId,
            Location = location ?? new Location { Id = 0, Country = "Unknown", Region = "Unknown", City = "Unknown" }, // TODO: Add CRUD locations
            CategoryId = listingBson.CategoryId,
            Category = category ?? new Category { Id = 0, Name = "Unknown" }, // TODO: Add CRUD categories
            CreatedAt = listingBson.CreatedAt,
            Price = listingBson.Price,
            StockQuantity = listingBson.StockQuantity,
            ImageLinks = listingBson.ImageLinks ?? [],
            Tags = listingBson.Tags ?? [],
            Parameters = listingBson.Parameters ?? []
        };
    }

    public async Task<PagedCollection<ListingCardView>> GetListingsCatalogViewAsync(int skip, int take, CancellationToken ct, ListingParams? listingParams)
    {
        var filterBuilder = Builders<Models.ListingBson>.Filter;
        var filter = filterBuilder.Empty;

        Console.WriteLine(filter == filterBuilder.Empty);

        if (listingParams != null && listingParams.CategoryId.HasValue)
        {
            filter &= filterBuilder.Eq(p => p.CategoryId, listingParams.CategoryId.Value);
        }

        if (listingParams != null && !string.IsNullOrWhiteSpace(listingParams.Title))
        {
            var title = Regex.Escape(listingParams.Title.Trim());
            filter &= filterBuilder.Regex(p => p.Title, new MongoDB.Bson.BsonRegularExpression(title, "i"));
        }

        if (listingParams?.Parameters is { Count: > 0 })
        {
            foreach (var parameter in listingParams.Parameters)
            {
                var name = Regex.Escape(parameter.Item1.Trim());
                var value = Regex.Escape(parameter.Item2.Trim());
                filter &= filterBuilder.ElemMatch(
                    p => p.Parameters,
                    Builders<Tuple<string, string>>.Filter.Regex(x => x.Item1, new MongoDB.Bson.BsonRegularExpression($"^{name}$", "i"))
                    & Builders<Tuple<string, string>>.Filter.Regex(x => x.Item2, new MongoDB.Bson.BsonRegularExpression($"^{value}$", "i")));
            }
        }

        var totalItemsTask = filter == filterBuilder.Empty
            ? mongoContext.Listings.EstimatedDocumentCountAsync(cancellationToken: ct)
            : mongoContext.Listings.CountDocumentsAsync(filter, cancellationToken: ct);

        var listingsTask = mongoContext.Listings
            .Find(filter)
            .SortByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Limit(take)
            .Project(p => new ListingCardView(
                p.Id,
                p.Title,
                p.Description,
                p.Price,
                p.ImageLinks.FirstOrDefault() ?? string.Empty
            ))
            .ToListAsync(ct);

        await Task.WhenAll(listingsTask, totalItemsTask);

        return new PagedCollection<ListingCardView>(
            listingsTask.Result.ToArray(),
            (int)totalItemsTask.Result
        );
    }

    public async Task AddListingAsync(Listing listing, CancellationToken ct)
    {
        await unitOfWork.ExecuteInTransactionAsync(async (mongoSession, ct) =>
        {
            var location = await sqlContext.Locations.AddAsync(listing.Location, ct);

            var listingBson = new Models.ListingBson
            {
                OwnerGuid = listing.OwnerGuid,
                Title = listing.Title,
                Description = listing.Description,
                CategoryId = listing.CategoryId,
                LocationId = listing.LocationId,
                CreatedAt = listing.CreatedAt,
                Price = listing.Price,
                StockQuantity = listing.StockQuantity,
                ImageLinks = listing.ImageLinks ?? [],
                Tags = listing.Tags ?? [],
                Parameters = listing.Parameters ?? []
            };

            await mongoContext.Listings.InsertOneAsync(mongoSession, listingBson, cancellationToken: ct);
        }, ct);
    }

    public async Task SaveChangesAsync()
    {
        await sqlContext.SaveChangesAsync();
    }
}

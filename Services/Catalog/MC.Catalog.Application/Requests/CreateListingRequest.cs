using MC.Catalog.Application.DTOs;

namespace MC.Catalog.Application.Requests;

public record CreateListingRequest(
    Guid OwnerGuid,
    string Title,
    string Description,
    uint CategoryId,
    LocationDto Location,
    decimal Price,
    int StockQuantity,
    List<string> ImageLinks,
    List<string> Tags,
    List<Tuple<string, string>> Parameters
);

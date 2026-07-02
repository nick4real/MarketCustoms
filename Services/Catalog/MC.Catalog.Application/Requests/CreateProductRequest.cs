namespace MC.Catalog.Application.Requests;

public record CreateProductRequest(
    string OwnerId,
    string Title,
    string Description,
    uint CategoryId,
    decimal Price,
    int StockQuantity,
    List<string> ImageLinks,
    List<string> Tags,
    List<Tuple<string, string>> Parameters
);

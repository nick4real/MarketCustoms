namespace WebStoreProduct.Application.Models;

public record PagedList<T>(T[] Items, int TotalItems);

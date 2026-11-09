namespace MC.Shared.Application.Models;

public record PagedCollection<T>(T[] Items, int TotalItems);

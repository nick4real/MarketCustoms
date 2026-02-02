using WebStoreProduct.Domain.Entities;

namespace WebStoreProduct.Application.DTOs;

public record ProductDto(
    uint Id,
    string Title,
    string Description,
    decimal Price,
    ImageLink Image);
using Mapster;
using WebStoreProduct.Application.DTOs;
using WebStoreProduct.Domain.Entities;

namespace WebStoreProduct.Application.Common;

public static class MapsterConfig
{
    public static void Configure()
    {
        TypeAdapterConfig<Product, ProductDto>.NewConfig()
            .Map(dest => dest.Image, src => src.Images.FirstOrDefault());
    }
}

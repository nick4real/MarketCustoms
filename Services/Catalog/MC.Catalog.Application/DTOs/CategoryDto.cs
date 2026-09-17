namespace MC.Catalog.Application.DTOs;

public record CategoryDto(uint Id, string Name, List<CategoryDto>? ChildCategories);
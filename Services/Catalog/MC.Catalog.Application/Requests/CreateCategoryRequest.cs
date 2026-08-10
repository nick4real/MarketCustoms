namespace MC.Catalog.Application.Requests;

public record CreateCategoryRequest(string Name, uint ParentId);
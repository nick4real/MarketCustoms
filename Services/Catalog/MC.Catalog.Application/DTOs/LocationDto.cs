namespace MC.Catalog.Application.DTOs;

public record LocationDto(
    string? Country, 
    string? Region,
    string? City, 
    string? District,
    decimal Latitude,
    decimal Longitude);

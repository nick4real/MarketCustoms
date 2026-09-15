namespace MC.Catalog.Domain.Entities;

public class Location
{
    public uint Id { get; set; }
    public string? Country { get; set; }
    public string? Region { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
}

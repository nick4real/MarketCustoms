using System.Text.Json.Serialization;

namespace MC.Catalog.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Condition
{
    New,
    Used,
    Damaged
}
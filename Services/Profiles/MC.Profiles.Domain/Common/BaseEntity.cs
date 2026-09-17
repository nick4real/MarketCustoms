namespace MC.Profiles.Domain.Common;

public abstract class BaseEntity<TId>
{
    public TId Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

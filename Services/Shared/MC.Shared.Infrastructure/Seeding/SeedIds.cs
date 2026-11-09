using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text;

namespace MC.Shared.Infrastructure.Seeding;

/// <summary>
/// Deterministic identifiers for seeded data, stable across processes and services.
/// </summary>
public static class SeedIds
{
    private static readonly Guid Namespace = new("6f1d3c3e-4b8a-4f61-9d2e-1c7a5b9e0a42");

    public static Guid Seller(int index) => Create($"seller:{index}");

    public static Guid Buyer(int index) => Create($"buyer:{index}");

    public static string ExternalUserId(Guid profileId) => $"seed|{profileId:N}";

    /// <summary>
    /// Derives a per-entity random seed so generated values do not depend on generation order.
    /// </summary>
    public static int DeriveSeed(int randomSeed, string key)
    {
        Span<byte> bytes = stackalloc byte[16];
        Create(key).TryWriteBytes(bytes, bigEndian: true, out _);
        return unchecked(randomSeed * 486187739 + BinaryPrimitives.ReadInt32BigEndian(bytes));
    }

    /// <summary>RFC 4122 name-based (version 5) UUID.</summary>
    public static Guid Create(string name)
    {
        var nameBytes = Encoding.UTF8.GetBytes(name);
        var data = new byte[16 + nameBytes.Length];
        Namespace.TryWriteBytes(data, bigEndian: true, out _);
        nameBytes.CopyTo(data, 16);

        Span<byte> hash = stackalloc byte[SHA1.HashSizeInBytes];
        SHA1.HashData(data, hash);
        hash[6] = (byte)((hash[6] & 0x0F) | 0x50);
        hash[8] = (byte)((hash[8] & 0x3F) | 0x80);

        return new Guid(hash[..16], bigEndian: true);
    }
}

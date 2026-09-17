using System.Text;

namespace MC.Profiles.Application.Services;

public static class PhoneNumberNormalizer
{
    public static string Normalize(string? phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return string.Empty;

        var trimmed = phoneNumber.Trim();
        var hasPlus = trimmed.StartsWith('+');
        var digits = DigitsOnly(trimmed);
        if (digits.Length == 0)
            return string.Empty;

        return hasPlus ? "+" + digits : digits;
    }

    public static string DigitsOnly(string? phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return string.Empty;

        var builder = new StringBuilder(phoneNumber.Length);
        foreach (var character in phoneNumber)
        {
            if (char.IsDigit(character))
                builder.Append(character);
        }

        return builder.ToString();
    }

    public static bool MatchesIdentityClaim(string? confirmed, string? identityClaim)
    {
        var left = DigitsOnly(confirmed);
        var right = DigitsOnly(identityClaim);
        return left.Length > 0 && string.Equals(left, right, StringComparison.Ordinal);
    }
}

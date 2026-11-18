using MC.Profiles.Domain.Enums;

namespace MC.Profiles.Application.Common;

public static class AccountTypeParser
{
    // Enum.TryParse also accepts numeric strings such as "1", which are not part of the contract.
    public static bool TryParse(string? value, out AccountType accountType)
    {
        foreach (var candidate in Enum.GetValues<AccountType>())
        {
            if (string.Equals(candidate.ToString(), value?.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                accountType = candidate;
                return true;
            }
        }

        accountType = default;
        return false;
    }
}

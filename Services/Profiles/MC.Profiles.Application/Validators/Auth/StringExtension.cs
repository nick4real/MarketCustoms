using System.Text.RegularExpressions;

namespace WebStoreUser.Application.Validators.Auth;

internal static class StringExtension
{
    extension(string value)
    {
        public bool IsEmail()
        {
            if (string.IsNullOrWhiteSpace(value)) return false;

            const string pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";

            return Regex.IsMatch(value, pattern, RegexOptions.IgnoreCase);
        }
    }
}

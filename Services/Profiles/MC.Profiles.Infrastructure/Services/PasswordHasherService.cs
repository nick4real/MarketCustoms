using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using WebStoreUser.Application.Interfaces.Services;

namespace WebStoreUser.Infrastructure.Services;

public class PasswordHasherService : IPasswordHasherService
{
    private const int SaltSize = 16;
    private const int SubkeySize = 32;
    private const int Iterations = 1000;
    private const byte FormatMarker = 0x01;
    private const KeyDerivationPrf Prf = KeyDerivationPrf.HMACSHA256;
    public string HashPassword(string password)
    {
        if (password == null)
        {
            throw new ArgumentNullException(nameof(password));
        }

        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);
        byte[] subkey = KeyDerivation.Pbkdf2(
            password,
            salt,
            Prf,
            Iterations,
            SubkeySize);

        var outputBytes = new byte[13 + salt.Length + subkey.Length];
        outputBytes[0] = FormatMarker; // format marker
        WriteNetworkByteOrder(outputBytes, 1, (uint)Prf);
        WriteNetworkByteOrder(outputBytes, 5, (uint)Iterations);
        WriteNetworkByteOrder(outputBytes, 9, (uint)SaltSize);
        Buffer.BlockCopy(salt, 0, outputBytes, 13, salt.Length);
        Buffer.BlockCopy(subkey, 0, outputBytes, 13 + SaltSize, subkey.Length);

        return Convert.ToBase64String(outputBytes);
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        try
        {
            byte[] hashedPasswordBytes = Convert.FromBase64String(hashedPassword);

            // Read header information
            KeyDerivationPrf prf = (KeyDerivationPrf)ReadNetworkByteOrder(hashedPasswordBytes, 1);
            int iterCount = (int)ReadNetworkByteOrder(hashedPasswordBytes, 5);
            int saltLength = (int)ReadNetworkByteOrder(hashedPasswordBytes, 9);

            // Read the salt: must be >= 128 bits
            if (saltLength < 128 / 8)
            {
                return false;
            }
            byte[] salt = new byte[saltLength];
            Buffer.BlockCopy(hashedPasswordBytes, 13, salt, 0, salt.Length);

            // Read the subkey (the rest of the payload): must be >= 128 bits
            int subkeyLength = hashedPasswordBytes.Length - 13 - salt.Length;
            if (subkeyLength < 128 / 8)
            {
                return false;
            }
            byte[] expectedSubkey = new byte[subkeyLength];
            Buffer.BlockCopy(hashedPasswordBytes, 13 + salt.Length, expectedSubkey, 0, expectedSubkey.Length);

            // Hash the incoming password and verify it
            byte[] actualSubkey = KeyDerivation.Pbkdf2(password, salt, prf, iterCount, subkeyLength);
            return ByteArraysEqual(actualSubkey, expectedSubkey);
        }
        catch
        {
            // This should never occur except in the case of a malformed payload, where
            // we might go off the end of the array. Regardless, a malformed payload
            // implies verification failed.
            return false;
        }
    }

    private static void WriteNetworkByteOrder(byte[] buffer, int offset, uint value)
    {
        buffer[offset + 0] = (byte)(value >> 24);
        buffer[offset + 1] = (byte)(value >> 16);
        buffer[offset + 2] = (byte)(value >> 8);
        buffer[offset + 3] = (byte)(value >> 0);
    }

    private static uint ReadNetworkByteOrder(byte[] buffer, int offset)
    {
        return ((uint)(buffer[offset + 0]) << 24)
            | ((uint)(buffer[offset + 1]) << 16)
            | ((uint)(buffer[offset + 2]) << 8)
            | ((uint)(buffer[offset + 3]));
    }

    // Compares two byte arrays for equality. The method is specifically written so that the loop is not optimized.
    [MethodImpl(MethodImplOptions.NoInlining | MethodImplOptions.NoOptimization)]
    private static bool ByteArraysEqual(byte[] a, byte[] b)
    {
        if (a == null && b == null)
        {
            return true;
        }
        if (a == null || b == null || a.Length != b.Length)
        {
            return false;
        }
        var areSame = true;
        for (var i = 0; i < a.Length; i++)
        {
            areSame &= (a[i] == b[i]);
        }
        return areSame;
    }
}

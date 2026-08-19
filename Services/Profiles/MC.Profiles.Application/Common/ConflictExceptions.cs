namespace MC.Profiles.Application.Common;

public sealed class ShopNameConflictException() : Exception("That shop name is already taken.");

public sealed class AlreadySellerException() : Exception("You are already a seller.");

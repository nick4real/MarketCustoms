using MC.Catalog.Domain.Entities;
using MC.Catalog.Infrastructure.Models;
using MC.Shared.Infrastructure.Interfaces.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MC.Catalog.Infrastructure.Persistence;

public class DatabaseSeeder(AppRelationalDbContext relContext, AppMongoDbContext docContext) : IDatabaseSeeder
{
    private Guid FullGrantedUserId = Guid.NewGuid();

    public async Task SeedAsync()
    {
        var allMigrations = relContext.Database.GetMigrations().ToList();
        var appliedMigrations = (await relContext.Database.GetAppliedMigrationsAsync()).ToList();

        // Mismatch if:
        // 1) there are pending migrations, OR
        // 2) DB has migrations not present in code (e.g. due to branch switch)
        var hasPending = allMigrations.Except(appliedMigrations).Any();
        var hasUnknownApplied = appliedMigrations.Except(allMigrations).Any();

        if (hasPending)
        {
            await relContext.Database.MigrateAsync();
        }
        else if (hasUnknownApplied)
        {
            await relContext.Database.EnsureDeletedAsync();
            await relContext.Database.MigrateAsync();
        }

        // Skip data seeding if no migrations were applied
        if (!hasPending && !hasUnknownApplied) return;

        Task[] tasks =
        {
            Task.Run(SeedCategoriesAsync),
            Task.Run(SeedListingsAsync)
        };

        await Task.WhenAll(tasks);
    }

    private async Task SeedCategoriesAsync()
    {
        if (await relContext.Categories.AnyAsync()) return;

        var categories = new List<Category>
        {
            new Category
            {
                Name = "Electronics",
                ChildCategories = new List<Category>
                {
                    new Category
                    {
                        Name = "Computers & Laptops",
                        ChildCategories = new List<Category>
                        {
                            new Category { Name = "Laptops" }
                        }
                    },
                    new Category { Name = "Audio & Headphones" }
                }
            },
            new Category
            {
                Name = "Books",
                ChildCategories = new List<Category>
                {
                    new Category {Name = "Fiction" },
                    new Category
                    {
                        Name = "Computers & Technology",
                        ChildCategories = new List<Category>
                        {
                            new Category { Name = ".NET & C#" }
                        }
                    }
                }
            },
            new Category
            {
                Name = "Clothing",
                ChildCategories = new List<Category>
                {
                    new Category { Name = "Men's Apparel" },
                    new Category { Name = "Women's Apparel" }
                }
            },
            new Category
            {
                Name = "Home & Kitchen",
                ChildCategories = new List<Category>
                {
                    new Category { Name = "Kitchen Appliances" }
                }
            },
            new Category
            {
                Name = "Sports & Outdoors",
                ChildCategories = new List<Category>
                {
                    new Category { Name = "Camping & Hiking" }
                }
            }
        };

        await relContext.Categories.AddRangeAsync(categories);
        await relContext.SaveChangesAsync();
    }
    private async Task SeedListingsAsync()
    {
        if (await docContext.Listings.EstimatedDocumentCountAsync() > 0) return;

        var listings = new ListingBson[]
        {
            new ListingBson
            {
                OwnerGuid = FullGrantedUserId,
                Title = "Leica M6 TTL Black",
                Description = "Black chrome Leica M6 TTL with the 0.72 finder. Shutter is even across all speeds, rangefinder patch is bright, and the vulcanite is original with honest wear at the edges. Recently CLA'd in Tokyo — light seals replaced, viewfinder cleaned. Body only; no lens, strap, or box.",
                CategoryId = 1,
                CreatedAt = DateTime.UtcNow,
                Price = 2400.00m,
                StockQuantity = 1,
                ImageLinks = new List<string>
                {
                    "photo-1606983340126-99ab4feaa64a",
                    "photo-1495704908510-27d9980ed3cb",
                    "photo-1452780212940-6f5c0d16d619"
                },
                Tags = new List<string> { "rangefinder", "film", "leica", "analog" },
                Parameters = new List<Param>
                {
                    new Param { Name = "Brand", Value = "Leica" },
                    new Param { Name = "Model", Value = "M6 TTL" },
                    new Param { Name = "Year", Value = "1998" },
                    new Param { Name = "Finder", Value = "0.72×" },
                    new Param { Name = "Shutter", Value = "1–1/1000 + B" },
                    new Param { Name = "Serial", Value = "2471821" }
                }
            },
            new ListingBson
            {
                OwnerGuid = FullGrantedUserId,
                Title = "Arc'teryx Beta AR Jacket",
                Description = "Men's Beta AR in Black Sapphire, size M. Worn twice on spring tours, then stored. No delamination, no snags, pit zips run clean. Gore-Tex Pro face still beads water. From a smoke-free home; includes original stuff sack.",
                CategoryId = 10,
                CreatedAt = DateTime.UtcNow,
                Price = 380.00m,
                StockQuantity = 1,
                ImageLinks = new List<string>
                {
                    "photo-1551698618-1dfe5d97d256",
                    "photo-1521223890158-b9eb0cf5cc73",
                    "photo-1483985988355-763728e1935b"
                },
                Tags = new List<string> { "gore-tex", "shell", "outdoor", "arcteryx" },
                Parameters = new List<Param>
                {
                    new Param { Name = "Brand", Value = "Arc'teryx" },
                    new Param { Name = "Model", Value = "Beta AR" },
                    new Param { Name = "Size", Value = "M" },
                    new Param { Name = "Color", Value = "Black Sapphire" },
                    new Param { Name = "Fabric", Value = "Gore-Tex Pro" },
                    new Param { Name = "Fit", Value = "Regular" }
                }
            },
            new ListingBson
            {
                OwnerGuid = FullGrantedUserId,
                Title = "Braun T3 Alarm Clock",
                Description = "Dietrich Lubs T3 in working order. Alarm, snooze, and light function as they should. Case has light scuffing on the rear corners; face is clean with no yellowing. Runs on a fresh AA. A small, considered object — not a reproduction.",
                CategoryId = 4,
                CreatedAt = DateTime.UtcNow,
                Price = 180.00m,
                StockQuantity = 1,
                ImageLinks = new List<string>
                {
                    "photo-1563861826100-9cb868fdbe1c",
                    "photo-1510511459019-5dda7724ec03",
                    "photo-1507473885765-e6ed057f782c"
                },
                Tags = new List<string> { "braun", "design", "alarm", "vintage" },
                Parameters = new List<Param>
                {
                    new Param { Name = "Brand", Value = "Braun" },
                    new Param { Name = "Model", Value = "T3" },
                    new Param { Name = "Designer", Value = "Dietrich Lubs" },
                    new Param { Name = "Origin", Value = "Germany" },
                    new Param { Name = "Power", Value = "1× AA" },
                    new Param { Name = "Dimensions", Value = "61 × 61 × 61 mm" }
                }
            },
            new ListingBson
            {
                OwnerGuid = FullGrantedUserId,
                Title = "Technics SL-1200 MK5",
                Description = "Silver MK5, fully functional. Pitch is stable, brake is snappy, and the tonearm bearings are quiet. Plinth has rack rash on the rear left corner; dust cover has two small hairline scratches. Includes original headshell (no cartridge), RCA cables, and grounded power cord. 220–240V.",
                CategoryId = 1,
                CreatedAt = DateTime.UtcNow,
                Price = 1200.00m,
                StockQuantity = 1,
                ImageLinks = new List<string>
                {
                    "photo-1558618666-fcd25c85cd64",
                    "photo-1571330735066-03aaa9429d89",
                    "photo-1493225457124-a3eb161ffa5f"
                },
                Tags = new List<string> { "turntable", "dj", "technics", "vinyl" },
                Parameters = new List<Param>
                {
                    new Param { Name = "Brand", Value = "Technics" },
                    new Param { Name = "Model", Value = "SL-1200 MK5" },
                    new Param { Name = "Drive", Value = "Direct drive" },
                    new Param { Name = "Speed", Value = "33⅓ / 45 RPM" },
                    new Param { Name = "Voltage", Value = "220–240V" },
                    new Param { Name = "Includes", Value = "Headshell, cables, dust cover" }
                }
            },
            new ListingBson
            {
                OwnerGuid = FullGrantedUserId,
                Title = "Hasselblad 500C/M",
                Description = "Chrome 500C/M body with Acute-Matte screen. Mirror and aux shutter fire cleanly; winding is smooth with no hang-ups. Leatherette is intact with brassing on the winding crank. Body only — no back, finder, or lens. Cosmetics consistent with a working kit, not a shelf piece.",
                CategoryId = 1,
                CreatedAt = DateTime.UtcNow,
                Price = 1800.00m,
                StockQuantity = 1,
                ImageLinks = new List<string>
                {
                    "photo-1516035069371-29a1b244cc32",
                    "photo-1502920917128-1aa500764b4a",
                    "photo-1452780212940-6f5c0d16d619"
                },
                Tags = new List<string> { "medium format", "hasselblad", "film", "v-system" },
                Parameters = new List<Param>
                {
                    new Param { Name = "Brand", Value = "Hasselblad" },
                    new Param { Name = "Model", Value = "500C/M" },
                    new Param { Name = "Format", Value = "6×6" },
                    new Param { Name = "Screen", Value = "Acute-Matte" },
                    new Param { Name = "Finish", Value = "Chrome" },
                    new Param { Name = "Includes", Value = "Body only" }
                }
            },
            new ListingBson
            {
                OwnerGuid = FullGrantedUserId,
                Title = "Levi's 501 1988",
                Description = "1988 501s with a high rise and a straight leg that has worn in, not out. Red tab, care tag, and button fly all present. Fading is even; one coin-pocket repair done with matching thread. Measured flat: 32\" waist, 32\" inseam. Washed once after purchase, hung dry.",
                CategoryId = 3,
                CreatedAt = DateTime.UtcNow,
                Price = 220.00m,
                StockQuantity = 1,
                ImageLinks = new List<string>
                {
                    "photo-1542272604-787c3835535d",
                    "photo-1541099649105-f69ad21f3246",
                    "photo-1582552938357-32b906df40cb"
                },
                Tags = new List<string> { "denim", "levis", "501", "vintage" },
                Parameters = new List<Param>
                {
                    new Param { Name = "Brand", Value = "Levi's" },
                    new Param { Name = "Model", Value = "501" },
                    new Param { Name = "Year", Value = "1988" },
                    new Param { Name = "Waist", Value = "32\"" },
                    new Param { Name = "Inseam", Value = "32\"" },
                    new Param { Name = "Rise", Value = "High" }
                }
            },
            new ListingBson
            {
                OwnerGuid = FullGrantedUserId,
                Title = "Sony WH-1000XM5",
                Description = "Black XM5s used for two months of commuting. Pads and headband are unmarked; ANC and transparency work as expected. Battery still reports a full 30-hour cycle. Includes case, USB-C cable, and 3.5mm adapter. Factory reset before shipping.",
                CategoryId = 1,
                CreatedAt = DateTime.UtcNow,
                Price = 280.00m,
                StockQuantity = 1,
                ImageLinks = new List<string>
                {
                    "photo-1618366712010-f4ae9c647dcb",
                    "photo-1545127398-14699f92334b",
                    "photo-1484704849700-f032a568e944"
                },
                Tags = new List<string> { "headphones", "anc", "sony", "wireless" },
                Parameters = new List<Param>
                {
                    new Param { Name = "Brand", Value = "Sony" },
                    new Param { Name = "Model", Value = "WH-1000XM5" },
                    new Param { Name = "Color", Value = "Black" },
                    new Param { Name = "Connectivity", Value = "Bluetooth 5.2" },
                    new Param { Name = "Battery", Value = "Up to 30 hours" },
                    new Param { Name = "Includes", Value = "Case, cable, adapter" }
                }
            },
            new ListingBson
            {
                OwnerGuid = FullGrantedUserId,
                Title = "Aesop Departure Kit",
                Description = "Unopened Departure Kit in the original sleeve. Includes Resurrection Rinse-Free Hand Wash, geranium leaf body cleanser, and mandarin facial cream — travel sizes, still sealed. Purchased as a gift and never used. No dents to the tin.",
                CategoryId = 4,
                CreatedAt = DateTime.UtcNow,
                Price = 95.00m,
                StockQuantity = 3,
                ImageLinks = new List<string>
                {
                    "photo-1556228453-efd6c1ff04f6",
                    "photo-1571781926291-c477ebfd024b",
                    "photo-1556228720-195a672e8a03"
                },
                Tags = new List<string> { "aesop", "travel", "grooming", "sealed" },
                Parameters = new List<Param>
                {
                    new Param { Name = "Brand", Value = "Aesop" },
                    new Param { Name = "Set", Value = "Departure Kit" },
                    new Param { Name = "Status", Value = "Sealed" },
                    new Param { Name = "Pieces", Value = "3" },
                    new Param { Name = "Vessel", Value = "Tin" },
                    new Param { Name = "Origin", Value = "Australia" }
                }
            },
            new ListingBson
            {
                OwnerGuid = FullGrantedUserId,
                Title = "Olympus OM-1 Chrome",
                Description = "Early chrome OM-1 with a bright finder and an accurate meter (1.5V zinc-air adapter installed). Shutter is even; mirror foam has been replaced. Light brassing on the baseplate and rewind crank. Body only, cap included. A compact SLR that still earns its keep.",
                CategoryId = 1,
                CreatedAt = DateTime.UtcNow,
                Price = 320.00m,
                StockQuantity = 1,
                ImageLinks = new List<string>
                {
                    "photo-1502920917128-1aa500764b4a",
                    "photo-1516035069371-29a1b244cc32",
                    "photo-1606983340126-99ab4feaa64a"
                },
                Tags = new List<string> { "slr", "olympus", "film", "om-system" },
                Parameters = new List<Param>
                {
                    new Param { Name = "Brand", Value = "Olympus" },
                    new Param { Name = "Model", Value = "OM-1" },
                    new Param { Name = "Finish", Value = "Chrome" },
                    new Param { Name = "Shutter", Value = "1–1/1000 + B" },
                    new Param { Name = "Meter", Value = "Working (1.5V adapter)" },
                    new Param { Name = "Includes", Value = "Body cap" }
                }
            }
        };

        await docContext.Listings.InsertManyAsync(listings);
    }
}

using MC.Catalog.Application.Interfaces.Services;
using MC.Catalog.Application.Models;
using MC.Catalog.Application.Requests;
using MC.Shared.API.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MC.Catalog.API.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class ListingsController(IListingService listingService) : CustomController
{
    [AllowAnonymous]
    [HttpGet("{listingId}")]
    public async Task<IActionResult> GetById(CancellationToken ct, string listingId)
    {
        var listingsResult = await listingService.GetDetailedListingByIdAsync(listingId, ct);
        return HandleResult(listingsResult);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct, [FromQuery] PaginationParams paginationParams = default!)
    {
        var listingsResult = await listingService.GetListingsAsync(ct, paginationParams, null);
        return HandleResult(listingsResult);
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> GetAllByParams(CancellationToken ct, [FromBody] ListingParams? listingParams, [FromQuery] PaginationParams paginationParams = default!)
    {
        var listingsResult = await listingService.GetListingsAsync(ct, paginationParams, listingParams);
        return HandleResult(listingsResult);
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateListing(CancellationToken ct, [FromBody] CreateListingRequest listing)
    {
        var result = await listingService.CreateListingAsync(listing, ct);
        return HandleResult(result);
    }
}

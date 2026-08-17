using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using MC.Ordering.IntegrationTests.Fixtures;

namespace MC.Ordering.IntegrationTests.Api;

[Collection(OrderingAppCollection.Name)]
public sealed class WeatherForecastControllerTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly OrderingAppFixture _fixture;

    public WeatherForecastControllerTests(OrderingAppFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Get_weather_forecast_returns_200_with_five_items()
    {
        using var client = _fixture.CreateClient();

        var cancellationToken = TestContext.Current.CancellationToken;
        var response = await client.GetAsync("/WeatherForecast", cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var forecasts = await response.Content.ReadFromJsonAsync<WeatherForecastBody[]>(JsonOptions, cancellationToken);
        Assert.NotNull(forecasts);
        Assert.Equal(5, forecasts.Length);
    }

    private sealed record WeatherForecastBody(DateOnly Date, int TemperatureC, string? Summary);
}

using MC.Notifications.IntegrationTests.Fixtures;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace MC.Notifications.IntegrationTests.Api;

[Collection(NotificationsAppCollection.Name)]
public sealed class WeatherForecastControllerTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly NotificationsAppFixture _fixture;

    public WeatherForecastControllerTests(NotificationsAppFixture fixture)
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

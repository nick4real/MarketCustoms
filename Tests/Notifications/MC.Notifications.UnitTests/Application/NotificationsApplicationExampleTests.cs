using System.Reflection;

namespace MC.Notifications.UnitTests.Application;

public sealed class NotificationsApplicationExampleTests
{
    [Fact]
    public void Application_assembly_is_available()
    {
        var assembly = Assembly.Load("MC.Notifications.Application");

        Assert.NotNull(assembly);
        Assert.Equal("MC.Notifications.Application", assembly.GetName().Name);
    }
}

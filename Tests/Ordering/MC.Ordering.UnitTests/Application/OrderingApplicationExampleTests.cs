using System.Reflection;

namespace MC.Ordering.UnitTests.Application;

public sealed class OrderingApplicationExampleTests
{
    [Fact]
    public void Application_assembly_is_available()
    {
        var assembly = Assembly.Load("MC.Ordering.Application");

        Assert.NotNull(assembly);
        Assert.Equal("MC.Ordering.Application", assembly.GetName().Name);
    }
}

namespace MC.Catalog.UnitTests;

public sealed class CiCheckTests
{
    [Fact]
    public void Deliberately_failing_test_for_ci_check() => Assert.Fail("CI check: this test must block the merge.");
}

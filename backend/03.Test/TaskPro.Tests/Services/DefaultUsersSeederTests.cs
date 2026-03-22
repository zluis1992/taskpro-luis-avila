using Domain.Enums;
using FluentAssertions;
using Infrastructure.Data;
using Infrastructure.Data.Seeders;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace TaskPro.Tests.Services;

public class DefaultUsersSeederTests
{
    [Fact]
    public async Task SeedAsync_WhenNotDevelopment_ShouldDoNothing()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var db = new AppDbContext(options);
        var configuration = new ConfigurationBuilder().Build();
        var environment = new TestHostEnvironment(Environments.Production);

        var seeder = new DefaultUsersSeeder();
        await seeder.SeedAsync(db, configuration, environment, CancellationToken.None);

        (await db.Users.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task SeedAsync_WhenDevelopmentAndEmpty_ShouldSeedDefaultUsers()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var db = new AppDbContext(options);

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Seed:Admin:Email"] = "admin@taskpro.local",
                ["Seed:Admin:Password"] = "TaskPro123!",
                ["Seed:Member:Email"] = "user@taskpro.local",
                ["Seed:Member:Password"] = "TaskPro123!"
            })
            .Build();

        var environment = new TestHostEnvironment(Environments.Development);

        var seeder = new DefaultUsersSeeder();
        await seeder.SeedAsync(db, configuration, environment, CancellationToken.None);

        var users = await db.Users.OrderBy(u => u.Email).ToListAsync();
        users.Should().HaveCount(2);
        users[0].Email.Should().Be("admin@taskpro.local");
        users[0].Role.Should().Be(UserRole.Admin);
        users[1].Email.Should().Be("user@taskpro.local");
        users[1].Role.Should().Be(UserRole.Member);
    }

    private sealed class TestHostEnvironment : IHostEnvironment
    {
        public TestHostEnvironment(string environmentName) => EnvironmentName = environmentName;

        public string EnvironmentName { get; set; }
        public string ApplicationName { get; set; } = "TaskPro.Tests";
        public string ContentRootPath { get; set; } = "";
        public IFileProvider ContentRootFileProvider { get; set; } = default!;
    }
}


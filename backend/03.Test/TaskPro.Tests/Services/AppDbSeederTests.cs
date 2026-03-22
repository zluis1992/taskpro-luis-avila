using Domain.Enums;
using FluentAssertions;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace TaskPro.Tests.Services;

public class AppDbSeederTests
{
    [Fact]
    public async Task SeedUsersAsync_WhenDatabaseEmpty_ShouldInsertUsers()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var db = new AppDbContext(options);

        await AppDbSeeder.SeedUsersAsync(
            db,
            [
                new SeedUser("Admin", "admin@taskpro.local", "TaskPro123!", UserRole.Admin),
                new SeedUser("User", "user@taskpro.local", "TaskPro123!", UserRole.Member)
            ]);

        var users = await db.Users.OrderBy(u => u.Email).ToListAsync();
        users.Should().HaveCount(2);
        users[0].Email.Should().Be("admin@taskpro.local");
        users[0].Role.Should().Be(UserRole.Admin);
        users[0].PasswordHash.Should().NotBeNullOrWhiteSpace();
        users[1].Email.Should().Be("user@taskpro.local");
        users[1].Role.Should().Be(UserRole.Member);
        users[1].PasswordHash.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task SeedUsersAsync_WhenUsersAlreadyExist_ShouldNotDuplicate()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var db = new AppDbContext(options);

        await AppDbSeeder.SeedUsersAsync(
            db,
            [new SeedUser("Admin", "admin@taskpro.local", "TaskPro123!", UserRole.Admin)]);

        await AppDbSeeder.SeedUsersAsync(
            db,
            [new SeedUser("Other", "other@taskpro.local", "TaskPro123!", UserRole.Member)]);

        var count = await db.Users.CountAsync();
        count.Should().Be(1);
    }
}


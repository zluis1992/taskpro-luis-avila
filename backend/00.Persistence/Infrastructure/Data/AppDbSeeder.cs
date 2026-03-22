using Domain.Entity;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public readonly record struct SeedUser(string Name, string Email, string Password, UserRole Role);

public static class AppDbSeeder
{
    public static async Task SeedUsersAsync(AppDbContext db, IEnumerable<SeedUser> users, CancellationToken cancellationToken = default)
    {
        if (await db.Users.AnyAsync(cancellationToken))
            return;

        var entities = users
            .Select(u => new User
            {
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(u.Password, workFactor: 12)
            })
            .ToList();

        db.Users.AddRange(entities);
        await db.SaveChangesAsync(cancellationToken);
    }
}

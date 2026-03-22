using Domain.Entity;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

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
                PasswordHash = HashPassword(u.Password)
            })
            .ToList();

        db.Users.AddRange(entities);
        await db.SaveChangesAsync(cancellationToken);
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}


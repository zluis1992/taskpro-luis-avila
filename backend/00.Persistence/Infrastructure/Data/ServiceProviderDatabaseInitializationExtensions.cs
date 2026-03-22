using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Data;

public static class ServiceProviderDatabaseInitializationExtensions
{
    public static async Task InitializeDatabaseAsync(this IServiceProvider services, CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();
        var runner = scope.ServiceProvider.GetRequiredService<DatabaseInitializationRunner>();
        await runner.RunAsync(cancellationToken);
    }
}

